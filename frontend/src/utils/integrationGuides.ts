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
  zapier: {
    provider: 'zapier',
    headline: 'Launch one-certificate flows from forms, CRMs, and support automations.',
    setupLead:
      'Use a Webhooks by Zapier action to POST recipient fields straight into Certify whenever a no-code trigger fires.',
    idealFor: [
      'Lead capture or onboarding form completions',
      'CRM stage changes that unlock enablement certificates',
      'Customer success milestones that need instant PDFs',
    ],
    onboardingChecklist: [
      'Choose the certificate template you want Zapier to target by default.',
      'Add a Webhooks by Zapier action and paste your Certify webhook URL.',
      'Map recipient name, email, issue date, and any title overrides from the trigger.',
      'Run the sample curl test in Certify before switching the Zap on.',
    ],
    setupSteps: [
      {
        title: 'Pick a trigger app',
        description:
          'Start with the form, CRM, helpdesk, or spreadsheet event that should issue a certificate.',
      },
      {
        title: 'Add Webhooks by Zapier',
        description:
          'Use a Custom Request or POST action with JSON and your Certify webhook URL.',
      },
      {
        title: 'Map certificate fields',
        description:
          'Pass recipientName, recipientEmail, issueDate, and optional template/title overrides.',
      },
      {
        title: 'Turn on instant delivery',
        description:
          'Keep single mode enabled with auto PDF generation so downstream apps receive a PDF URL.',
      },
    ],
    fieldMappings: [
      { source: 'Trigger participant name', target: 'recipientName', example: 'Ava Morgan' },
      { source: 'Trigger participant email', target: 'recipientEmail', example: 'ava@example.com' },
      {
        source: 'Trigger course or award title',
        target: 'certificateTitle',
        example: 'Customer Onboarding Mastery',
      },
      { source: 'Zapier timestamp', target: 'issueDate', example: '2026-04-04T09:30:00.000Z' },
    ],
    recipes: [
      {
        id: 'zapier-form-completion',
        name: 'Form Completion Awards',
        summary: 'Issue a polished completion certificate whenever a learner submits a no-code form.',
        mode: 'single',
        recommendedTemplateCategory: 'corporate',
        templateHint: 'Pair with a clean professional template for client-facing delivery.',
        keywords: ['modern', 'professional', 'completion'],
        certificateTitle: 'Certificate of Completion',
        issuerName: 'Growth Academy',
        description: 'Issued automatically after the learner finishes your intake or onboarding form.',
        automationHint:
          'Trigger from Typeform or Google Forms, then map response fields to the Certify webhook.',
      },
      {
        id: 'zapier-crm-enablements',
        name: 'CRM Enablement Milestones',
        summary: 'Create one certificate per deal stage, cohort handoff, or customer success milestone.',
        mode: 'single',
        recommendedTemplateCategory: 'general',
        templateHint: 'Use a flexible template that works across several lifecycle stages.',
        keywords: ['general', 'excellence', 'achievement'],
        certificateTitle: 'Enablement Milestone',
        issuerName: 'Certify Success Team',
        description: 'A reusable webhook flow for achievement and enablement moments tracked in your CRM.',
        automationHint:
          'Listen for a stage change in HubSpot or Airtable and send the contact record to Certify.',
      },
    ],
    qaChecks: [
      'Confirm Zapier sends JSON, not form-encoded payloads.',
      'Keep auto PDF generation on when another Zap step needs the file URL.',
      'Store template IDs in Zapier only when you need to override the default template.',
    ],
  },
  make: {
    provider: 'make',
    headline: 'Build orchestrated certificate pipelines with approvals, routers, and retries.',
    setupLead:
      'Use Make scenarios when a certificate run depends on multiple systems, conditional routing, or bulk fan-out logic.',
    idealFor: [
      'Approval-gated certification workflows',
      'Multi-step syncs across Airtable, Slack, and Certify',
      'Batch issuance from parsed sheets, forms, or LMS exports',
    ],
    onboardingChecklist: [
      'Start a scenario with your upstream trigger or webhook listener.',
      'Normalize source fields before the Certify webhook module so every run uses the same contract.',
      'Switch to batch mode when Make is posting an array of recipients.',
      'Test with one sample bundle and one bulk bundle before you schedule the scenario.',
    ],
    setupSteps: [
      {
        title: 'Build the scenario graph',
        description:
          'Model approvals, conditionals, and notifications first so your certificate step stays simple.',
      },
      {
        title: 'Transform the payload',
        description:
          'Use Make mapping or JSON modules to produce recipientName, recipientEmail, and issueDate keys.',
      },
      {
        title: 'Call Certify',
        description:
          'Send a POST request to the webhook URL with either one recipient or a batch data array.',
      },
      {
        title: 'Review async outcomes',
        description:
          'For batch mode, use the response batchJobId to follow the generation job in Certify.',
      },
    ],
    fieldMappings: [
      { source: 'Scenario bundle user.full_name', target: 'recipientName', example: 'Jordan Lee' },
      { source: 'Scenario bundle user.email', target: 'recipientEmail', example: 'jordan@example.com' },
      { source: 'Mapped array payload', target: 'data[]', example: '[{...}, {...}]' },
      { source: 'Approval timestamp', target: 'issueDate', example: '2026-04-04T12:00:00.000Z' },
    ],
    recipes: [
      {
        id: 'make-approved-cohort',
        name: 'Approved Cohort Graduation',
        summary: 'Queue a batch job only after review and approval steps finish in Make.',
        mode: 'batch',
        recommendedTemplateCategory: 'academic',
        templateHint: 'Academic layouts work well when a cohort or training class completes together.',
        keywords: ['academic', 'classic', 'cohort'],
        certificateTitle: 'Cohort Graduation Certificate',
        issuerName: 'Learning Operations',
        description: 'A batch-ready setup for approved learners graduating from the same program.',
        automationHint:
          'Collect approved records in Make, aggregate them into a data array, then send one batch webhook request.',
      },
      {
        id: 'make-multi-step-ops',
        name: 'Training Ops Scenario',
        summary: 'Coordinate reminders, approvals, and certificate delivery from one multi-step scenario.',
        mode: 'single',
        recommendedTemplateCategory: 'corporate',
        templateHint: 'Corporate templates suit internal enablement and compliance certification.',
        keywords: ['modern', 'corporate', 'professional'],
        certificateTitle: 'Training Completion Certificate',
        issuerName: 'Operations Enablement',
        description: 'Used for structured operational training where several checks happen before issuing.',
        automationHint:
          'Run a router for pass/fail, then call the Certify webhook only from the success branch.',
      },
    ],
    qaChecks: [
      'Use Make routers to prevent duplicate webhook calls when retries happen.',
      'Prefer batch mode when you already have a complete recipient array in one scenario run.',
      'Log the Certify response payload so you can capture certificate IDs or batch job IDs downstream.',
    ],
  },
  google_sheets: {
    provider: 'google_sheets',
    headline: 'Turn spreadsheet rows into repeatable certificate runs without leaving Sheets.',
    setupLead:
      'Drive certificate issuance from Apps Script, Sheet automations, or a Zapier/Make bridge whenever new rows appear.',
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
      { source: 'Column A: Recipient Name', target: 'recipientName', example: 'Mina Patel' },
      { source: 'Column B: Recipient Email', target: 'recipientEmail', example: 'mina@example.com' },
      { source: 'Column C: Track / Workshop', target: 'certificateTitle', example: 'Workshop Completion' },
      { source: 'Column D: Issue Date', target: 'issueDate', example: '2026-04-04' },
    ],
    recipes: [
      {
        id: 'sheets-roster-sync',
        name: 'Roster Sync Batch',
        summary: 'Bundle approved rows into one batch request for training cohorts or partner lists.',
        mode: 'batch',
        recommendedTemplateCategory: 'general',
        templateHint: 'General templates adapt well to several spreadsheet-driven certificate types.',
        keywords: ['general', 'excellence', 'versatile'],
        certificateTitle: 'Roster Completion Certificate',
        issuerName: 'Program Operations',
        description: 'A spreadsheet-first batch workflow for cohorts reviewed in shared sheets.',
        automationHint:
          'Filter approved rows in Sheets or Apps Script, then POST them as a data array to Certify.',
      },
      {
        id: 'sheets-event-attendance',
        name: 'Event Attendance Rollup',
        summary: 'Issue event certificates from a checked-in attendee sheet at the end of the day.',
        mode: 'batch',
        recommendedTemplateCategory: 'event',
        templateHint: 'Use an event layout when the certificate is tied to attendance or participation.',
        keywords: ['event', 'achievement', 'attendance'],
        certificateTitle: 'Certificate of Participation',
        issuerName: 'Event Operations',
        description: 'A batch run that converts checked-in rows into attendee certificates.',
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
  moodle: {
    provider: 'moodle',
    headline: 'Issue learner certificates when Moodle course, cohort, or assessment milestones are reached.',
    setupLead:
      'Treat Certify as the branded certificate layer on top of Moodle completion data and learner records.',
    idealFor: [
      'Course completion events for professional learning programs',
      'Cohort-based certification journeys with branded PDFs',
      'Assessment distinction flows that need a polished certificate output',
    ],
    onboardingChecklist: [
      'Identify the Moodle event or export that contains the learner name and email.',
      'Choose an academic template for most completion and cohort use cases.',
      'Decide whether Moodle sends one learner at a time or a scheduled batch export.',
      'Test with one learner record before you connect a live course.',
    ],
    setupSteps: [
      {
        title: 'Capture completion data',
        description:
          'Use Moodle events, middleware, or scheduled exports to capture completed learners.',
      },
      {
        title: 'Map learner fields',
        description:
          'Pass the learner full name, email, course title, and completion date into the webhook payload.',
      },
      {
        title: 'Attach the right template',
        description:
          'Point the workflow to an academic or branded training template that matches the program.',
      },
      {
        title: 'Return the certificate link',
        description:
          'Enable auto PDF generation when your middleware should store or email the issued document URL.',
      },
    ],
    fieldMappings: [
      { source: 'Moodle full name', target: 'recipientName', example: 'Samira Khan' },
      { source: 'Moodle email', target: 'recipientEmail', example: 'samira@example.com' },
      { source: 'Course fullname', target: 'certificateTitle', example: 'Advanced Facilitation' },
      { source: 'Completion time', target: 'issueDate', example: '2026-04-04T07:00:00.000Z' },
    ],
    recipes: [
      {
        id: 'moodle-course-completion',
        name: 'Course Completion Certificate',
        summary: 'Deliver a branded certificate each time a learner finishes a Moodle course.',
        mode: 'single',
        recommendedTemplateCategory: 'academic',
        templateHint: 'Academic templates reinforce trust for schools, academies, and training orgs.',
        keywords: ['academic', 'classic', 'course'],
        certificateTitle: 'Course Completion Certificate',
        issuerName: 'Learning Academy',
        description: 'Automatically awarded when the learner reaches the required Moodle completion criteria.',
        automationHint:
          'Send the course fullname and learner record from Moodle or a middleware job into Certify.',
      },
      {
        id: 'moodle-cohort-mastery',
        name: 'Cohort Mastery Awards',
        summary: 'Celebrate a completed Moodle cohort with one learner certificate per milestone.',
        mode: 'single',
        recommendedTemplateCategory: 'general',
        templateHint: 'General templates are useful when one cohort spans several program types.',
        keywords: ['general', 'mastery', 'cohort'],
        certificateTitle: 'Cohort Mastery Award',
        issuerName: 'Program Faculty',
        description: 'A branded learner certificate for milestones reached during a Moodle cohort journey.',
        automationHint:
          'Use cohort membership or milestone logic in your middleware, then trigger Certify when the learner is eligible.',
      },
    ],
    qaChecks: [
      'Verify Moodle exports contain a deliverable email address before issuing certificates.',
      'Use a separate template per program when accreditation wording changes.',
      'Keep PDF generation on when another LMS step needs a stored certificate link.',
    ],
  },
  canvas: {
    provider: 'canvas',
    headline: 'Connect Canvas achievements, mastery paths, and capstones to branded certificate delivery.',
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
      { source: 'Canvas user.name', target: 'recipientName', example: 'Nora Bennett' },
      { source: 'Canvas user.email', target: 'recipientEmail', example: 'nora@example.com' },
      { source: 'Course or module title', target: 'certificateTitle', example: 'Capstone Completion' },
      { source: 'Finished at timestamp', target: 'issueDate', example: '2026-04-04T15:45:00.000Z' },
    ],
    recipes: [
      {
        id: 'canvas-course-completion',
        name: 'Course Completion Certificates',
        summary: 'Issue a certificate as soon as a learner completes the full Canvas course path.',
        mode: 'single',
        recommendedTemplateCategory: 'academic',
        templateHint: 'Academic templates are the safest default for institution-led course completions.',
        keywords: ['academic', 'classic', 'course'],
        certificateTitle: 'Course Completion Certificate',
        issuerName: 'Academic Programs Office',
        description: 'Returned after the learner satisfies the Canvas course completion rules.',
        automationHint:
          'Trigger once the full course is marked complete, then store the returned pdfUrl in your Canvas-side workflow.',
      },
      {
        id: 'canvas-module-mastery',
        name: 'Module Mastery Certificates',
        summary: 'Issue a certificate every time a learner completes a mastery path or key module.',
        mode: 'single',
        recommendedTemplateCategory: 'academic',
        templateHint: 'Academic templates work well for high-trust student learning outcomes.',
        keywords: ['academic', 'classic', 'module'],
        certificateTitle: 'Module Mastery Certificate',
        issuerName: 'Continuing Education Office',
        description: 'Granted after a learner completes the defined Canvas mastery milestone.',
        automationHint:
          'Use Canvas completion data, then push the learner record and module title into Certify.',
      },
      {
        id: 'canvas-capstone-completion',
        name: 'Capstone Completion',
        summary: 'Create a premium completion certificate for a capstone or final program deliverable.',
        mode: 'single',
        recommendedTemplateCategory: 'corporate',
        templateHint: 'Corporate or modern layouts create a polished executive education look.',
        keywords: ['modern', 'professional', 'capstone'],
        certificateTitle: 'Capstone Completion Certificate',
        issuerName: 'Executive Learning Studio',
        description: 'A certificate for successful completion of a culminating Canvas experience.',
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
    headline: 'Use the Certify webhook contract from internal tools, portals, or any HTTPS-capable service.',
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
      { source: 'POST body user.name', target: 'recipientName', example: 'Riley Chen' },
      { source: 'POST body user.email', target: 'recipientEmail', example: 'riley@example.com' },
      { source: 'POST body achievement.label', target: 'certificateTitle', example: 'Partner Certification' },
      { source: 'POST body completedAt', target: 'issueDate', example: '2026-04-04T18:15:00.000Z' },
    ],
    recipes: [
      {
        id: 'custom-partner-portal',
        name: 'Partner Portal Badge Issue',
        summary: 'Issue one certificate from a partner-facing admin or badge approval tool.',
        mode: 'single',
        recommendedTemplateCategory: 'general',
        templateHint: 'General templates are ideal when partners span multiple programs or award types.',
        keywords: ['general', 'partner', 'badge'],
        certificateTitle: 'Partner Certification',
        issuerName: 'Partner Enablement Team',
        description: 'Awarded from an internal or partner-facing tool once a reviewer approves the achievement.',
        automationHint:
          'Post a simple JSON document from your portal after approval and store the returned certificate identifiers.',
      },
      {
        id: 'custom-event-scanner',
        name: 'Event Scanner Sync',
        summary: 'Convert device check-ins or scanner exports into a scheduled batch certificate run.',
        mode: 'batch',
        recommendedTemplateCategory: 'event',
        templateHint: 'Event templates work best for workshops, summits, and attendance-based programs.',
        keywords: ['event', 'attendance', 'scanner'],
        certificateTitle: 'Event Attendance Certificate',
        issuerName: 'Experience Team',
        description: 'A batch payload for attendee lists produced by custom event systems or scanners.',
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
  const normalizedKeywords = recipe.keywords.map((keyword) => keyword.toLowerCase());

  const keywordMatch = templates.find((template) => {
    const haystack = `${template.name} ${template.description}`.toLowerCase();
    return normalizedKeywords.some((keyword) => haystack.includes(keyword));
  });

  if (keywordMatch) {
    return keywordMatch;
  }

  return (
    templates.find((template) => template.category === recipe.recommendedTemplateCategory) ||
    templates[0]
  );
};
