import type { Certificate } from '@/types';

export const MOCK_CERTIFICATES: Certificate[] = [
  {
    _id: 'cert-1',
    templateId: 'template-1',
    recipientName: 'John Smith',
    recipientEmail: 'john@example.com',
    certificateTitle: 'Certificate of Excellence',
    description: 'For outstanding performance in Advanced TypeScript',
    issueDate: '2024-03-15T00:00:00.000Z',
    issuerName: 'Tech Academy',
    certificateId: 'CERT001ABC',
    pdfUrl: undefined,
    createdBy: 'user-1',
    createdAt: '2024-03-15T10:00:00.000Z',
    updatedAt: '2024-03-15T10:00:00.000Z',
  },
  {
    _id: 'cert-2',
    templateId: 'template-2',
    recipientName: 'Jane Doe',
    recipientEmail: 'jane@example.com',
    certificateTitle: 'Certificate of Completion',
    description: 'For successfully completing the React Development Course',
    issueDate: '2024-02-20T00:00:00.000Z',
    issuerName: 'Code School',
    certificateId: 'CERT002DEF',
    pdfUrl: 'https://example.com/cert.pdf',
    createdBy: 'user-1',
    createdAt: '2024-02-20T10:00:00.000Z',
    updatedAt: '2024-02-20T10:00:00.000Z',
  },
];
