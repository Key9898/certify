import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  GraduationCap,
  Code,
  ChevronDown,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import type { IntegrationProvider } from '@/types/integration';
import {
  REVEAL_ITEM,
  STAGGER_CONTAINER,
  QUICK_SPRING,
  TAP_PRESS,
} from '@/utils/motion';

interface IntegrationDocumentationProps {
  onCreateIntegration: (provider: IntegrationProvider) => void;
}

interface GuideSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const providerConfig = {
  google_sheets: {
    icon: FileSpreadsheet,
    label: 'Google Sheets',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  canvas: {
    icon: GraduationCap,
    label: 'Canvas LMS',
    color: 'text-info',
    bgColor: 'bg-info/10',
  },
  custom: {
    icon: Code,
    label: 'Custom Webhook',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
};

const CodeBlock: React.FC<{ code: string; language?: string }> = ({
  code,
  language = 'json',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg bg-base-200 p-4 font-mono text-sm">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-base-300 p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
      >
        {copied ? (
          <Check size={14} className="text-success" />
        ) : (
          <Copy size={14} className="text-base-content/60" />
        )}
      </button>
      <pre className="overflow-x-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};

const CollapsibleSection: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-lg border border-base-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <span className="font-medium text-base-content">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={QUICK_SPRING}
        >
          <ChevronDown size={18} className="text-base-content/50" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-base-200 p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const IntegrationDocumentation: React.FC<
  IntegrationDocumentationProps
> = ({ onCreateIntegration }) => {
  const [activeProvider, setActiveProvider] =
    useState<IntegrationProvider>('google_sheets');

  const googleSheetsSections: GuideSection[] = [
    {
      id: 'setup',
      title: 'Setup Guide',
      content: (
        <div className="space-y-4">
          <ol className="list-inside list-decimal space-y-3 text-sm text-base-content/80">
            <li>
              <strong>Create a Google Cloud Project</strong>
              <p className="mt-1 text-base-content/60">
                Go to Google Cloud Console and create a new project or select an
                existing one.
              </p>
            </li>
            <li>
              <strong>Enable Google Sheets API</strong>
              <p className="mt-1 text-base-content/60">
                Navigate to APIs & Services → Library and enable the Google
                Sheets API.
              </p>
            </li>
            <li>
              <strong>Create Service Account</strong>
              <p className="mt-1 text-base-content/60">
                Go to APIs & Services → Credentials, create a Service Account,
                and download the JSON key file.
              </p>
            </li>
            <li>
              <strong>Share Your Spreadsheet</strong>
              <p className="mt-1 text-base-content/60">
                Share your Google Sheet with the service account email address
                (found in the JSON key).
              </p>
            </li>
            <li>
              <strong>Get Spreadsheet ID</strong>
              <p className="mt-1 text-base-content/60">
                The ID is in your spreadsheet URL:
                https://docs.google.com/spreadsheets/d/
                <strong>SPREADSHEET_ID</strong>/edit
              </p>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'data-format',
      title: 'Data Format',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            Your Google Sheet should have these columns (headers in row 1):
          </p>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Required</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">recipientName</td>
                  <td>
                    <span className="badge badge-error badge-xs">Required</span>
                  </td>
                  <td>Recipient's full name</td>
                </tr>
                <tr>
                  <td className="font-mono">certificateTitle</td>
                  <td>
                    <span className="badge badge-error badge-xs">Required</span>
                  </td>
                  <td>Title of the certificate</td>
                </tr>
                <tr>
                  <td className="font-mono">recipientEmail</td>
                  <td>
                    <span className="badge badge-ghost badge-xs">Optional</span>
                  </td>
                  <td>Recipient's email address</td>
                </tr>
                <tr>
                  <td className="font-mono">issueDate</td>
                  <td>
                    <span className="badge badge-ghost badge-xs">Optional</span>
                  </td>
                  <td>Custom issue date (default: today)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'auto-columns',
      title: 'Auto-Generated Columns',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            After processing, these columns are automatically populated:
          </p>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-mono">Status</td>
                  <td>Processing status (pending, completed, failed)</td>
                </tr>
                <tr>
                  <td className="font-mono">CertificateID</td>
                  <td>Unique certificate identifier</td>
                </tr>
                <tr>
                  <td className="font-mono">PdfUrl</td>
                  <td>Direct link to the generated PDF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
  ];

  const canvasSections: GuideSection[] = [
    {
      id: 'setup',
      title: 'Setup Guide',
      content: (
        <div className="space-y-4">
          <ol className="list-inside list-decimal space-y-3 text-sm text-base-content/80">
            <li>
              <strong>Get Canvas API Token</strong>
              <p className="mt-1 text-base-content/60">
                In Canvas, go to Account → Settings → Approved Integrations →
                New Access Token
              </p>
            </li>
            <li>
              <strong>Note Your Canvas URL</strong>
              <p className="mt-1 text-base-content/60">
                This is your institution's Canvas domain (e.g.,
                https://school.instructure.com)
              </p>
            </li>
            <li>
              <strong>Find Course ID</strong>
              <p className="mt-1 text-base-content/60">
                Navigate to your course and find the ID in the URL: /courses/
                <strong>COURSE_ID</strong>
              </p>
            </li>
            <li>
              <strong>Configure Completion Trigger</strong>
              <p className="mt-1 text-base-content/60">
                Choose when certificates should be generated: course completion,
                module completion, or capstone completion.
              </p>
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'completion-presets',
      title: 'Completion Presets',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="rounded-lg border border-base-200 p-4">
              <h4 className="font-medium text-base-content">
                Course Completion
              </h4>
              <p className="mt-1 text-sm text-base-content/60">
                Certificate generated when student completes all required course
                items.
              </p>
            </div>
            <div className="rounded-lg border border-base-200 p-4">
              <h4 className="font-medium text-base-content">
                Module Completion
              </h4>
              <p className="mt-1 text-sm text-base-content/60">
                Certificate generated when student completes a specific module.
              </p>
            </div>
            <div className="rounded-lg border border-base-200 p-4">
              <h4 className="font-medium text-base-content">
                Capstone Completion
              </h4>
              <p className="mt-1 text-sm text-base-content/60">
                Certificate generated when student completes a capstone
                project/assignment.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'return-modes',
      title: 'Return Modes',
      content: (
        <div className="space-y-4">
          <div className="grid gap-3">
            <div className="rounded-lg border border-base-200 p-4">
              <h4 className="font-medium text-base-content">Response Only</h4>
              <p className="mt-1 text-sm text-base-content/60">
                Certificate data is returned in the API response. Your system
                handles delivery.
              </p>
            </div>
            <div className="rounded-lg border border-base-200 p-4">
              <h4 className="font-medium text-base-content">
                Submission Comment
              </h4>
              <p className="mt-1 text-sm text-base-content/60">
                Certificate link is automatically posted as a comment on the
                student's submission.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const customSections: GuideSection[] = [
    {
      id: 'webhook-url',
      title: 'Webhook URL',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            After creating a custom webhook integration, you'll receive a unique
            URL:
          </p>
          <CodeBlock
            code={`POST https://your-domain.com/api/webhooks/{integration_id}`}
            language="http"
          />
          <p className="text-sm text-base-content/60">
            Replace{' '}
            <code className="rounded bg-base-200 px-1 py-0.5">
              {'{integration_id}'}
            </code>{' '}
            with your integration's ID.
          </p>
        </div>
      ),
    },
    {
      id: 'request-format',
      title: 'Request Format',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            Send a POST request with the following JSON body:
          </p>
          <CodeBlock
            code={`{
  "recipientName": "John Doe",
  "certificateTitle": "Course Completion Certificate",
  "recipientEmail": "john@example.com",
  "issueDate": "2024-01-15",
  "customFields": {
    "department": "Engineering",
    "score": "95"
  }
}`}
            language="json"
          />
        </div>
      ),
    },
    {
      id: 'response-format',
      title: 'Response Format',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            Successful response includes certificate details:
          </p>
          <CodeBlock
            code={`{
  "success": true,
  "certificate": {
    "id": "cert_abc123",
    "recipientName": "John Doe",
    "certificateTitle": "Course Completion Certificate",
    "pdfUrl": "https://storage.example.com/certs/cert_abc123.pdf",
    "verifyUrl": "https://your-domain.com/verify/cert_abc123"
  }
}`}
            language="json"
          />
        </div>
      ),
    },
    {
      id: 'authentication',
      title: 'Authentication',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            Include your API key in the request header:
          </p>
          <CodeBlock code={`X-API-Key: your_api_key_here`} language="http" />
          <p className="text-sm text-base-content/60">
            You can generate API keys in the Settings page.
          </p>
        </div>
      ),
    },
    {
      id: 'hmac-signature',
      title: 'HMAC Signature (Optional)',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-base-content/80">
            For enhanced security, enable HMAC signature verification. The
            webhook will include:
          </p>
          <CodeBlock
            code={`X-Signature: sha256=<hex_encoded_signature>`}
            language="http"
          />
          <p className="mt-2 text-sm text-base-content/60">
            The signature is generated using HMAC-SHA256 with your secret key
            over the request body.
          </p>
        </div>
      ),
    },
  ];

  const sections: Record<IntegrationProvider, GuideSection[]> = {
    google_sheets: googleSheetsSections,
    canvas: canvasSections,
    custom: customSections,
  };

  return (
    <motion.div
      variants={STAGGER_CONTAINER}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-base-content">Documentation</h2>
        <p className="text-sm text-base-content/60">
          Integration guides and API references
        </p>
      </div>

      <motion.div
        variants={REVEAL_ITEM}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {(Object.keys(providerConfig) as IntegrationProvider[]).map(
          (provider) => {
            const config = providerConfig[provider];
            return (
              <motion.button
                key={provider}
                onClick={() => setActiveProvider(provider)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-lg border-2 px-4 py-2 transition-colors ${
                  activeProvider === provider
                    ? 'border-primary bg-primary/5'
                    : 'border-base-200 hover:border-base-300'
                }`}
                whileHover={{ y: -2 }}
                whileTap={TAP_PRESS}
                transition={QUICK_SPRING}
              >
                <config.icon size={18} className={config.color} />
                <span className="font-medium text-base-content">
                  {config.label}
                </span>
              </motion.button>
            );
          }
        )}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeProvider}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <BookOpen size={20} className="mt-0.5 text-primary" />
              <div>
                <h3 className="font-bold text-base-content">
                  {providerConfig[activeProvider].label} Integration
                </h3>
                <p className="mt-1 text-sm text-base-content/60">
                  Follow the guides below to set up your integration. Need help?{' '}
                  <a href="#" className="text-primary hover:underline">
                    Contact support
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {sections[activeProvider].map((section, index) => (
              <CollapsibleSection
                key={section.id}
                title={section.title}
                defaultOpen={index === 0}
              >
                {section.content}
              </CollapsibleSection>
            ))}
          </div>

          <motion.button
            onClick={() => onCreateIntegration(activeProvider)}
            className="btn btn-primary w-full rounded font-bold"
            whileHover={{ y: -2 }}
            whileTap={TAP_PRESS}
            transition={QUICK_SPRING}
          >
            Create {providerConfig[activeProvider].label} Integration
          </motion.button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};
