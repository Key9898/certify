import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Button } from '../Button';

const meta: Meta<typeof Card> = {
  title: 'Common/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    title: 'Certificate of Excellence',
    subtitle: 'John Smith',
    children: <p className="text-sm text-base-content/70">Issued on March 15, 2024</p>,
    actions: <Button size="sm">Download PDF</Button>,
  },
};
export const WithImage: Story = {
  args: {
    title: 'Modern Professional',
    subtitle: 'Corporate Template',
    image: 'https://placehold.co/400x200/3B82F6/ffffff?text=Template+Preview',
    imageAlt: 'Template preview',
    children: <p className="text-sm text-base-content/70">Clean and modern design</p>,
  },
};
export const Hoverable: Story = {
  args: {
    title: 'Hoverable Card',
    children: <p>Hover over me!</p>,
    hoverable: true,
  },
};

