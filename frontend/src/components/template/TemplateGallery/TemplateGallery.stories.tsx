import type { Meta, StoryObj } from '@storybook/react-vite';
import { TemplateGallery } from './TemplateGallery';
import { MOCK_TEMPLATES } from '@/demo/mocks/templates';

const meta: Meta<typeof TemplateGallery> = {
  title: 'Template/TemplateGallery',
  component: TemplateGallery,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof TemplateGallery>;

export const Default: Story = {
  args: { templates: MOCK_TEMPLATES, isLoading: false },
};

export const WithSelection: Story = {
  args: {
    templates: MOCK_TEMPLATES,
    selectedId: MOCK_TEMPLATES[0]._id,
    isLoading: false,
  },
};

export const Loading: Story = {
  args: { templates: [], isLoading: true },
};

export const Empty: Story = {
  args: { templates: [], isLoading: false },
};

