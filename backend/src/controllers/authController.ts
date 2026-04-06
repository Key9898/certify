import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { buildAppUser, ensureUserWorkspace } from '../services/workspaceService';

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

    if (!auth0Id || !email || !name) {
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
        email,
        name,
        avatar,
      });
    } else {
      user.email = email;
      user.name = name;
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
