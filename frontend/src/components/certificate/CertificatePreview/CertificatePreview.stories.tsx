import type { Meta, StoryObj } from '@storybook/react-vite';
import { CertificatePreview } from './CertificatePreview';

const meta: Meta<typeof CertificatePreview> = {
  title: 'Certificate/CertificatePreview',
  component: CertificatePreview,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CertificatePreview>;

const baseData = {
  recipientName: 'John Smith',
  certificateTitle: 'Certificate of Excellence',
  description: 'For outstanding performance in Advanced TypeScript',
  issueDate: '2024-03-15',
  issuerName: 'Tech Academy',
  primaryColor: '#3B82F6',
  secondaryColor: '#64748B',
};

export const Default: Story = {
  args: { data: baseData },
};

export const WithDescription: Story = {
  args: {
    data: {
      ...baseData,
      description:
        'For successfully completing the React Development Bootcamp with distinction.',
    },
  },
};

export const EmptyFields: Story = {
  args: {
    data: {
      recipientName: '',
      certificateTitle: '',
      issueDate: '',
      issuerName: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
    },
  },
};

export const CustomColor: Story = {
  args: {
    data: {
      ...baseData,
      primaryColor: '#7C3AED',
      secondaryColor: '#A78BFA',
    },
  },
};

export const GreenTheme: Story = {
  args: {
    data: {
      ...baseData,
      primaryColor: '#16A34A',
      secondaryColor: '#4ADE80',
      certificateTitle: 'Certificate of Completion',
      recipientName: 'Jane Doe',
      issuerName: 'Code School',
    },
  },
};
