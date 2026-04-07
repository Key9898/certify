import React from 'react';
import { Mail, Calendar } from 'lucide-react';
import { formatDateShort } from '@/utils/formatters';
import type { UserProfileProps } from './UserProfile.types';

export const UserProfile: React.FC<UserProfileProps> = ({ user, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="avatar">
          <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-primary-content font-bold text-sm ring ring-primary ring-offset-base-100 ring-offset-1">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-base-content">{user.name}</p>
          <p className="text-xs text-base-content/60">{user.email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-200">
      <div className="card-body">
        <div className="flex items-start gap-4">
          <div className="avatar">
            <div className="w-16 h-16 rounded bg-primary flex items-center justify-center text-primary-content font-bold text-2xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="rounded" />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-base-content">{user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-base-content/60 mt-1">
              <Mail size={14} aria-hidden="true" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-base-content/60 mt-1">
              <Calendar size={14} aria-hidden="true" />
              <span>Member since {formatDateShort(user.createdAt)}</span>
            </div>
            <div className="mt-2">
              <span className={`badge badge-sm ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
