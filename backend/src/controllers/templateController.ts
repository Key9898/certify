import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { getTemplateById } from '../services/templateService';
import { Template } from '../models/Template';
import { AuthenticatedRequest } from '../types';
import {
  canManageWorkspaceResource,
  getWorkspaceMemberIds,
} from '../services/workspaceService';

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
      workspaceUserIds.some((memberId) => memberId.toString() === template.createdBy.toString());
    if (!canAccess) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this template.' },
      });
      return;
    }
    res.json({ success: true, data: template });
  } catch (error) {
    next(error);
  }
};

const VALID_CATEGORIES = ['academic', 'corporate', 'event', 'general'];
const VALID_HTML_TEMPLATES = ['certificate-modern', 'certificate-classic', 'certificate-base'];

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
    const { name, description, category, htmlContent, primaryColor, secondaryColor } =
      req.body as {
        name?: string;
        description?: string;
        category?: string;
        htmlContent?: string;
        primaryColor?: string;
        secondaryColor?: string;
      };

    if (!name || !category || !htmlContent) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name, category, and htmlContent are required.' },
      });
      return;
    }

    if (!VALID_CATEGORIES.includes(category)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Invalid category. Use: ${VALID_CATEGORIES.join(', ')}` },
      });
      return;
    }

    if (!VALID_HTML_TEMPLATES.includes(htmlContent)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid htmlContent. Use: ${VALID_HTML_TEMPLATES.join(', ')}`,
        },
      });
      return;
    }

    const template = new Template({
      name: name.trim(),
      description: description?.trim() || '',
      category,
      thumbnail: buildTemplateThumbnail(
        name.trim(),
        primaryColor || '#3B82F6',
        secondaryColor || '#64748B'
      ),
      htmlContent,
      styles: `--primary-color: ${primaryColor || '#3B82F6'}; --secondary-color: ${secondaryColor || '#64748B'};`,
      fields: [],
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
        error: { code: 'NOT_FOUND', message: 'Template not found or cannot be modified.' },
      });
      return;
    }

    if (template.isPublic) {
      res.status(400).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Public templates cannot be modified.' },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(req.user!, template.createdBy);
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot modify this team template.' },
      });
      return;
    }

    const { name, description, category, htmlContent, primaryColor, secondaryColor } = req.body as {
      name?: string;
      description?: string;
      category?: string;
      htmlContent?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };

    if (name) template.name = name.trim();
    if (description !== undefined) template.description = description.trim();
    if (category && VALID_CATEGORIES.includes(category)) template.category = category as typeof template.category;
    if (htmlContent && VALID_HTML_TEMPLATES.includes(htmlContent)) template.htmlContent = htmlContent;
    if (primaryColor || secondaryColor) {
      template.styles = `--primary-color: ${primaryColor || '#3B82F6'}; --secondary-color: ${secondaryColor || '#64748B'};`;
    }
    if (name || primaryColor || secondaryColor) {
      template.thumbnail = buildTemplateThumbnail(
        template.name,
        primaryColor || '#3B82F6',
        secondaryColor || '#64748B'
      );
    }

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
        error: { code: 'NOT_FOUND', message: 'Template not found or cannot be deleted.' },
      });
      return;
    }

    if (template.isPublic) {
      res.status(400).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Public templates cannot be deleted.' },
      });
      return;
    }

    const canManage = await canManageWorkspaceResource(req.user!, template.createdBy);
    if (!canManage) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You cannot delete this team template.' },
      });
      return;
    }

    await template.deleteOne();

    res.json({ success: true, data: { message: 'Template deleted successfully.' } });
  } catch (error) {
    next(error);
  }
};
