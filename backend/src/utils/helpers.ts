import mongoose from 'mongoose';

export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const createError = (message: string, statusCode: number, code?: string) => {
  const error = new Error(message) as Error & { statusCode: number; code?: string };
  error.statusCode = statusCode;
  if (code) error.code = code;
  return error;
};
