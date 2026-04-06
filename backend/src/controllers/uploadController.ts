import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { getSignedUploadUrl } from '../services/cloudinaryService';

export const getUploadSignature = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { folder } = req.query;
    const allowedFolders = ['logos', 'signatures'];

    if (!folder || !allowedFolders.includes(folder as string)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid folder. Use: logos or signatures' },
      });
      return;
    }

    const signatureData = await getSignedUploadUrl(folder as string);
    res.json({ success: true, data: signatureData });
  } catch (error) {
    next(error);
  }
};
