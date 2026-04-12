import { useState, useCallback } from 'react';
import { apiRequest } from '@/utils/api';

interface UploadSignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
}

export const useCloudinary = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(
    async (
      file: File,
      folder: 'logos' | 'signatures' | 'template-backgrounds'
    ): Promise<UploadResult | null> => {
      setIsUploading(true);
      setError(null);
      try {
        const sigResult = await apiRequest<UploadSignature>(
          `/upload/signature?folder=${folder}`
        );
        if (!sigResult.data) throw new Error('Failed to get upload signature');

        const { signature, timestamp, cloudName, apiKey } = sigResult.data;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('signature', signature);
        formData.append('timestamp', timestamp.toString());
        formData.append('api_key', apiKey);
        formData.append('folder', `certify/${folder}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) throw new Error('Upload failed');
        return (await response.json()) as UploadResult;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed';
        setError(msg);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  return { upload, isUploading, error };
};
