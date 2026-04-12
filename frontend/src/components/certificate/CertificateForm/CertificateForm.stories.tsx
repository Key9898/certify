import type { Meta, StoryObj } from '@storybook/react-vite';
import { CertificateForm } from './CertificateForm';

const meta: Meta<typeof CertificateForm> = {
  title: 'Certificate/CertificateForm',
  component: CertificateForm,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CertificateForm>;

const noop = async () => {};

export const Default: Story = {
  args: {
    templateId: 'template-1',
    onSubmit: noop,
    isSubmitting: false,
  },
};

export const WithInitialData: Story = {
  args: {
    templateId: 'template-1',
    onSubmit: noop,
    isSubmitting: false,
    initialData: {
      recipientName: 'John Smith',
      recipientEmail: 'john@example.com',
      certificateTitle: 'Certificate of Excellence',
      description: 'For outstanding performance in Advanced TypeScript',
      issueDate: '2024-03-15',
      issuerName: 'Tech Academy',
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
    },
  },
};

export const Submitting: Story = {
  args: {
    templateId: 'template-1',
    onSubmit: noop,
    isSubmitting: true,
    initialData: {
      recipientName: 'Jane Doe',
      certificateTitle: 'Certificate of Completion',
      issueDate: '2024-03-15',
      issuerName: 'Code School',
    },
  },
};
