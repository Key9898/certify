import type { Meta, StoryObj } from '@storybook/react-vite';
import { CertificateList } from './CertificateList';
import { MOCK_CERTIFICATES } from '@/demo/mocks/certificates';

const meta: Meta<typeof CertificateList> = {
  title: 'Certificate/CertificateList',
  component: CertificateList,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CertificateList>;

export const Default: Story = {
  args: { certificates: MOCK_CERTIFICATES, isLoading: false },
};

export const WithActions: Story = {
  args: {
    certificates: MOCK_CERTIFICATES,
    isLoading: false,
    onDownload: (cert) => alert(`Download: ${cert.certificateTitle}`),
    onDelete: (cert) => alert(`Delete: ${cert.certificateTitle}`),
  },
};

export const Loading: Story = {
  args: { certificates: [], isLoading: true },
};

export const Empty: Story = {
  args: { certificates: [], isLoading: false },
};

export const GeneratingPdf: Story = {
  args: {
    certificates: MOCK_CERTIFICATES,
    isLoading: false,
    onDownload: () => {},
    generatingPdfId: MOCK_CERTIFICATES[0]._id,
  },
};
