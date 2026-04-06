export const TEMPLATE_CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'academic', label: 'Academic' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'event', label: 'Event' },
  { value: 'general', label: 'General' },
] as const;

export const ITEMS_PER_PAGE = 12;

export const DEFAULT_PRIMARY_COLOR = '#3B82F6';
export const DEFAULT_SECONDARY_COLOR = '#64748B';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  TEMPLATES: '/templates',
  CREATE_CERTIFICATE: '/create',
  CERTIFICATES: '/certificates',
  BATCH_GENERATE: '/batch',
  INTEGRATIONS: '/integrations',
  TEMPLATE_BUILDER: '/templates/new',
  SETTINGS: '/settings',
  VERIFY: '/verify/:certificateId',
} as const;
