import type { User } from '@/types';

export const MOCK_USER: User = {
  _id: 'user-1',
  auth0Id: 'auth0|123456',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'user',
  settings: {
    defaultColors: {
      primary: '#3B82F6',
      secondary: '#64748B',
    },
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};
