import type { Meta, StoryObj } from '@storybook/react-vite';
import { BatchUpload } from './BatchUpload';

const meta: Meta<typeof BatchUpload> = {
  title: 'Batch/BatchUpload',
  component: BatchUpload,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof BatchUpload>;

export const Default: Story = {
  args: {
    onParsed: (rows, file) => console.log('Parsed', rows.length, 'rows from', file.name),
  },
};

export const Loading: Story = {
  args: {
    onParsed: () => {},
    isLoading: true,
  },
};

export const WithError: Story = {
  args: {
    onParsed: () => {},
    error: 'Invalid file type. Only CSV and XLSX files are allowed.',
  },
};

export const WithServerError: Story = {
  args: {
    onParsed: () => {},
    error: 'Server error: Failed to process the uploaded file. Please try again.',
  },
};

