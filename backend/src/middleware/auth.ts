import { auth } from 'express-oauth2-jwt-bearer';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { ensureUserWorkspace } from '../services/workspaceService';

// Lazy-initialize checkJwt so the server can start even without credentials configured.
// The middleware will return a 503 if Auth0 is not configured, instead of crashing at startup.
let _checkJwt: ReturnType<typeof auth> | null = null;

const getCheckJwt = (): ReturnType<typeof auth> | null => {
  if (_checkJwt) return _checkJwt;

  const audience = process.env.AUTH0_AUDIENCE;
  const domain = process.env.AUTH0_DOMAIN;

  if (!audience || !domain || audience === 'your-api-audience') {
    return null;
  }

  _checkJwt = auth({
    audience,
    issuerBaseURL: `https://${domain}`,
    tokenSigningAlg: 'RS256',
  });

  return _checkJwt;
};

export const checkJwt = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const jwtMiddleware = getCheckJwt();

  if (!jwtMiddleware) {
    res.status(503).json({
      success: false,
      error: {
        code: 'AUTH_NOT_CONFIGURED',
        message: 'Auth0 is not configured. Set AUTH0_AUDIENCE and AUTH0_DOMAIN in your .env file.',
      },
    });
    return;
  }

  jwtMiddleware(req, res, next);
};

export const attachUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth0Id = req.auth?.payload?.sub;
    if (!auth0Id) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
      return;
    }

    const user = await User.findOne({ auth0Id });
    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found. Please sync your account.',
        },
      });
      return;
    }

    req.user = await ensureUserWorkspace(user);
    next();
  } catch (error) {
    next(error);
  }
};
