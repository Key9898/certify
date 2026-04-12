import { Shield, Check, X, Crown, UserCog, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Permission {
  category: string;
  actions: string[];
}

const permissions: Permission[] = [
  {
    category: 'Certificates',
    actions: [
      'View certificates',
      'Create certificates',
      'Edit certificates',
      'Delete certificates',
      'Batch generate',
    ],
  },
  {
    category: 'Templates',
    actions: [
      'View templates',
      'Create templates',
      'Edit templates',
      'Delete templates',
    ],
  },
  {
    category: 'Team & Workspace',
    actions: [
      'View team members',
      'Invite members',
      'Update member roles',
      'Remove members',
    ],
  },
  {
    category: 'Integrations',
    actions: [
      'View integrations',
      'Configure integrations',
      'Delete integrations',
    ],
  },
  {
    category: 'Settings',
    actions: [
      'View settings',
      'Update profile',
      'Manage API keys',
      'Configure webhooks',
    ],
  },
  {
    category: 'White Labeling',
    actions: ['View branding', 'Update branding', 'Configure custom domain'],
  },
];

const rolePermissions: Record<string, Record<string, boolean[]>> = {
  Certificates: {
    'View certificates': [true, true, true],
    'Create certificates': [true, true, true],
    'Edit certificates': [true, true, true],
    'Delete certificates': [true, true, false],
    'Batch generate': [true, true, true],
  },
  Templates: {
    'View templates': [true, true, true],
    'Create templates': [true, true, true],
    'Edit templates': [true, true, true],
    'Delete templates': [true, true, false],
  },
  'Team & Workspace': {
    'View team members': [true, true, true],
    'Invite members': [true, true, false],
    'Update member roles': [true, false, false],
    'Remove members': [true, true, false],
  },
  Integrations: {
    'View integrations': [true, true, true],
    'Configure integrations': [true, true, false],
    'Delete integrations': [true, true, false],
  },
  Settings: {
    'View settings': [true, true, true],
    'Update profile': [true, true, true],
    'Manage API keys': [true, true, false],
    'Configure webhooks': [true, true, false],
  },
  'White Labeling': {
    'View branding': [true, true, true],
    'Update branding': [true, false, false],
    'Configure custom domain': [true, false, false],
  },
};

const roleInfo = [
  {
    key: 'owner',
    label: 'Owner',
    icon: Crown,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  {
    key: 'admin',
    label: 'Admin',
    icon: UserCog,
    color: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20',
  },
  {
    key: 'member',
    label: 'Member',
    icon: Users,
    color: 'text-base-content/60',
    bg: 'bg-base-200',
    border: 'border-base-300',
  },
];

export const RolePermissionMatrix: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded border border-base-200 bg-base-100 overflow-hidden"
    >
      <div className="flex items-center gap-3 p-5 border-b border-base-200 bg-base-200/30">
        <div className="bg-primary/10 rounded p-2 text-primary">
          <Shield size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-base-content">
            Role Permission Matrix
          </h3>
          <p className="text-xs text-base-content/50 font-medium">
            Access levels for each workspace role
          </p>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          {roleInfo.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.key}
                className={`flex items-center gap-2 px-4 py-2 rounded ${role.bg} border ${role.border}`}
              >
                <Icon size={16} className={role.color} />
                <span className="text-sm font-bold">{role.label}</span>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[640px] px-4 md:px-0">
            <div className="grid grid-cols-[1fr_repeat(3,100px)] gap-2 mb-4">
              <div className="px-3 py-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                  Permission
                </span>
              </div>
              {roleInfo.map((role) => (
                <div key={role.key} className="px-2 py-2 text-center">
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest ${role.color}`}
                  >
                    {role.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1">
              {permissions.map((section, sectionIndex) => (
                <div key={section.category}>
                  <div className="px-3 py-2 bg-base-200/50 rounded mt-4 first:mt-0">
                    <span className="text-xs font-black uppercase tracking-wider text-base-content/60">
                      {section.category}
                    </span>
                  </div>
                  {section.actions.map((action, actionIndex) => {
                    const perms = rolePermissions[section.category]?.[
                      action
                    ] || [false, false, false];
                    return (
                      <motion.div
                        key={action}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.05 * (sectionIndex * 5 + actionIndex),
                        }}
                        className="grid grid-cols-[1fr_repeat(3,100px)] gap-2 items-center py-2.5 px-3 rounded hover:bg-base-200/30 transition-colors"
                      >
                        <span className="text-sm font-medium text-base-content/80">
                          {action}
                        </span>
                        {perms.map((allowed, idx) => (
                          <div key={idx} className="flex justify-center">
                            {allowed ? (
                              <div
                                className={`h-6 w-6 rounded flex items-center justify-center ${roleInfo[idx].bg}`}
                              >
                                <Check
                                  size={14}
                                  className={roleInfo[idx].color}
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded flex items-center justify-center bg-base-200">
                                <X size={14} className="text-base-content/30" />
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-base-200">
          <p className="text-xs text-base-content/40 font-medium">
            <span className="font-bold text-base-content/60">Note:</span> Owners
            have full access to all features. Admins can manage most operations
            except critical workspace settings. Members have basic access for
            day-to-day certificate operations.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
