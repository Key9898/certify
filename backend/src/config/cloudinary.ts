import { v2 as cloudinary } from 'cloudinary';

export const configureCloudinary = (): void => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    cloudName === 'your-cloud-name' ||
    !apiKey ||
    !apiSecret
  ) {
    console.warn(
      '⚠️  Cloudinary not configured. File uploads will not work. Set CLOUDINARY_* vars in .env'
    );
    return;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured');
};

export { cloudinary };
