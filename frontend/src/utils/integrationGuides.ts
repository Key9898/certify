import type {
  IntegrationProvider,
  IntegrationProviderGuide,
  IntegrationRecipe,
  Template,
} from '@/types';

export const INTEGRATION_PROVIDER_GUIDES: Record<
  IntegrationProvider,
  IntegrationProviderGuide
> = {
  google_sheets: {
    provider: 'google_sheets',
    headline:
      'Turn spreadsheet rows into repeatable certificate runs without leaving Sheets.',
    setupLead:
      'Drive certificate issuance from Apps Script or spreadsheet automations whenever new rows appear.',
    idealFor: [
      'Workshop attendance trackers maintained in Google Sheets',
      'Partner enablement rosters shared with operations teams',
      'Manual bulk review flows where rows are approved before issue',
    ],
    onboardingChecklist: [
      'Identify the columns that should map to recipient name, email, and issue date.',
      'Choose batch mode for row groups or single mode for one-row-at-a-time automations.',
      'Keep a template category aligned with the roster type, such as academic or event.',
      'Run the sample payload inside Apps Script before connecting a scheduled trigger.',
    ],
    setupSteps: [
      {
        title: 'Prepare the sheet schema',
        description:
          'Create stable headers for recipientName, recipientEmail, certificateTitle, issuerName, and issueDate.',
      },
      {
        title: 'Add the webhook sender',
        description:
          'Use Apps Script UrlFetchApp, AppSheet automation, or a no-code bridge to POST JSON.',
      },
      {
        title: 'Send one row or many',
        description:
          'Single mode works well for append triggers, while batch mode is better for scheduled rollups.',
      },
      {
        title: 'Track issued rows',
        description:
          'Write back certificate IDs or timestamps to a status column so operators can audit each row.',
      },
    ],
    fieldMappings: [
      {
        source: 'Column A: Recipient Name',
        target: 'recipientName',
        example: 'Mina Patel',
      },
      {
        source: 'Column B: Recipient Email',
        target: 'recipientEmail',
        example: 'mina@example.com',
      },
      {
        source: 'Column C: Track / Workshop',
        target: 'certificateTitle',
        example: 'Workshop Completion',
      },
      {
        source: 'Column D: Issue Date',
        target: 'issueDate',
        example: '2026-04-04',
      },
    ],
    recipes: [
      {
        id: 'sheets-roster-sync',
        name: 'Roster Sync Batch',
        summary:
          'Bundle approved rows into one batch request for training cohorts or partner lists.',
        mode: 'batch',
        recommendedTemplateCategory: 'general',
        templateHint:
          'General templates adapt well to several spreadsheet-driven certificate types.',
        keywords: ['general', 'excellence', 'versatile'],
        certificateTitle: 'Roster Completion Certificate',
        issuerName: 'Program Operations',
        description:
          'A spreadsheet-first batch workflow for cohorts reviewed in shared sheets.',
        automationHint:
          'Filter approved rows in Sheets or Apps Script, then POST them as a data array to Certify.',
      },
      {
        id: 'sheets-event-attendance',
        name: 'Event Attendance Rollup',
        summary:
          'Issue event certificates from a checked-in attendee sheet at the end of the day.',
        mode: 'batch',
        recommendedTemplateCategory: 'event',
        templateHint:
          'Use an event layout when the certificate is tied to attendance or participation.',
        keywords: ['event', 'achievement', 'attendance'],
        certificateTitle: 'Certificate of Participation',
        issuerName: 'Event Operations',
        description:
          'A batch run that converts checked-in rows into attendee certificates.',
        automationHint:
          'Schedule an Apps Script trigger to gather rows marked Present and send one webhook payload.',
      },
    ],
    qaChecks: [
      'Keep sheet headers stable so your Apps Script field mapping does not drift over time.',
      'Normalize dates to ISO strings when possible before posting to Certify.',
      'Add a processed column in Sheets to avoid reissuing the same rows on the next run.',
    ],
  },
  canvas: {
    provider: 'canvas',
    headline:
      'Connect Canvas achievements, mastery paths, and capstones to branded certificate delivery.',
    setupLead:
      'Canvas works best with Certify when assignment, module, or course completion events need a polished completion artifact.',
    idealFor: [
      'Module mastery certificates for continuing education programs',
      'Capstone completion workflows that need immediate proof of achievement',
      'Canvas milestones synced into external academic operations tools',
    ],
    onboardingChecklist: [
      'Choose the Canvas trigger or export that represents the final achievement moment.',
      'Use a template that matches the academic or professional tone of the program.',
      'Map learner identifiers, course title, and completion date into Certify fields.',
      'Run a test payload before wiring the flow into the live Canvas course.',
    ],
    setupSteps: [
      {
        title: 'Capture the right Canvas event',
        description:
          'Use assignment completion, module mastery, or a scheduled export as your upstream signal.',
      },
      {
        title: 'Normalize the payload',
        description:
          'Ensure learner data is converted into Certify keys before you send the webhook request.',
      },
      {
        title: 'Pair with a credential template',
        description:
          'Select a high-trust template that mirrors your institution or continuing education brand.',
      },
      {
        title: 'Test and publish',
        description:
          'Generate a sample payload, validate the output PDF, then activate the live integration.',
      },
    ],
    fieldMappings: [
      {
        source: 'Canvas user.name',
        target: 'recipientName',
        example: 'Nora Bennett',
      },
      {
        source: 'Canvas user.email',
        target: 'recipientEmail',
        example: 'nora@example.com',
      },
      {
        source: 'Course or module title',
        target: 'certificateTitle',
        example: 'Capstone Completion',
      },
      {
        source: 'Finished at timestamp',
        target: 'issueDate',
        example: '2026-04-04T15:45:00.000Z',
      },
    ],
    recipes: [
      {
        id: 'canvas-course-completion',
        name: 'Course Completion Certificates',
        summary:
          'Issue a certificate as soon as a learner completes the full Canvas course path.',
        mode: 'single',
        recommendedTemplateCategory: 'academic',
        templateHint:
          'Academic templates are the safest default for institution-led course completions.',
        keywords: ['academic', 'classic', 'course'],
        certificateTitle: 'Course Completion Certificate',
        issuerName: 'Academic Programs Office',
        description:
          'Returned after the learner satisfies the Canvas course completion rules.',
        automationHint:
          'Trigger once the full course is marked complete, then store the returned pdfUrl in your Canvas-side workflow.',
      },
      {
        id: 'canvas-module-mastery',
        name: 'Module Mastery Certificates',
        summary:
          'Issue a certificate every time a learner completes a mastery path or key module.',
        mode: 'single',
        recommendedTemplateCategory: 'academic',
        templateHint:
          'Academic templates work well for high-trust student learning outcomes.',
        keywords: ['academic', 'classic', 'module'],
        certificateTitle: 'Module Mastery Certificate',
        issuerName: 'Continuing Education Office',
        description:
          'Granted after a learner completes the defined Canvas mastery milestone.',
        automationHint:
          'Use Canvas completion data, then push the learner record and module title into Certify.',
      },
      {
        id: 'canvas-capstone-completion',
        name: 'Capstone Completion',
        summary:
          'Create a premium completion certificate for a capstone or final program deliverable.',
        mode: 'single',
        recommendedTemplateCategory: 'corporate',
        templateHint:
          'Corporate or modern layouts create a polished executive education look.',
        keywords: ['modern', 'professional', 'capstone'],
        certificateTitle: 'Capstone Completion Certificate',
        issuerName: 'Executive Learning Studio',
        description:
          'A certificate for successful completion of a culminating Canvas experience.',
        automationHint:
          'Trigger after the final assignment or assessment is marked complete, then call the webhook once.',
      },
    ],
    qaChecks: [
      'Validate whether Canvas exposes learner email directly or whether you need an external roster join.',
      'Use a final graded or completed state to avoid issuing before work is fully reviewed.',
      'Store returned certificate IDs if your institution needs an audit trail outside Canvas.',
    ],
  },
  custom: {
    provider: 'custom',
    headline:
      'Use the Certify webhook contract from internal tools, portals, or any HTTPS-capable service.',
    setupLead:
      'Custom Webhook is the fastest route when you already control the source system or need a portable integration contract.',
    idealFor: [
      'Internal admin portals and lightweight back-office tools',
      'Partner portals that issue certificates after approval',
      'Hardware scanners or event systems that can POST JSON',
    ],
    onboardingChecklist: [
      'Confirm your source app can send an HTTPS POST with JSON.',
      'Pick a template and decide whether the payload should override title or issuer values.',
      'Use single mode for immediate issuance and batch mode only when you already have an array.',
      'Paste the generated curl sample into your tool or API client before shipping.',
    ],
    setupSteps: [
      {
        title: 'Generate the webhook URL',
        description:
          'Create the integration in Certify first so your internal tool has a stable endpoint to target.',
      },
      {
        title: 'Shape the payload contract',
        description:
          'Keep recipientName, recipientEmail, issueDate, and any optional overrides consistent across calls.',
      },
      {
        title: 'Handle the response',
        description:
          'Read the returned certificateId, publicCertificateId, pdfUrl, or batchJobId in your source system.',
      },
      {
        title: 'Harden rollout',
        description:
          'Log failures, capture request IDs, and rotate webhook keys if access needs to be refreshed.',
      },
    ],
    fieldMappings: [
      {
        source: 'POST body user.name',
        target: 'recipientName',
        example: 'Riley Chen',
      },
      {
        source: 'POST body user.email',
        target: 'recipientEmail',
        example: 'riley@example.com',
      },
      {
        source: 'POST body achievement.label',
        target: 'certificateTitle',
        example: 'Partner Certification',
      },
      {
        source: 'POST body completedAt',
        target: 'issueDate',
        example: '2026-04-04T18:15:00.000Z',
      },
    ],
    recipes: [
      {
        id: 'custom-partner-portal',
        name: 'Partner Portal Badge Issue',
        summary:
          'Issue one certificate from a partner-facing admin or badge approval tool.',
        mode: 'single',
        recommendedTemplateCategory: 'general',
        templateHint:
          'General templates are ideal when partners span multiple programs or award types.',
        keywords: ['general', 'partner', 'badge'],
        certificateTitle: 'Partner Certification',
        issuerName: 'Partner Enablement Team',
        description:
          'Awarded from an internal or partner-facing tool once a reviewer approves the achievement.',
        automationHint:
          'Post a simple JSON document from your portal after approval and store the returned certificate identifiers.',
      },
      {
        id: 'custom-event-scanner',
        name: 'Event Scanner Sync',
        summary:
          'Convert device check-ins or scanner exports into a scheduled batch certificate run.',
        mode: 'batch',
        recommendedTemplateCategory: 'event',
        templateHint:
          'Event templates work best for workshops, summits, and attendance-based programs.',
        keywords: ['event', 'attendance', 'scanner'],
        certificateTitle: 'Event Attendance Certificate',
        issuerName: 'Experience Team',
        description:
          'A batch payload for attendee lists produced by custom event systems or scanners.',
        automationHint:
          'Aggregate approved attendees into a data array, then send one batch webhook request after the event.',
      },
    ],
    qaChecks: [
      'Never expose the webhook URL in client-side code that unauthenticated users can inspect.',
      'Rotate the webhook key when a contractor, vendor, or environment loses access.',
      'Capture Certify error messages server-side so operators can retry failed runs safely.',
    ],
  },
};

export const getIntegrationGuide = (
  provider: IntegrationProvider
): IntegrationProviderGuide => INTEGRATION_PROVIDER_GUIDES[provider];

export const findBestTemplateForRecipe = (
  recipe: IntegrationRecipe,
  templates: Template[]
): Template | undefined => {
  const normalizedKeywords = recipe.keywords.map((keyword) =>
    keyword.toLowerCase()
  );

  const keywordMatch = templates.find((template) => {
    const haystack = `${template.name} ${template.description}`.toLowerCase();
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });

  if (keywordMatch) {
    return keywordMatch;
  }

  return (
    templates.find(
      (template) => template.category === recipe.recommendedTemplateCategory
    ) || templates[0]
  );
};
