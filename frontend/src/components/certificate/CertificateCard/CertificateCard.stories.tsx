import type { Meta, StoryObj } from '@storybook/react-vite';
import { CertificateCard } from './CertificateCard';
import { MOCK_CERTIFICATES } from '@/demo/mocks/certificates';

const meta: Meta<typeof CertificateCard> = {
  title: 'Certificate/CertificateCard',
  component: CertificateCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CertificateCard>;

export const Default: Story = {
  args: { certificate: MOCK_CERTIFICATES[0] },
};

export const WithPdf: Story = {
  args: { certificate: MOCK_CERTIFICATES[1] },
};

export const WithActions: Story = {
  args: {
    certificate: MOCK_CERTIFICATES[0],
    onDownload: (cert) => alert(`Download: ${cert.certificateTitle}`),
    onDelete: (cert) => alert(`Delete: ${cert.certificateTitle}`),
  },
};

export const GeneratingPdf: Story = {
  args: {
    certificate: MOCK_CERTIFICATES[0],
    onDownload: () => {},
    isGeneratingPdf: true,
  },
};

export const NoPdfReady: Story = {
  args: {
    certificate: { ...MOCK_CERTIFICATES[0], pdfUrl: undefined },
    onDownload: (cert) => alert(`Generate PDF: ${cert.certificateTitle}`),
  },
};
