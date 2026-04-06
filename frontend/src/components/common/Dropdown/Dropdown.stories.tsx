import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Edit, Trash2 } from 'lucide-react';
import { Dropdown } from './Dropdown';
import { Button } from '../Button';

const meta: Meta<typeof Dropdown> = {
  title: 'Common/Dropdown',
  component: Dropdown,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Dropdown>;

export const Default: Story = {
  args: {
    trigger: <Button variant="ghost" size="sm">Actions ▼</Button>,
    items: [
      { label: 'Download PDF', icon: <Download size={16} />, onClick: () => {} },
      { label: 'Edit', icon: <Edit size={16} />, onClick: () => {} },
      { label: 'Delete', icon: <Trash2 size={16} />, onClick: () => {}, variant: 'error' },
    ],
  },
};

