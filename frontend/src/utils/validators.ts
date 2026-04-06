export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
  const maxSize = 2 * 1024 * 1024;
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};

export const isValidSignatureFile = (file: File): boolean => {
  const allowedTypes = ['image/png'];
  const maxSize = 1 * 1024 * 1024;
  return allowedTypes.includes(file.type) && file.size <= maxSize;
};
