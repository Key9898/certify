import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { buildAppUser, isWorkspaceAdmin } from '../services/workspaceService';
import { getAuth0RuntimeConfig } from '../config/auth0';

interface Auth0ManagementToken {
  access_token?: string;
  token_type?: string;
}

interface Auth0Error {
  statusCode?: number;
  error?: string;
  message?: string;
  errorCode?: string;
  error_description?: string;
  code?: string;
}

const getAuth0ManagementToken = async (): Promise<string | null> => {
  const mgmtClientId = process.env.AUTH0_MGMT_CLIENT_ID;
  const mgmtClientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
  const { domain } = getAuth0RuntimeConfig();

  if (!mgmtClientId || !mgmtClientSecret || !domain) {
    return null;
  }

  try {
    const tokenRes = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: mgmtClientId,
        client_secret: mgmtClientSecret,
        audience: `https://${domain}/api/v2/`,
      }),
    });

    const tokenData = (await tokenRes.json()) as Auth0ManagementToken;
    return tokenData.access_token || null;
  } catch (err) {
    console.error('Failed to get Auth0 Management API token:', err);
    return null;
  }
};

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required.',
        },
      });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 8 characters long.',
        },
      });
      return;
    }

    if (currentPassword === newPassword) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be different from current password.',
        },
      });
      return;
    }

    const user = req.user!;
    const auth0Id = user.auth0Id;
    const { domain } = getAuth0RuntimeConfig();

    if (!domain) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Auth0 configuration is missing.',
        },
      });
      return;
    }

    const clientId =
      process.env.AUTH0_CLIENT_ID || process.env.VITE_AUTH0_CLIENT_ID;

    if (!clientId) {
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_ERROR',
          message: 'Auth0 client configuration is missing.',
        },
      });
      return;
    }

    try {
      const verifyRes = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'password',
          client_id: clientId,
          username: user.email,
          password: currentPassword,
          scope: 'openid',
        }),
      });

      if (!verifyRes.ok) {
        const verifyError = (await verifyRes.json()) as Auth0Error;
        if (verifyRes.status === 401 || verifyRes.status === 400) {
          res.status(401).json({
            success: false,
            error: {
              code: 'INVALID_PASSWORD',
              message: 'Current password is incorrect.',
            },
          });
          return;
        }
        throw new Error(
          verifyError.error_description ||
            verifyError.message ||
            'Password verification failed'
        );
      }
    } catch (verifyErr) {
      if ((verifyErr as { message?: string }).message?.includes('incorrect')) {
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_PASSWORD',
            message: 'Current password is incorrect.',
          },
        });
        return;
      }
      throw verifyErr;
    }

    const accessToken = await getAuth0ManagementToken();

    if (!accessToken) {
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH0_ERROR',
          message: 'Failed to authenticate with Auth0 Management API.',
        },
      });
      return;
    }

    const updateRes = await fetch(
      `https://${domain}/api/v2/users/${encodeURIComponent(auth0Id)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          password: newPassword,
          connection: 'Username-Password-Authentication',
        }),
      }
    );

    if (!updateRes.ok) {
      const updateError = (await updateRes.json()) as Auth0Error;
      console.error('Auth0 password update error:', updateError);

      if (
        updateError.message?.includes('PasswordStrengthError') ||
        updateError.code === 'invalid_password'
      ) {
        res.status(400).json({
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message:
              'Password does not meet security requirements. Please use a stronger password.',
          },
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH0_ERROR',
          message: updateError.message || 'Failed to update password in Auth0.',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'Password changed successfully.' },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const auth0Id = user.auth0Id;

    await User.findByIdAndDelete(user._id);

    const mgmtClientId = process.env.AUTH0_MGMT_CLIENT_ID;
    const mgmtClientSecret = process.env.AUTH0_MGMT_CLIENT_SECRET;
    const { domain } = getAuth0RuntimeConfig();

    if (mgmtClientId && mgmtClientSecret && domain) {
      try {
        const tokenRes = await fetch(`https://${domain}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: mgmtClientId,
            client_secret: mgmtClientSecret,
            audience: `https://${domain}/api/v2/`,
          }),
        });
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        if (tokenData.access_token) {
          await fetch(
            `https://${domain}/api/v2/users/${encodeURIComponent(auth0Id)}`,
            {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${tokenData.access_token}` },
            }
          );
        }
      } catch (err) {
        console.error('Failed to delete Auth0 user (non-fatal):', err);
      }
    }

    res.json({ success: true, data: null });
  } catch (error) {
    next(error);
  }
};

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN_REGEX = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

export const updateSettings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { defaultLogo, defaultColors, organizationName, whiteLabel } =
      req.body as {
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

    if (
      defaultColors?.primary &&
      !HEX_COLOR_REGEX.test(defaultColors.primary)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid primary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (
      defaultColors?.secondary &&
      !HEX_COLOR_REGEX.test(defaultColors.secondary)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid secondary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (
      whiteLabel?.primaryColor &&
      !HEX_COLOR_REGEX.test(whiteLabel.primaryColor)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid white-label primary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (
      whiteLabel?.secondaryColor &&
      !HEX_COLOR_REGEX.test(whiteLabel.secondaryColor)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid white-label secondary color. Use #RRGGBB format.',
        },
      });
      return;
    }

    if (
      whiteLabel?.supportEmail &&
      !EMAIL_REGEX.test(whiteLabel.supportEmail)
    ) {
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
          message:
            'Invalid custom domain. Use a hostname like certificates.example.com.',
        },
      });
      return;
    }

    const updateFields: Record<string, unknown> = {};
    if (defaultLogo !== undefined)
      updateFields['settings.defaultLogo'] = defaultLogo;
    if (defaultColors?.primary)
      updateFields['settings.defaultColors.primary'] = defaultColors.primary;
    if (defaultColors?.secondary)
      updateFields['settings.defaultColors.secondary'] =
        defaultColors.secondary;

    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(
        req.user!._id,
        { $set: updateFields },
        { new: true }
      );
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
        organizationUpdateFields.name =
          organizationName.trim() || req.user!.name;
      }

      if (whiteLabel) {
        if (whiteLabel.brandName !== undefined) {
          organizationUpdateFields['whiteLabel.brandName'] =
            whiteLabel.brandName.trim();
        }
        if (whiteLabel.logoUrl !== undefined) {
          organizationUpdateFields['whiteLabel.logoUrl'] =
            whiteLabel.logoUrl.trim();
        }
        if (whiteLabel.primaryColor) {
          organizationUpdateFields['whiteLabel.primaryColor'] =
            whiteLabel.primaryColor;
        }
        if (whiteLabel.secondaryColor) {
          organizationUpdateFields['whiteLabel.secondaryColor'] =
            whiteLabel.secondaryColor;
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
          organizationUpdateFields['whiteLabel.hidePoweredBy'] =
            whiteLabel.hidePoweredBy;
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
