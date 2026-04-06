import type { BatchJob } from '@/types/batch';

export const MOCK_BATCH_CSV_ROWS: Record<string, string>[] = [
  {
    recipientName: 'Alice Johnson',
    recipientEmail: 'alice@example.com',
    certificateTitle: 'Certificate of Excellence',
    issuerName: 'Tech Academy',
    issueDate: '2024-03-15',
    description: 'For outstanding performance in Advanced TypeScript',
  },
  {
    recipientName: 'Bob Smith',
    recipientEmail: 'bob@example.com',
    certificateTitle: 'Certificate of Excellence',
    issuerName: 'Tech Academy',
    issueDate: '2024-03-15',
    description: 'For outstanding performance in Advanced TypeScript',
  },
  {
    recipientName: 'Carol White',
    recipientEmail: 'carol@example.com',
    certificateTitle: 'Certificate of Excellence',
    issuerName: 'Tech Academy',
    issueDate: '2024-03-15',
    description: 'For outstanding performance in Advanced TypeScript',
  },
];

export const MOCK_BATCH_JOB_PROCESSING: BatchJob = {
  _id: 'batch-job-1',
  templateId: 'template-1',
  status: 'processing',
  totalCertificates: 3,
  processedCertificates: 1,
  data: MOCK_BATCH_CSV_ROWS,
  results: [
    {
      recipientName: 'Alice Johnson',
      status: 'success',
      certificateId: 'cert-001',
      pdfUrl: 'https://example.com/cert-alice.pdf',
    },
  ],
  createdBy: 'user-1',
  createdAt: '2024-03-15T10:00:00.000Z',
  updatedAt: '2024-03-15T10:01:00.000Z',
};

export const MOCK_BATCH_JOB_COMPLETED: BatchJob = {
  _id: 'batch-job-2',
  templateId: 'template-1',
  status: 'completed',
  totalCertificates: 3,
  processedCertificates: 3,
  data: MOCK_BATCH_CSV_ROWS,
  results: [
    {
      recipientName: 'Alice Johnson',
      status: 'success',
      certificateId: 'cert-001',
      pdfUrl: 'https://example.com/cert-alice.pdf',
    },
    {
      recipientName: 'Bob Smith',
      status: 'success',
      certificateId: 'cert-002',
      pdfUrl: 'https://example.com/cert-bob.pdf',
    },
    {
      recipientName: 'Carol White',
      status: 'failed',
      error: 'Template not found',
    },
  ],
  createdBy: 'user-1',
  createdAt: '2024-03-15T10:00:00.000Z',
  updatedAt: '2024-03-15T10:05:00.000Z',
};
