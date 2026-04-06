import { Request, Response, NextFunction } from 'express';

export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!/^[a-f\d]{24}$/i.test(id)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_ID', message: `Invalid ${paramName} format` },
      });
      return;
    }
    next();
  };
};
