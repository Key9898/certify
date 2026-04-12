import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginButton } from './LoginButton';

const meta: Meta<typeof LoginButton> = {
  title: 'Auth/LoginButton',
  component: LoginButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof LoginButton>;

export const Primary: Story = {
  args: { label: 'Get Started Free', variant: 'primary' },
};
export const Outline: Story = {
  args: { label: 'Sign In', variant: 'outline' },
};
export const Large: Story = { args: { label: 'Get Started Free', size: 'lg' } };
