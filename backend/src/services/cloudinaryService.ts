import { cloudinary } from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';

export const uploadImage = async (
  fileBuffer: Buffer,
  folder: string,
  publicId?: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: `certify/${folder}`,
      resource_type: 'image' as const,
    };
    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    cloudinary.uploader
      .upload_stream(uploadOptions, (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Upload failed'));
        resolve(result);
      })
      .end(fileBuffer);
  });
};

export const uploadPdf = async (
  pdfBuffer: Buffer,
  publicId: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'certify/pdfs',
          public_id: publicId,
          resource_type: 'raw',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));
          resolve(result);
        }
      )
      .end(pdfBuffer);
  });
};

export const deleteFile = async (
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

export const getSignedUploadUrl = async (
  folder: string
): Promise<{
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}> => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: `certify/${folder}` },
    process.env.CLOUDINARY_API_SECRET || ''
  );
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
  };
};
