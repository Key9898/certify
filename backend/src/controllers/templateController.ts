import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getTemplateById } from '../services/templateService';
import {
  Template,
  type ITemplateField,
  type TemplateMode,
} from '../models/Template';
import { AuthenticatedRequest } from '../types';
import {
  canManageWorkspaceResource,
  getWorkspaceMemberIds,
} from '../services/workspaceService';

export const getPublicTemplateCount = async (
  _req: unknown,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const count = await Template.countDocuments({ isPublic: true });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

export const listTemplates = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const templates = await Template.find({
      $or: [{ isPublic: true }, { createdBy: { $in: workspaceUserIds } }],
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const template = await getTemplateById(req.params.id);
    if (!template) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Template not found' },
      });
      return;
    }

    const workspaceUserIds = await getWorkspaceMemberIds(req.user!);
    const canAccess =
      template.isPublic ||
      workspaceUserIds.some(
        (memberId) => memberId.toString() === template.createdBy.toString()
      );
    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this template.',
        },
      });
      return;
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

const VALID_CATEGORIES = ['academic', 'corporate', 'event', 'general'];
const VALID_PRESET_TEMPLATES = [
  'certificate-modern',
  'certificate-classic',
  'certificate-base',
];
const TEMPLATE_MODE_BACKGROUND = 'background';
const TEMPLATE_MODE_PRESET = 'preset';
const VALID_TEMPLATE_FIELD_NAMES = [
  'recipientName',
  'certificateTitle',
  'description',
  'issueDate',
  'expiryDate',
  'issuerName',
  'issuerSignature',
  'organizationLogo',
  'certificateId',
] as const;

const FIELD_TYPE_BY_NAME: Record<
  (typeof VALID_TEMPLATE_FIELD_NAMES)[number],
  ITemplateField['type']
> = {
  recipientName: 'text',
  certificateTitle: 'text',
  description: 'text',
  issueDate: 'date',
  expiryDate: 'date',
  issuerName: 'text',
  issuerSignature: 'image',
  organizationLogo: 'image',
  certificateId: 'text',
};

const REQUIRED_FIELD_NAMES = new Set([
  'recipientName',
  'certificateTitle',
  'issueDate',
  'issuerName',
]);

