import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next;
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    logger.error('ErrorHandler', 'Unhandled server error', err);
  } else {
    logger.warn('ErrorHandler', `Client error: ${err.code || 'UNKNOWN'}`, {
      statusCode,
      path: _req.path,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
  });
};

export const notFound = (req: Request, res: Response): void => {
  logger.warn('Router', 'Route not found', { path: req.originalUrl });
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} not found`,
    },
  });
};
