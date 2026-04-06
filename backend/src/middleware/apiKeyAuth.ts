import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';

export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const key =
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ??
    (req.headers['x-api-key'] as string | undefined) ??
    null;

  if (!key) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'API key required. Use Authorization: Bearer <key> or X-Api-Key header.' },
    });
    return;
  }

  const apiKey = await ApiKey.findOne({ key, isActive: true });

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_API_KEY', message: 'Invalid or revoked API key.' },
    });
    return;
  }

  const user = await User.findById(apiKey.createdBy);
  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'API key owner not found.' },
    });
    return;
  }

  // Update last used (fire and forget)
  ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() }).catch(() => {});

  (req as AuthenticatedRequest).user = user;
  next();
};
