export interface BatchResult {
  recipientName: string;
  status: 'success' | 'failed';
  certificateId?: string;
  pdfUrl?: string;
  error?: string;
}

export interface BatchJob {
  _id: string;
  templateId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalCertificates: number;
  processedCertificates: number;
  data: Record<string, string>[];
  results: BatchResult[];
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BatchUploadPreview {
  total: number;
  preview: Record<string, string>[];
  rows: Record<string, string>[];
}

export interface StartBatchDto {
  templateId: string;
  data: Record<string, string>[];
}
