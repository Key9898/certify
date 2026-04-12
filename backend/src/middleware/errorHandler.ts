import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

const getErrorCode = (err: AppError): string => {
  if (err.code) return err.code;
  if (err.name === 'UnauthorizedError') return 'UNAUTHORIZED';
  if (err.message?.includes('invalid token')) return 'INVALID_TOKEN';
  if (err.message?.includes('jwt expired')) return 'TOKEN_EXPIRED';
  if (err.message?.includes('jwt malformed')) return 'INVALID_TOKEN';
  if (err.message?.includes('no authorization token')) return 'TOKEN_MISSING';
  return 'INTERNAL_ERROR';
};

const getErrorMessage = (err: AppError, statusCode: number): string => {
  if (statusCode === 500) return 'Internal server error';
  if (err.message && !err.message.includes('Internal server error'))
    return err.message;
  return 'An error occurred';
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  void next;
  const statusCode = err.statusCode || err.status || 500;
  const errorCode = getErrorCode(err);
  const message = getErrorMessage(err, statusCode);

  if (statusCode === 500) {
    logger.error('ErrorHandler', 'Unhandled server error', err);
  } else {
    logger.warn('ErrorHandler', `Client error: ${errorCode}`, {
      statusCode,
      path: _req.path,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
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
