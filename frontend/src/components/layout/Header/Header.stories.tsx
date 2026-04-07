import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { Award, Menu } from 'lucide-react';

// Static preview — avoids useAuth0() and useNavigate() in Storybook context
const HeaderPreview = ({
  isAuthenticated = false,
  showMenuToggle = false,
  userName = 'Jane Doe',
  userEmail = 'jane@example.com',
}: {
  isAuthenticated?: boolean;
  showMenuToggle?: boolean;
  userName?: string;
  userEmail?: string;
}) => {
  return (
    <MemoryRouter>
      <header className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30 px-4 w-full">
        <div className="navbar-start">
          {isAuthenticated && showMenuToggle && (
            <button className="btn btn-ghost btn-sm lg:hidden mr-1" aria-label="Toggle menu">
              <Menu size={20} />
            </button>
          )}
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
            <div className="bg-primary rounded p-1.5">
              <Award size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-base-content">Certify</span>
          </div>
        </div>
        <div className="navbar-end gap-2">
          {isAuthenticated && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded ring ring-primary ring-offset-base-100 ring-offset-1 bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200"
              >
                <li className="px-3 py-2 border-b border-base-200 mb-1">
                  <div className="flex flex-col">
                    <span className="font-semibold text-base-content text-sm">{userName}</span>
                    <span className="text-xs text-base-content/60">{userEmail}</span>
                  </div>
                </li>
                <li>
                  <a>Dashboard</a>
                </li>
                <li>
                  <a>Settings</a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </MemoryRouter>
  );
};

const meta: Meta<typeof HeaderPreview> = {
  title: 'Layout/Header',
  component: HeaderPreview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof HeaderPreview>;

export const Unauthenticated: Story = {
  args: { isAuthenticated: false },
};

export const Authenticated: Story = {
  args: { isAuthenticated: true, userName: 'Jane Doe', userEmail: 'jane@example.com' },
};

export const AuthenticatedWithMenuToggle: Story = {
  args: {
    isAuthenticated: true,
    showMenuToggle: true,
    userName: 'John Smith',
    userEmail: 'john@example.com',
  },
};

