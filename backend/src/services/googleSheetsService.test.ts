import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import crypto from 'crypto';
import {
  buildGoogleBatchUpdateData,
  columnNumberToLetter,
  createGoogleServiceAccountAssertion,
  syncGoogleSheetsRows,
  type GoogleSheetsResolvedConfig,
} from './googleSheetsService';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const GOOGLE_PRIVATE_KEY = privateKey.export({
  type: 'pkcs8',
  format: 'pem',
}).toString();

const withGoogleEnv = async (callback: () => Promise<void>) => {
  const previousEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const previousKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'certify-tests@project.iam.gserviceaccount.com';
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = GOOGLE_PRIVATE_KEY;

  try {
    await callback();
  } finally {
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = previousEmail;
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = previousKey;
  }
};

describe('googleSheetsService', () => {
  it('converts spreadsheet columns into A1 notation letters', () => {
    assert.equal(columnNumberToLetter(1), 'A');
    assert.equal(columnNumberToLetter(26), 'Z');
    assert.equal(columnNumberToLetter(27), 'AA');
    assert.equal(columnNumberToLetter(52), 'AZ');
  });

  it('builds batch cell updates from sheet headers and row updates', () => {
    const config: GoogleSheetsResolvedConfig = {
      spreadsheetId: 'sheet-id',
      sheetName: 'Ready to Issue',
      statusColumn: 'Certify Status',
      certificateIdColumn: 'Certify ID',
      pdfUrlColumn: 'Certificate PDF URL',
      batchJobIdColumn: 'Certify Batch ID',
      processedAtColumn: 'Processed At',
    };

    const updates = buildGoogleBatchUpdateData(
      config,
      [
        'Recipient Name',
        'Recipient Email',
        'Certify Status',
        'Certify ID',
        'Certificate PDF URL',
        'Certify Batch ID',
        'Processed At',
      ],
      [
        {
          rowNumber: 4,
          status: 'Issued',
          certificateId: 'CERT-001',
          pdfUrl: 'https://example.com/certificate.pdf',
          batchJobId: 'batch-123',
          processedAt: '2026-04-05T10:00:00.000Z',
        },
      ]
    );

    assert.deepEqual(updates, [
      { range: 'Ready to Issue!C4', values: [['Issued']] },
      { range: 'Ready to Issue!D4', values: [['CERT-001']] },
      {
        range: 'Ready to Issue!E4',
        values: [['https://example.com/certificate.pdf']],
      },
      { range: 'Ready to Issue!F4', values: [['batch-123']] },
      { range: 'Ready to Issue!G4', values: [['2026-04-05T10:00:00.000Z']] },
    ]);
  });

  it('creates a signed JWT assertion for the Google OAuth exchange', () => {
    const assertion = createGoogleServiceAccountAssertion(
      'certify-tests@project.iam.gserviceaccount.com',
      GOOGLE_PRIVATE_KEY,
      1_700_000_000
    );

    assert.equal(assertion.split('.').length, 3);
  });

  it('syncs queued and issued values through the Google Sheets batch update endpoint', async () => {
    await withGoogleEnv(async () => {
      const requests: Array<{ url: string; init?: RequestInit }> = [];
      const mockFetch: typeof fetch = async (input, init) => {
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

        return new Response(JSON.stringify({ totalUpdatedCells: 5 }), { status: 200 });
      };

      const result = await syncGoogleSheetsRows(
        {
          spreadsheetId: 'spreadsheet-id',
          sheetName: 'Ready to Issue',
          statusColumn: 'Certify Status',
          certificateIdColumn: 'Certify ID',
          pdfUrlColumn: 'Certificate PDF URL',
          batchJobIdColumn: 'Certify Batch ID',
          processedAtColumn: 'Processed At',
        },
        [
          {
            rowNumber: 5,
            status: 'Issued',
            certificateId: 'CERT-5',
            pdfUrl: 'https://example.com/5.pdf',
            batchJobId: 'batch-5',
            processedAt: '2026-04-05T10:15:00.000Z',
          },
        ],
        mockFetch
      );

      assert.equal(result.updatedCells, 5);
      assert.equal(requests.length, 3);
      assert.match(requests[2].url, /values:batchUpdate$/);
      assert.match(String(requests[2].init?.body), /CERT-5/);
    });
  });
});
