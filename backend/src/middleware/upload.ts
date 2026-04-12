import multer from 'multer';
import type { Request } from 'express';
import { validateUpload, sanitizeFilename } from '../utils/fileValidation';

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const validation = validateUpload(file);

  if (validation.valid) {
    file.originalname = validation.sanitizedFilename;
    cb(null, true);
  } else {
    cb(new Error(validation.errors.join(' ')));
  }
};

export const csvUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('file');

export const createSecureUpload = (options: {
  allowedExtensions: string[];
  maxFileSize: number;
}) => {
  return multer({
    storage,
    fileFilter: (
      _req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ): void => {
      const ext = file.originalname
        .toLowerCase()
        .slice(file.originalname.lastIndexOf('.'));
      if (!options.allowedExtensions.includes(ext)) {
        cb(
          new Error(
            `Invalid file type. Allowed: ${options.allowedExtensions.join(', ')}`
          )
        );
        return;
      }
      file.originalname = sanitizeFilename(file.originalname);
      cb(null, true);
    },
    limits: { fileSize: options.maxFileSize },
  });
};