type TemplatePayload = {
  name?: string;
  description?: string;
  category?: string;
  mode?: TemplateMode;
  htmlContent?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundImageUrl?: string;
  fields?: unknown[];
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const sanitizeString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;

const sanitizeHexColor = (value: unknown, fallback: string): string => {
  const candidate = sanitizeString(value);
  return candidate && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(candidate)
    ? candidate
    : fallback;
};

const sanitizeTemplateMode = (value: unknown): TemplateMode =>
  value === TEMPLATE_MODE_BACKGROUND
    ? TEMPLATE_MODE_BACKGROUND
    : TEMPLATE_MODE_PRESET;

const sanitizeTemplateFields = (fields: unknown): ITemplateField[] => {
  if (!Array.isArray(fields)) {
    return [];
  }

  const usedNames = new Set<string>();

  return fields.reduce<ITemplateField[]>((result, field, index) => {
    if (!isRecord(field)) {
      throw new Error(`Field ${index + 1} is invalid.`);
    }

    const rawName = sanitizeString(field.name);
    if (
      !rawName ||
      !VALID_TEMPLATE_FIELD_NAMES.includes(
        rawName as (typeof VALID_TEMPLATE_FIELD_NAMES)[number]
      )
    ) {
      throw new Error(`Field ${index + 1} uses an unsupported source key.`);
    }

    if (usedNames.has(rawName)) {
      throw new Error(`Field "${rawName}" is duplicated.`);
    }
    usedNames.add(rawName);

    const resolvedType =
      FIELD_TYPE_BY_NAME[rawName as keyof typeof FIELD_TYPE_BY_NAME];
    const position = isRecord(field.position) ? field.position : {};
    const size = isRecord(field.size) ? field.size : {};
    const style = isRecord(field.style) ? field.style : {};

    result.push({
      name: rawName,
      label: sanitizeString(field.label) || rawName,
      type: resolvedType,
      required: REQUIRED_FIELD_NAMES.has(rawName) || field.required === true,
      visible: field.visible !== false,
      defaultValue: sanitizeString(field.defaultValue),
      position: {
        x: clamp(Number(position.x) || 50, 0, 100),
        y: clamp(Number(position.y) || 50, 0, 100),
      },
      size: {
        width: clamp(
          Number(size.width) || (resolvedType === 'image' ? 18 : 32),
          8,
          100
        ),
        height:
          resolvedType === 'image' && Number(size.height)
            ? clamp(Number(size.height), 5, 60)
            : undefined,
      },
      style:
        resolvedType === 'image'
          ? undefined
          : {
              fontSize: clamp(Number(style.fontSize) || 24, 10, 96),
              fontWeight: clamp(Number(style.fontWeight) || 600, 300, 900),
              fontFamily:
                sanitizeString(style.fontFamily) || 'Arial, sans-serif',
              color: sanitizeHexColor(style.color, '#111827'),
              textAlign:
                style.textAlign === 'left' || style.textAlign === 'right'
                  ? style.textAlign
                  : 'center',
              lineHeight: clamp(Number(style.lineHeight) || 1.2, 0.8, 2.5),
              letterSpacing: clamp(Number(style.letterSpacing) || 0, -2, 20),
              fontStyle: style.fontStyle === 'italic' ? 'italic' : 'normal',
              textTransform:
                style.textTransform === 'uppercase' ? 'uppercase' : 'none',
            },
    });

    return result;
  }, []);
};

const buildPresetStyles = (
  primaryColor: string,
  secondaryColor: string
): string =>
  `--primary-color: ${primaryColor}; --secondary-color: ${secondaryColor};`;

const buildTemplateThumbnail = (
  name: string,
  primaryColor: string,
  secondaryColor: string
): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${primaryColor}" />
          <stop offset="100%" stop-color="${secondaryColor}" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="36" fill="url(#bg)" />
      <rect x="64" y="64" width="1072" height="772" rx="24" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" />
      <text x="600" y="350" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="42" font-weight="700">
        ${name}
      </text>
      <text x="600" y="420" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-family="Arial, sans-serif" font-size="24">
        Custom Certify Template
      </text>
      <text x="600" y="730" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif" font-size="18" letter-spacing="6">
        PREVIEW
      </text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export const createTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const payload = req.body as TemplatePayload;
    const name = sanitizeString(payload.name);
    const description =
      typeof payload.description === 'string' ? payload.description.trim() : '';
    const category = sanitizeString(payload.category);
    const mode = sanitizeTemplateMode(payload.mode);
    const primaryColor = sanitizeHexColor(payload.primaryColor, '#3B82F6');
    const secondaryColor = sanitizeHexColor(payload.secondaryColor, '#64748B');

    if (!name || !category) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'name and category are required.',
        },
      });
      return;
    }

    if (!VALID_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`,
        },
      });
      return;
    }

    let htmlContent = payload.htmlContent;
    let thumbnail = buildTemplateThumbnail(name, primaryColor, secondaryColor);
    let styles = buildPresetStyles(primaryColor, secondaryColor);
    let fields: ITemplateField[] = [];
    let backgroundImageUrl: string | undefined;

    if (mode === TEMPLATE_MODE_BACKGROUND) {
      backgroundImageUrl = sanitizeString(payload.backgroundImageUrl);
      if (!backgroundImageUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'backgroundImageUrl is required for background templates.',
          },
        });
        return;
      }

      try {
        fields = sanitizeTemplateFields(payload.fields);
      } catch (error) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              error instanceof Error
                ? error.message
                : 'Invalid template fields.',
          },
        });
        return;
      }

      if (fields.filter((field) => field.visible).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'At least one visible field is required for a background template.',
          },
        });
        return;
      }

      htmlContent = 'custom-background';
      thumbnail = backgroundImageUrl;
      styles = '';
    } else if (!htmlContent || !VALID_PRESET_TEMPLATES.includes(htmlContent)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid htmlContent. Use: ${VALID_PRESET_TEMPLATES.join(', ')}`,
        },
      });
      return;
    }

    const template = new Template({
      name,
      description,
      category,
      mode,
      thumbnail,
      htmlContent,
      styles,
      backgroundImageUrl,
      fields,
      isPublic: false,
      createdBy: new mongoose.Types.ObjectId(req.user!._id.toString()),
    });

    await template.save();
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Template not found or cannot be modified.',
        },
      });
      return;
    }

    if (template.isPublic) {
      res.status(400).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Public templates cannot be modified.',
        },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(
      req.user!,
      template.createdBy
    );
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You cannot modify this team template.',
        },
      });
      return;
    }

    const payload = req.body as TemplatePayload;
    const nextName = sanitizeString(payload.name) || template.name;
    const nextDescription =
      payload.description !== undefined
        ? String(payload.description).trim()
        : template.description;
    const nextCategory = sanitizeString(payload.category) || template.category;
    const nextMode = sanitizeTemplateMode(payload.mode ?? template.mode);
    const nextPrimaryColor = sanitizeHexColor(payload.primaryColor, '#3B82F6');
    const nextSecondaryColor = sanitizeHexColor(
      payload.secondaryColor,
      '#64748B'
    );

    if (!VALID_CATEGORIES.includes(nextCategory)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}`,
        },
      });
      return;
    }

    let nextHtmlContent = template.htmlContent;
    let nextThumbnail = template.thumbnail;
    let nextStyles = template.styles;
    let nextBackgroundImageUrl = template.backgroundImageUrl;
    let nextFields = template.fields as ITemplateField[];

    if (nextMode === TEMPLATE_MODE_BACKGROUND) {
      nextBackgroundImageUrl =
        sanitizeString(payload.backgroundImageUrl) ||
        template.backgroundImageUrl;

      if (!nextBackgroundImageUrl) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'backgroundImageUrl is required for background templates.',
          },
        });
        return;
      }

      if (payload.fields !== undefined) {
        try {
          nextFields = sanitizeTemplateFields(payload.fields);
        } catch (error) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message:
                error instanceof Error
                  ? error.message
                  : 'Invalid template fields.',
            },
          });
          return;
        }
      }

      if (nextFields.filter((field) => field.visible).length === 0) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'At least one visible field is required for a background template.',
          },
        });
        return;
      }

      nextHtmlContent = 'custom-background';
      nextThumbnail = nextBackgroundImageUrl;
      nextStyles = '';
    } else {
      const nextPresetTemplate =
        sanitizeString(payload.htmlContent) || template.htmlContent;
      if (!VALID_PRESET_TEMPLATES.includes(nextPresetTemplate)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid htmlContent. Use: ${VALID_PRESET_TEMPLATES.join(', ')}`,
          },
        });
        return;
      }

      nextHtmlContent = nextPresetTemplate;
      nextThumbnail = buildTemplateThumbnail(
        nextName,
        nextPrimaryColor,
        nextSecondaryColor
      );
      nextStyles = buildPresetStyles(nextPrimaryColor, nextSecondaryColor);
      nextBackgroundImageUrl = undefined;
      nextFields = [];
    }

    template.name = nextName;
    template.description = nextDescription;
    template.category = nextCategory as typeof template.category;
    template.mode = nextMode;
    template.htmlContent = nextHtmlContent;
    template.thumbnail = nextThumbnail;
    template.styles = nextStyles;
    template.backgroundImageUrl = nextBackgroundImageUrl;
    template.fields = nextFields;

    await template.save();
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Template not found or cannot be deleted.',
        },
      });
      return;
    }

    if (template.isPublic) {
      res.status(400).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Public templates cannot be deleted.',
        },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(
      req.user!,
      template.createdBy
    );
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You cannot delete this team template.',
        },
      });
      return;
    }

    await template.deleteOne();

    res.json({
      success: true,
      data: { message: 'Template deleted successfully.' },
    });
  } catch (error) {
    next(error);
  }
};
