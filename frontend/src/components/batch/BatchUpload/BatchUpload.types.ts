export interface BatchUploadProps {
  onParsed: (rows: Record<string, string>[], file: File) => void;
  isLoading?: boolean;
  error?: string | null;
}
