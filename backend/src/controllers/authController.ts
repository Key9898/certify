import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { buildAppUser, ensureUserWorkspace } from '../services/workspaceService';

const deriveDisplayName = (name?: string, email?: string, auth0Id?: string): string => {
  const explicitName = name?.trim();
  if (explicitName) {
    return explicitName;
  }

  const emailLocalPart = email?.split('@')[0]?.trim();
  if (emailLocalPart) {
    return emailLocalPart.replace(/[._-]+/g, ' ');
  }

  return auth0Id || 'Member';
};

export const getMe = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const appUser = await buildAppUser(req.user!);
    res.json({ success: true, data: appUser });
  } catch (error) {
    next(error);
  }
};

export const syncUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    const { email, name, avatar } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = deriveDisplayName(name, normalizedEmail, auth0Id);

    if (!auth0Id || !normalizedEmail) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
      });
      return;
    }

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = new User({
        auth0Id,
        email: normalizedEmail,
        name: normalizedName,
        avatar,
      });
    } else {
      user.email = normalizedEmail;
      user.name = normalizedName;
      user.avatar = avatar;
    }

    await user.save();
    await ensureUserWorkspace(user);

    const appUser = await buildAppUser(user);
    res.json({ success: true, data: appUser });
  } catch (error) {
    next(error);
  }
};
