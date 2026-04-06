import type { Meta, StoryObj } from '@storybook/react-vite';
import { CertificateEditor } from './CertificateEditor';
import { MOCK_TEMPLATES } from '@/demo/mocks/templates';

const meta: Meta<typeof CertificateEditor> = {
  title: 'Certificate/CertificateEditor',
  component: CertificateEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof CertificateEditor>;

const noop = () => {};

export const Default: Story = {
  args: {
    template: MOCK_TEMPLATES[0],
    onComplete: noop,
    isSubmitting: false,
  },
};

export const AcademicTemplate: Story = {
  args: {
    template: MOCK_TEMPLATES[1],
    onComplete: noop,
    isSubmitting: false,
  },
};

export const EventTemplate: Story = {
  args: {
    template: MOCK_TEMPLATES[2],
    onComplete: noop,
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    template: MOCK_TEMPLATES[0],
    onComplete: noop,
    isSubmitting: true,
  },
};

