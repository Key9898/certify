import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplateCard } from './TemplateCard';
import { MOCK_TEMPLATES } from '@/demo/mocks/templates';

const meta: Meta<typeof TemplateCard> = {
  title: 'Template/TemplateCard',
  component: TemplateCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TemplateCard>;

export const Corporate: Story = {
  args: { template: MOCK_TEMPLATES[0], isSelected: false },
};

export const Academic: Story = {
  args: { template: MOCK_TEMPLATES[1], isSelected: false },
};

export const Event: Story = {
  args: { template: MOCK_TEMPLATES[2], isSelected: false },
};

export const General: Story = {
  args: { template: MOCK_TEMPLATES[3], isSelected: false },
};

export const Selected: Story = {
  args: { template: MOCK_TEMPLATES[0], isSelected: true },
};

