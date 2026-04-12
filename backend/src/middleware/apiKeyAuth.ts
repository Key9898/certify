import { Request, Response, NextFunction } from 'express';
import { ApiKey } from '../models/ApiKey';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { logSecurityEvent } from '../utils/logger';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (keyId: string, limit: number): boolean => {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const entry = rateLimitStore.get(keyId);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(keyId, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
};

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000);

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
      error: {
        code: 'UNAUTHORIZED',
        message:
          'API key required. Use Authorization: Bearer <key> or X-Api-Key header.',
      },
    });
    return;
  }

  const apiKey = await ApiKey.findOne({ key, isActive: true });

  if (!apiKey) {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid or revoked API key.',
      },
    });
    return;
  }

  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
    logSecurityEvent('Expired API key used', { keyId: apiKey._id.toString() });
    res.status(401).json({
      success: false,
      error: { code: 'API_KEY_EXPIRED', message: 'API key has expired.' },
    });
    return;
  }

  const rateLimit = apiKey.rateLimit ?? 100;
  if (!checkRateLimit(apiKey._id.toString(), rateLimit)) {
    logSecurityEvent('API key rate limit exceeded', {
      keyId: apiKey._id.toString(),
      limit: rateLimit,
    });
    res.status(429).json({
      success: false,
      error: { code: 'RATE_LIMIT', message: 'API key rate limit exceeded.' },
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

  ApiKey.findByIdAndUpdate(apiKey._id, { lastUsedAt: new Date() }).catch(
    () => {}
  );

  (req as AuthenticatedRequest).user = user;
  next();
};
