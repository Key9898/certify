import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplatePreview } from './TemplatePreview';
import { MOCK_TEMPLATES } from '@/demo/mocks/templates';

const meta: Meta<typeof TemplatePreview> = {
  title: 'Template/TemplatePreview',
  component: TemplatePreview,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TemplatePreview>;

export const Corporate: Story = {
  args: { template: MOCK_TEMPLATES[0] },
};

export const Academic: Story = {
  args: { template: MOCK_TEMPLATES[1] },
};

export const Event: Story = {
  args: { template: MOCK_TEMPLATES[2] },
};

export const General: Story = {
  args: { template: MOCK_TEMPLATES[3] },
};

export const WithCustomClass: Story = {
  args: { template: MOCK_TEMPLATES[0], className: 'w-48' },
};
