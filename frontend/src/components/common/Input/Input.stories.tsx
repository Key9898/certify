import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Common/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { label: 'Recipient Name', placeholder: 'Enter recipient name' } };
export const WithError: Story = { args: { label: 'Email', placeholder: 'Enter email', error: 'Invalid email address', type: 'email' } };
export const WithHint: Story = { args: { label: 'Certificate Title', placeholder: 'Certificate of Excellence', hint: 'This will appear on the certificate' } };
export const WithLeftAddon: Story = { args: { label: 'Search', placeholder: 'Search certificates...', leftAddon: <Search size={16} /> } };
export const DateInput: Story = { args: { label: 'Issue Date', type: 'date' } };

