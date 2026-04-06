export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSizeBytes?: number;
  onFileSelect: (file: File) => void;
  previewUrl?: string;
  error?: string;
  hint?: string;
  isUploading?: boolean;
  disabled?: boolean;
}
