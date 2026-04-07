import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Settings, X, Award, LogOut } from 'lucide-react';

// Static preview — avoids useAuth0() and NavLink active-state in Storybook
const SidebarPreview = ({
  isOpen = false,
  activeRoute = '/dashboard',
}: {
  isOpen?: boolean;
  activeRoute?: string;
}) => {
  const NAV_ITEMS = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/templates', label: 'Templates', icon: FileText },
    { to: '/certificates/create', label: 'Create Certificate', icon: Plus },
    { to: '/certificates', label: 'My Certificates', icon: Award },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 lg:hidden">
        <span className="font-bold text-lg">Menu</span>
        <button className="btn btn-ghost btn-sm btn-circle" aria-label="Close menu">
          <X size={18} />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="menu menu-sm gap-1 p-0 w-full">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <a
                href={to}
                className={[
                  'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                  activeRoute === to
                    ? 'bg-primary text-primary-content'
                    : 'text-base-content hover:bg-base-200',
                ].join(' ')}
                onClick={(e) => e.preventDefault()}
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-3 py-4 border-t border-base-200">
        <button className="btn btn-ghost btn-sm w-full justify-start text-error hover:bg-error hover:text-error-content gap-3">
          <LogOut size={16} aria-hidden="true" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <MemoryRouter>
      <div className="flex" style={{ minHeight: '400px' }}>
        {/* Desktop Sidebar */}
        <aside className="flex flex-col w-60 bg-base-100 border-r border-base-200">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer overlay */}
        {isOpen && (
          <div className="fixed inset-0 z-40 flex lg:hidden">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <aside className="relative z-50 flex flex-col w-72 bg-base-100 shadow-xl">
              {sidebarContent}
            </aside>
          </div>
        )}
      </div>
    </MemoryRouter>
  );
};

const meta: Meta<typeof SidebarPreview> = {
  title: 'Layout/Sidebar',
  component: SidebarPreview,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;
type Story = StoryObj<typeof SidebarPreview>;

export const Default: Story = { args: { activeRoute: '/dashboard' } };
export const TemplatesActive: Story = { args: { activeRoute: '/templates' } };
export const SettingsActive: Story = { args: { activeRoute: '/settings' } };
export const MobileOpen: Story = { args: { isOpen: true, activeRoute: '/dashboard' } };

