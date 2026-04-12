import type { Meta, StoryObj } from '@storybook/react-vite';
import { Loading } from './Loading';

const meta: Meta<typeof Loading> = {
  title: 'Common/Loading',
  component: Loading,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof Loading>;

export const Default: Story = { args: {} };
export const Large: Story = {
  args: { size: 'lg', text: 'Loading certificates...' },
};
export const Dots: Story = { args: { variant: 'dots', size: 'md' } };
export const Ring: Story = { args: { variant: 'ring', size: 'md' } };
