import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { buildAppUser, isWorkspaceAdmin } from '../services/workspaceService';

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_REGEX = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { defaultLogo, defaultColors, organizationName, whiteLabel } = req.body as {
      defaultLogo?: string;
      defaultColors?: { primary?: string; secondary?: string };
      organizationName?: string;
      whiteLabel?: {
        brandName?: string;
        logoUrl?: string;
        primaryColor?: string;
        secondaryColor?: string;
        supportEmail?: string;
        customDomain?: string;
        hidePoweredBy?: boolean;
      };
    };

    if (defaultColors?.primary && !HEX_COLOR_REGEX.test(defaultColors.primary)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid primary color. Use #RRGGBB format.' },
      });
      return;
    }

    if (defaultColors?.secondary && !HEX_COLOR_REGEX.test(defaultColors.secondary)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid secondary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (whiteLabel?.primaryColor && !HEX_COLOR_REGEX.test(whiteLabel.primaryColor)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid white-label primary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (whiteLabel?.secondaryColor && !HEX_COLOR_REGEX.test(whiteLabel.secondaryColor)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid white-label secondary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (whiteLabel?.supportEmail && !EMAIL_REGEX.test(whiteLabel.supportEmail)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid white-label support email address.',
        },
      });
      return;
    }

    if (
      whiteLabel?.customDomain !== undefined &&
      whiteLabel.customDomain !== '' &&
      !DOMAIN_REGEX.test(whiteLabel.customDomain)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid custom domain. Use a hostname like certificates.example.com.',
        },
      });
      return;
    }

    const updateFields: Record<string, unknown> = {};
    if (defaultLogo !== undefined) updateFields['settings.defaultLogo'] = defaultLogo;
    if (defaultColors?.primary) updateFields['settings.defaultColors.primary'] = defaultColors.primary;
    if (defaultColors?.secondary)
      updateFields['settings.defaultColors.secondary'] = defaultColors.secondary;

    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(req.user!._id, { $set: updateFields }, { new: true });
    }

    const shouldUpdateOrganization =
      organizationName !== undefined || whiteLabel !== undefined;

    if (shouldUpdateOrganization) {
      if (!isWorkspaceAdmin(req.user!)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only workspace admins can update white-label settings.',
          },
        });
        return;
      }

      if (!req.user!.organizationId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'NO_WORKSPACE',
            message: 'No workspace is attached to this user.',
          },
        });
        return;
      }

      const organizationUpdateFields: Record<string, unknown> = {};

      if (organizationName !== undefined) {
        organizationUpdateFields.name = organizationName.trim() || req.user!.name;
      }

      if (whiteLabel) {
        if (whiteLabel.brandName !== undefined) {
          organizationUpdateFields['whiteLabel.brandName'] = whiteLabel.brandName.trim();
        }
        if (whiteLabel.logoUrl !== undefined) {
          organizationUpdateFields['whiteLabel.logoUrl'] = whiteLabel.logoUrl.trim();
        }
        if (whiteLabel.primaryColor) {
          organizationUpdateFields['whiteLabel.primaryColor'] = whiteLabel.primaryColor;
        }
        if (whiteLabel.secondaryColor) {
          organizationUpdateFields['whiteLabel.secondaryColor'] = whiteLabel.secondaryColor;
        }
        if (whiteLabel.supportEmail !== undefined) {
          organizationUpdateFields['whiteLabel.supportEmail'] =
            whiteLabel.supportEmail.trim().toLowerCase();
        }
        if (whiteLabel.customDomain !== undefined) {
          organizationUpdateFields['whiteLabel.customDomain'] =
            whiteLabel.customDomain.trim().toLowerCase();
        }
        if (whiteLabel.hidePoweredBy !== undefined) {
          organizationUpdateFields['whiteLabel.hidePoweredBy'] = whiteLabel.hidePoweredBy;
        }
      }

      await Organization.findByIdAndUpdate(
        req.user!.organizationId,
        { $set: organizationUpdateFields },
        { new: true }
      );
    }

    const user = await buildAppUser(req.user!._id.toString());

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
