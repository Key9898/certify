import type { IntegrationProvider, IntegrationRecipe } from '@/types';

export interface GoogleSheetsMappingState {
  recipientName: string;
  recipientEmail: string;
  certificateTitle: string;
  issueDate: string;
  statusColumn: string;
  certificateIdColumn: string;
  pdfUrlColumn: string;
}

interface IntegrationSpotlight {
  provider: IntegrationProvider;
  tier: 'primary' | 'fallback' | 'secondary';
  eyebrow: string;
  headline: string;
  summary: string;
  highlights: string[];
  ctaLabel: string;
  flowTitle: string;
  flowSteps: Array<{
    title: string;
    description: string;
  }>;
}

export const PRIMARY_INTEGRATION_PROVIDERS: IntegrationProvider[] = [
  'google_sheets',
  'canvas',
];

export const FALLBACK_INTEGRATION_PROVIDERS: IntegrationProvider[] = ['custom'];

export const GOOGLE_SHEETS_DEFAULT_MAPPING: GoogleSheetsMappingState = {
  recipientName: 'Recipient Name',
  recipientEmail: 'Recipient Email',
  certificateTitle: 'Program Title',
  issueDate: 'Completed At',
  statusColumn: 'Certify Status',
  certificateIdColumn: 'Certify ID',
  pdfUrlColumn: 'Certificate PDF URL',
};

export const INTEGRATION_SPOTLIGHTS: Record<
  IntegrationProvider,
  IntegrationSpotlight
> = {
  google_sheets: {
    provider: 'google_sheets',
    tier: 'primary',
    eyebrow: 'Primary Workflow',
    headline: 'Run certificate operations straight from Google Sheets.',
    summary:
      'Best for ops-heavy teams that review rows, trigger batch runs, and write certificate status back into the same spreadsheet.',
    highlights: [
      'Apps Script starter',
      'Editable column mapping',
      'Row status write-back',
    ],
    ctaLabel: 'Launch Sheets Setup',
    flowTitle: 'Sheet-to-certificate flow',
    flowSteps: [
      {
        title: 'Collect approved rows',
        description:
          'Mark the rows you want to issue, then build one payload from the approved records.',
      },
      {
        title: 'Send a batch webhook request',
        description:
          'Apps Script posts the selected rows into Certify using the integration webhook URL.',
      },
      {
        title: 'Write status back to the sheet',
        description:
          'Store the batch ID, PDF URLs, and issued status in dedicated columns for the ops team.',
      },
    ],
  },
  canvas: {
    provider: 'canvas',
    tier: 'primary',
    eyebrow: 'Primary Workflow',
    headline:
      'Connect Canvas completion moments to branded certificate delivery.',
    summary:
      'Great for learning teams that need course completion, module mastery, or capstone completion to return a trustworthy certificate link.',
    highlights: [
      'Completion presets',
      'Learner field mapping',
      'Certificate return flow',
    ],
    ctaLabel: 'Launch Canvas Setup',
    flowTitle: 'Canvas return flow',
    flowSteps: [
      {
        title: 'Listen for a final learning event',
        description:
          'Use course completion, module mastery, or a reviewed capstone as the trigger moment.',
      },
      {
        title: 'Send one learner payload',
        description:
          'Post the learner profile, course context, and completion timestamp into Certify in single mode.',
      },
      {
        title: 'Return the certificate link',
        description:
          'Capture the returned certificateId and pdfUrl so Canvas-side automation can notify staff or learners.',
      },
    ],
  },
  custom: {
    provider: 'custom',
    tier: 'fallback',
    eyebrow: 'Advanced Fallback',
    headline: 'Keep a portable webhook contract for everything else.',
    summary:
      'Use this when your team needs a direct HTTPS integration from an internal tool, portal, or event system without first-class setup screens.',
    highlights: [
      'Portable JSON contract',
      'Server-side response handling',
      'Safer advanced fallback',
    ],
    ctaLabel: 'Use Custom Webhook',
    flowTitle: 'Advanced fallback flow',
    flowSteps: [
      {
        title: 'Generate a stable webhook endpoint',
        description:
          'Create the integration in Certify and hand the webhook URL to your controlled server-side tool.',
      },
      {
        title: 'Post a consistent payload',
        description:
          'Keep field names aligned with the Certify contract so retries and audits stay predictable.',
      },
      {
        title: 'Store the response',
        description:
          'Persist the returned certificate identifiers or PDF URL where your downstream workflow can access them.',
      },
    ],
  },
};

