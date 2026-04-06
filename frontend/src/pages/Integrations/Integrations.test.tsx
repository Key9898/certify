import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Integrations } from './Integrations';
import type { Integration, Template, User } from '@/types';

vi.mock('@/components/layout/MainLayout', () => ({
  MainLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockUser: User = {
  _id: 'user-1',
  auth0Id: 'auth0|user-1',
  email: 'owner@certify.app',
  name: 'Workspace Owner',
  role: 'admin',
  organizationId: 'org-1',
  organizationRole: 'owner',
  organization: {
    _id: 'org-1',
    name: 'Summit Academy',
    slug: 'summit-academy',
    owner: 'user-1',
    whiteLabel: {
      brandName: 'Summit Academy',
      primaryColor: '#3B82F6',
      secondaryColor: '#64748B',
      hidePoweredBy: false,
    },
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
  settings: {
    defaultColors: {
      primary: '#3B82F6',
      secondary: '#64748B',
    },
  },
  createdAt: '2026-04-05T10:00:00.000Z',
  updatedAt: '2026-04-05T10:00:00.000Z',
};

const mockTemplates: Template[] = [
  {
    _id: 'template-academic',
    name: 'Academic Trust',
    description: 'A clean academic template.',
    category: 'academic',
    thumbnail: 'https://example.com/academic.png',
    htmlContent: '<div>Academic</div>',
    styles: '.academic {}',
    fields: [],
    isPublic: true,
    createdBy: 'user-1',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
  {
    _id: 'template-corporate',
    name: 'Corporate Edge',
    description: 'A polished professional template.',
    category: 'corporate',
    thumbnail: 'https://example.com/corporate.png',
    htmlContent: '<div>Corporate</div>',
    styles: '.corporate {}',
    fields: [],
    isPublic: true,
    createdBy: 'user-1',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
];

const mockIntegrations: Integration[] = [
  {
    _id: 'integration-sheets',
    name: 'Google Sheets Cohort Sync',
    provider: 'google_sheets',
    description: 'Queue rows from Google Sheets and write the results back.',
    status: 'active',
    mode: 'batch',
    templateId: 'template-academic',
    templateName: 'Academic Trust',
    webhookUrl: 'https://demo.certify.app/api/integrations/hooks/ig_demo_sheets',
    defaults: {
      certificateTitle: 'Leadership Cohort Graduation',
      issuerName: 'Summit Academy',
    },
    settings: {
      autoGeneratePdf: true,
      googleSheets: {
        enabled: true,
        spreadsheetId: 'demo-spreadsheet',
        sheetName: 'Ready to Issue',
        statusColumn: 'Certify Status',
        certificateIdColumn: 'Certify ID',
        pdfUrlColumn: 'Certificate PDF URL',
        batchJobIdColumn: 'Certify Batch ID',
        processedAtColumn: 'Processed At',
      },
    },
    stats: {
      totalRuns: 10,
      successRuns: 9,
      failedRuns: 1,
      lastSuccessfulRunAt: '2026-04-05T10:00:00.000Z',
    },
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
];

vi.mock('@/context/AuthContext', () => ({
  useAppUser: () => ({
    appUser: mockUser,
  }),
}));

vi.mock('@/context/DemoContext', () => ({
  useDemo: () => ({
    isDemoMode: true,
    mockIntegrations,
    setMockIntegrations: vi.fn(),
  }),
}));

vi.mock('@/hooks/useTemplates', () => ({
  useTemplates: () => ({
    templates: mockTemplates,
    isLoading: false,
  }),
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe('Integrations page', () => {
  it('prioritizes Google Sheets and shows native sync controls by default', () => {
    render(
      <MemoryRouter>
        <Integrations />
      </MemoryRouter>
    );

    expect(screen.getByText('Start with Google Sheets or Canvas')).toBeInTheDocument();
    expect(screen.getByText('Native Google Sheets sync')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ready to Issue')).toBeInTheDocument();
  });

  it('switches to the Canvas-first native handoff form when the provider changes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Integrations />
      </MemoryRouter>
    );

    await user.selectOptions(screen.getByLabelText('Provider'), 'canvas');

    expect(screen.getByText('Native Canvas handoff')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Assignment comment')).toBeInTheDocument();
    expect(screen.getByText('Completion preset')).toBeInTheDocument();
  });
});
