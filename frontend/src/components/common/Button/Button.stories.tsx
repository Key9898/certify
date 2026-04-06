import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, Download } from 'lucide-react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: 'Create Certificate', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Cancel', variant: 'secondary' } };
export const Loading: Story = { args: { children: 'Generating PDF...', isLoading: true } };
export const WithIcon: Story = { args: { children: 'New Certificate', leftIcon: <Plus size={16} /> } };
export const DownloadButton: Story = { args: { children: 'Download PDF', variant: 'success', leftIcon: <Download size={16} /> } };
export const Danger: Story = { args: { children: 'Delete', variant: 'error' } };
export const Ghost: Story = { args: { children: 'Cancel', variant: 'ghost' } };
export const Small: Story = { args: { children: 'Small Button', size: 'sm' } };
export const Large: Story = { args: { children: 'Large Button', size: 'lg' } };
export const FullWidth: Story = { args: { children: 'Full Width', fullWidth: true }, parameters: { layout: 'padded' } };

