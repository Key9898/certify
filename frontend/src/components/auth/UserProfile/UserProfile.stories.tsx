import type { Meta, StoryObj } from '@storybook/react-vite';
import { UserProfile } from './UserProfile';
import { MOCK_USER } from '@/demo/mocks/users';

const meta: Meta<typeof UserProfile> = {
  title: 'Auth/UserProfile',
  component: UserProfile,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof UserProfile>;

export const Default: Story = {
  args: { user: MOCK_USER, compact: false },
};

export const Compact: Story = {
  args: { user: MOCK_USER, compact: true },
};

export const AdminUser: Story = {
  args: {
    user: {
      ...MOCK_USER,
      role: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
    },
    compact: false,
  },
};

export const WithAvatar: Story = {
  args: {
    user: {
      ...MOCK_USER,
      avatar: 'https://i.pravatar.cc/150?img=3',
      name: 'Jane Doe',
    },
    compact: false,
  },
};

export const CompactWithAvatar: Story = {
  args: {
    user: {
      ...MOCK_USER,
      avatar: 'https://i.pravatar.cc/150?img=5',
      name: 'Jane Doe',
    },
    compact: true,
  },
};
