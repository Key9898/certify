import { Request } from 'express';
import { AuthResult } from 'express-oauth2-jwt-bearer';
import { IUserDocument } from '../models/User';

export interface AuthenticatedRequest extends Request {
  auth?: AuthResult;
  user?: IUserDocument;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export { IUserDocument };
