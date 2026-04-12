import { logSecurityEvent } from './logger';

const FILE_SIGNATURES: Record<string, Buffer[]> = {
  csv: [],
  xlsx: [
    Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    Buffer.from([0x50, 0x4b, 0x05, 0x06]),
    Buffer.from([0x50, 0x4b, 0x07, 0x08]),
  ],
};

const ALLOWED_EXTENSIONS = ['.csv', '.xlsx'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DANGEROUS_EXTENSIONS = [
  '.exe',
  '.bat',
  '.cmd',
  '.com',
  '.pif',
  '.scr',
  '.vbs',
  '.js',
  '.jar',
  '.msi',
  '.sh',
  '.php',
  '.asp',
  '.aspx',
  '.jsp',
];

export const sanitizeFilename = (filename: string): string => {
  const sanitized = Array.from(filename)
    .map((char) => {
      const charCode = char.charCodeAt(0);
      if (charCode < 32 || '<>:"/\\|?*'.includes(char)) {
        return '_';
      }
      return char;
    })
    .join('')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '')
    .slice(0, 255);

  return sanitized || 'unnamed_file';
};

export const validateFileExtension = (filename: string): boolean => {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return false;
  }
  return ALLOWED_EXTENSIONS.includes(ext);
};

export const validateMimeType = (mimetype: string): boolean => {
  return ALLOWED_MIME_TYPES.includes(mimetype);
};

export const validateFileSignature = (
  buffer: Buffer,
  extension: string
): boolean => {
  const ext = extension
    .toLowerCase()
    .replace('.', '') as keyof typeof FILE_SIGNATURES;

  if (ext === 'csv') {
    return true;
  }

  const signatures = FILE_SIGNATURES[ext];
  if (!signatures || signatures.length === 0) {
    return true;
  }

  const header = buffer.subarray(0, 4);
  return signatures.some((sig) => header.equals(sig));
};

export const validateFileSize = (size: number): boolean => {
  return size > 0 && size <= MAX_FILE_SIZE;
};

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedFilename: string;
}

export const validateUpload = (
  file: Express.Multer.File
): FileValidationResult => {
  const errors: string[] = [];
  const sanitizedFilename = sanitizeFilename(file.originalname);

  if (!validateFileSize(file.size)) {
    errors.push(
      `File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024}MB`
    );
  }

  if (!validateFileExtension(file.originalname)) {
    errors.push(
      'Invalid or dangerous file extension. Only .csv and .xlsx are allowed.'
    );
    logSecurityEvent('Blocked dangerous file extension', {
      originalName: file.originalname,
      size: file.size,
    });
  }

  if (!validateMimeType(file.mimetype)) {
    errors.push('Invalid MIME type. Only CSV and XLSX files are allowed.');
  }

  if (
    file.buffer &&
    !validateFileSignature(
      file.buffer,
      file.originalname.slice(file.originalname.lastIndexOf('.'))
    )
  ) {
    errors.push('File signature does not match the claimed file type.');
    logSecurityEvent('File signature mismatch', {
      originalName: file.originalname,
      mimetype: file.mimetype,
    });
  }

  if (file.originalname !== sanitizedFilename) {
    logSecurityEvent('Filename sanitized', {
      original: file.originalname,
      sanitized: sanitizedFilename,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedFilename,
  };
};
