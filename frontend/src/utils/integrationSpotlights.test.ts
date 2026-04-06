import { describe, expect, it } from 'vitest';
import {
  buildCanvasPayloadSnippet,
  buildCertificateReturnSnippet,
  buildGoogleSheetsStarterSnippet,
  GOOGLE_SHEETS_DEFAULT_MAPPING,
} from './integrationSpotlights';

describe('integrationSpotlights', () => {
  it('builds a Google Sheets Apps Script snippet with row numbers and sheet metadata', () => {
    const snippet = buildGoogleSheetsStarterSnippet({
      webhookUrl: 'https://certify.app/api/integrations/hooks/ig_google',
      templateId: 'template-123',
      mapping: GOOGLE_SHEETS_DEFAULT_MAPPING,
    });

    expect(snippet).toContain("sheetRowNumber: index + 2");
    expect(snippet).toContain('spreadsheetId');
    expect(snippet).toContain('template-123');
    expect(snippet).toContain('https://certify.app/api/integrations/hooks/ig_google');
  });

  it('builds a Canvas payload snippet with user, course, and assignment identifiers', () => {
    const snippet = buildCanvasPayloadSnippet({
      webhookUrl: 'https://certify.app/api/integrations/hooks/ig_canvas',
      templateId: 'template-456',
      recipe: {
        id: 'canvas-capstone-completion',
        name: 'Capstone Completion',
        summary: 'Issue a certificate after a capstone is complete.',
        mode: 'single',
        recommendedTemplateCategory: 'corporate',
        templateHint: 'Use a modern layout.',
        keywords: ['modern', 'capstone'],
        certificateTitle: 'Capstone Completion Certificate',
        issuerName: 'Executive Learning Studio',
        description: 'Awarded after a learner completes the final capstone.',
        automationHint: 'Trigger from a Canvas completion event.',
      },
    });

    expect(snippet).toContain('"canvasUserId": "12345"');
    expect(snippet).toContain('"canvasCourseId": "42"');
    expect(snippet).toContain('"canvasAssignmentId": "8"');
    expect(snippet).toContain('Capstone Completion Certificate');
  });

  it('returns the right response contract snippets for single and batch providers', () => {
    expect(buildCertificateReturnSnippet('canvas')).toContain('publicCertificateId');
    expect(buildCertificateReturnSnippet('google_sheets')).toContain('batchJobId');
  });
});
