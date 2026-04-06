import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import crypto from 'node:crypto';
import type { IBatchJobDocument } from '../models/BatchJob';
import type { IIntegrationDocument } from '../models/Integration';
import {
  syncBatchJobNativeResults,
  syncSingleIntegrationNativeResult,
} from './nativeIntegrationService';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const GOOGLE_PRIVATE_KEY = privateKey.export({
  type: 'pkcs8',
  format: 'pem',
}).toString();

describe('nativeIntegrationService integration', () => {
  it('writes batch completion results back to Google Sheets', async () => {
    const previousEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const previousKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'certify-tests@project.iam.gserviceaccount.com';
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = GOOGLE_PRIVATE_KEY;

    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const originalFetch = global.fetch;
    global.fetch = (async (input, init) => {
      const url = typeof input === 'string' ? input : input.toString();
      requests.push({ url, init });

      if (url.includes('oauth2.googleapis.com/token')) {
        return new Response(
          JSON.stringify({ access_token: 'google-token', expires_in: 3600 }),
          { status: 200 }
        );
      }

      if (url.includes('/values/Ready%20to%20Issue!1%3A1')) {
        return new Response(
          JSON.stringify({
            values: [[
              'Recipient Name',
              'Certify Status',
              'Certify ID',
              'Certificate PDF URL',
              'Certify Batch ID',
              'Processed At',
            ]],
          }),
          { status: 200 }
        );
      }

      return new Response(JSON.stringify({ totalUpdatedCells: 10 }), { status: 200 });
    }) as typeof fetch;

    try {
      const job = {
        integrationContext: {
          provider: 'google_sheets',
          googleSheets: {
            spreadsheetId: 'spreadsheet-id',
            sheetName: 'Ready to Issue',
            statusColumn: 'Certify Status',
            certificateIdColumn: 'Certify ID',
            pdfUrlColumn: 'Certificate PDF URL',
            batchJobIdColumn: 'Certify Batch ID',
            processedAtColumn: 'Processed At',
            rows: [
              { rowNumber: 2, recipientName: 'Ava Morgan' },
              { rowNumber: 3, recipientName: 'Noah Bennett' },
            ],
          },
        },
        results: [
          {
            recipientName: 'Ava Morgan',
            status: 'success',
            publicCertificateId: 'CERT-AVA-001',
            pdfUrl: 'https://example.com/ava.pdf',
          },
          {
            recipientName: 'Noah Bennett',
            status: 'failed',
            error: 'Template mismatch',
          },
        ],
      } as IBatchJobDocument;

      await syncBatchJobNativeResults(job);

      assert.match(requests[requests.length - 1].url, /values:batchUpdate$/);
      assert.match(String(requests[requests.length - 1].init?.body), /CERT-AVA-001/);
      assert.match(String(requests[requests.length - 1].init?.body), /Failed/);
    } finally {
      global.fetch = originalFetch;
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = previousEmail;
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = previousKey;
    }
  });

  it('returns certificate links back to Canvas when submission comments are enabled', async () => {
    const previousCanvasToken = process.env.CANVAS_API_TOKEN;
    const previousFrontendUrl = process.env.FRONTEND_URL;

    process.env.CANVAS_API_TOKEN = 'canvas-token';
    process.env.FRONTEND_URL = 'https://certify.app';

    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const originalFetch = global.fetch;
    global.fetch = (async (input, init) => {
      requests.push({
        url: typeof input === 'string' ? input : input.toString(),
        init,
      });
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    try {
      const integration = {
        provider: 'canvas',
        settings: {
          autoGeneratePdf: true,
          canvas: {
            enabled: true,
            baseUrl: 'https://canvas.school.edu',
            courseId: '42',
            assignmentId: '8',
            completionPreset: 'course_completion',
            returnMode: 'submission_comment',
          },
        },
      } as IIntegrationDocument;

      await syncSingleIntegrationNativeResult({
        integration,
        publicCertificateId: 'CERT-CANVAS-001',
        recipientName: 'Ava Morgan',
        certificateTitle: 'Capstone Completion',
        pdfUrl: 'https://example.com/capstone.pdf',
        canvas: {
          userId: '12345',
        },
      });

      assert.match(requests[0].url, /assignments\/8\/submissions\/12345$/);
      assert.match(String(requests[0].init?.body), /CERT-CANVAS-001/);
    } finally {
      global.fetch = originalFetch;
      process.env.CANVAS_API_TOKEN = previousCanvasToken;
      process.env.FRONTEND_URL = previousFrontendUrl;
    }
  });
});
