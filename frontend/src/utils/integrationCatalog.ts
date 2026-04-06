import type { IntegrationCatalogItem } from '@/types';

export const INTEGRATION_CATALOG: IntegrationCatalogItem[] = [
  {
    provider: 'google_sheets',
    label: 'Google Sheets',
    category: 'spreadsheet',
    summary: 'Convert approved spreadsheet rows into certificate runs from Apps Script with native status write-back.',
    recommendedMode: 'batch',
    highlights: ['Apps Script starter', 'Native row write-back', 'Bulk issuance'],
  },
  {
    provider: 'canvas',
    label: 'Canvas',
    category: 'lms',
    summary: 'Connect course and module completion milestones to certificate workflows with native Canvas callbacks.',
    recommendedMode: 'single',
    highlights: ['Completion presets', 'Assignment comment return', 'Academic workflows'],
  },
  {
    provider: 'custom',
    label: 'Custom Webhook',
    category: 'custom',
    summary: 'Integrate any platform that can send JSON over HTTPS.',
    recommendedMode: 'single',
    highlights: ['Advanced fallback', 'Flexible payload overrides', 'Portable contract'],
  },
  {
    provider: 'zapier',
    label: 'Zapier',
    category: 'automation',
    summary: 'Trigger certificate issuance from CRMs, forms, and connected no-code tools.',
    recommendedMode: 'single',
    highlights: ['No-code workflows', 'Fast webhook setup', 'Secondary path'],
  },
  {
    provider: 'make',
    label: 'Make',
    category: 'automation',
    summary: 'Run advanced multi-step scenarios, approvals, and bulk issuance jobs.',
    recommendedMode: 'batch',
    highlights: ['Scenario builder', 'Conditional logic', 'Secondary path'],
  },
  {
    provider: 'moodle',
    label: 'Moodle',
    category: 'lms',
    summary: 'Issue certificates when students complete modules, cohorts, or assessments.',
    recommendedMode: 'single',
    highlights: ['Course completion hooks', 'Student milestones', 'Secondary path'],
  },
];