export const getIntegrationSpotlight = (
  provider: IntegrationProvider
): IntegrationSpotlight => INTEGRATION_SPOTLIGHTS[provider];

export const buildGoogleSheetsStarterSnippet = ({
  webhookUrl,
  templateId,
  mapping,
}: {
  webhookUrl: string;
  templateId?: string;
  mapping: GoogleSheetsMappingState;
}): string => {
  const resolvedWebhookUrl =
    webhookUrl || 'https://your-certify-domain/api/integrations/hooks/ig_xxx';
  const resolvedTemplateId = templateId || 'YOUR_TEMPLATE_ID';

  return `function issueApprovedRows() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Ready to Issue');
  const spreadsheetId = SpreadsheetApp.getActive().getId();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const headerIndex = Object.fromEntries(
    headers.map((header, index) => [header, index])
  );

  const approvedRows = dataRows
    .map((row, index) => ({ row, sheetRowNumber: index + 2 }))
    .filter(
      (entry) => entry.row[headerIndex['${mapping.statusColumn}']] === 'Approved'
    );

  const payload = {
    mode: 'batch',
    templateId: '${resolvedTemplateId}',
    spreadsheetId,
    sheetName: sheet.getName(),
    data: approvedRows.map(({ row, sheetRowNumber }) => ({
      sheetRowNumber,
      recipientName: row[headerIndex['${mapping.recipientName}']],
      recipientEmail: row[headerIndex['${mapping.recipientEmail}']],
      certificateTitle: row[headerIndex['${mapping.certificateTitle}']],
      issueDate: row[headerIndex['${mapping.issueDate}']],
    })),
  };

  const response = UrlFetchApp.fetch('${resolvedWebhookUrl}', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
  });

  const result = JSON.parse(response.getContentText());
  Logger.log(result);
}`;
};

export const buildCanvasPayloadSnippet = ({
  webhookUrl,
  recipe,
  templateId,
}: {
  webhookUrl: string;
  recipe: IntegrationRecipe;
  templateId?: string;
}): string => {
  const resolvedWebhookUrl =
    webhookUrl || 'https://your-certify-domain/api/integrations/hooks/ig_xxx';
  const resolvedTemplateId = templateId || 'YOUR_TEMPLATE_ID';

  return `POST ${resolvedWebhookUrl}
Content-Type: application/json

{
  "templateId": "${resolvedTemplateId}",
  "canvasUserId": "12345",
  "canvasCourseId": "42",
  "canvasAssignmentId": "8",
  "recipientName": "{{canvas.user.name}}",
  "recipientEmail": "{{canvas.user.email}}",
  "certificateTitle": "${recipe.certificateTitle}",
  "issuerName": "${recipe.issuerName}",
  "description": "${recipe.description}",
  "issueDate": "{{canvas.completion_at}}"
}`;
};

export const buildCertificateReturnSnippet = (
  provider: IntegrationProvider
): string => {
  if (provider === 'canvas') {
    return `{
  "success": true,
  "data": {
    "certificateId": "660f9f2e0a7c3a4c0f42b123",
    "publicCertificateId": "CERT-8G2KQ4A9",
    "pdfUrl": "https://res.cloudinary.com/demo/raw/upload/certificate.pdf"
  }
}`;
  }

  return `{
  "success": true,
  "batchJobId": "660f9f2e0a7c3a4c0f42b123",
  "totalRows": 24
}`;
};
