import type { Meta, StoryObj } from '@storybook/react-vite';
import { BatchProgress } from './BatchProgress';
import {
  MOCK_BATCH_JOB_PROCESSING,
  MOCK_BATCH_JOB_COMPLETED,
} from '@/demo/mocks/batchData';
import type { BatchJob } from '@/types/batch';

const meta: Meta<typeof BatchProgress> = {
  title: 'Batch/BatchProgress',
  component: BatchProgress,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof BatchProgress>;

export const Processing: Story = {
  args: {
    job: MOCK_BATCH_JOB_PROCESSING,
  },
};

export const Completed: Story = {
  args: {
    job: MOCK_BATCH_JOB_COMPLETED,
  },
};

export const Pending: Story = {
  args: {
    job: {
      ...MOCK_BATCH_JOB_PROCESSING,
      status: 'pending',
      processedCertificates: 0,
      results: [],
    } satisfies BatchJob,
  },
};

export const Failed: Story = {
  args: {
    job: {
      ...MOCK_BATCH_JOB_COMPLETED,
      status: 'failed',
      processedCertificates: 1,
      results: [
        {
          recipientName: 'Alice Johnson',
          status: 'failed',
          error: 'PDF generation timeout',
        },
      ],
      errorMessage: 'Unexpected error during batch processing.',
    } satisfies BatchJob,
  },
};

export const AllSucceeded: Story = {
  args: {
    job: {
      ...MOCK_BATCH_JOB_COMPLETED,
      results: MOCK_BATCH_JOB_COMPLETED.results.map((r) =>
        r.status === 'failed'
          ? { recipientName: r.recipientName, status: 'success' as const, certificateId: 'cert-003', pdfUrl: 'https://example.com/cert-carol.pdf' }
          : r
      ),
    } satisfies BatchJob,
  },
};

