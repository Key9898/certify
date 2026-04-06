import type { Meta, StoryObj } from '@storybook/react-vite';
import { FileUpload } from './FileUpload';

const meta: Meta<typeof FileUpload> = {
  title: 'Common/FileUpload',
  component: FileUpload,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof FileUpload>;

export const Default: Story = {
  args: {
    label: 'Organization Logo',
    onFileSelect: (f: File) => console.log(f.name),
    accept: 'image/*',
    hint: 'PNG, JPG, SVG up to 2MB',
  },
};
export const WithPreview: Story = {
  args: {
    label: 'Organization Logo',
    onFileSelect: () => {},
    previewUrl: 'https://placehold.co/150x60/3B82F6/ffffff?text=LOGO',
    hint: 'Click to change',
  },
};
export const Uploading: Story = {
  args: {
    label: 'Organization Logo',
    onFileSelect: () => {},
    isUploading: true,
  },
};
export const WithError: Story = {
  args: {
    label: 'Organization Logo',
    onFileSelect: () => {},
    error: 'File too large. Max size: 2MB',
  },
};

