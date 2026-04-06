import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LogOut } from 'lucide-react';

// Static preview component — avoids calling useAuth0() in Storybook context
const LogoutButtonPreview = ({
  size = 'md',
  variant = 'ghost',
}: {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'error' | 'outline';
}) => {
  const [clicked, setClicked] = useState(false);
  const sizeMap: Record<string, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' };
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className={['btn', `btn-${variant}`, sizeMap[size]].filter(Boolean).join(' ')}
        onClick={() => setClicked(true)}
        aria-label="Sign out"
      >
        <LogOut size={16} aria-hidden="true" />
        Sign Out
      </button>
      {clicked && <span className="text-xs text-base-content/50">(logout triggered)</span>}
    </div>
  );
};

const meta: Meta<typeof LogoutButtonPreview> = {
  title: 'Auth/LogoutButton',
  component: LogoutButtonPreview,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof LogoutButtonPreview>;

export const Default: Story = { args: { size: 'md', variant: 'ghost' } };
export const Small: Story = { args: { size: 'sm', variant: 'ghost' } };
export const Large: Story = { args: { size: 'lg', variant: 'ghost' } };
export const ErrorVariant: Story = { args: { size: 'md', variant: 'error' } };
export const OutlineVariant: Story = { args: { size: 'md', variant: 'outline' } };

