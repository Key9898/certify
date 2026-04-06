import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  buildCanvasCertificateMessage,
  normalizeCanvasBaseUrl,
  postCanvasSubmissionComment,
  testCanvasConnection,
  type CanvasResolvedConfig,
} from './services/canvasService';
import {
  buildGoogleBatchUpdateData,
  columnNumberToLetter,
  createGoogleServiceAccountAssertion,
  syncGoogleSheetsRows,
  type GoogleSheetsResolvedConfig,
} from './services/googleSheetsService';
import type { IBatchJobDocument } from './models/BatchJob';
import type { IIntegrationDocument } from './models/Integration';
import {
  syncBatchJobNativeResults,
  syncSingleIntegrationNativeResult,
} from './services/nativeIntegrationService';

const { privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
});

const GOOGLE_PRIVATE_KEY = privateKey.export({
  type: 'pkcs8',
  format: 'pem',
}).toString();

type AsyncTestCase = {
  name: string;
  integration?: boolean;
  run: () => Promise<void>;
};

const withEnv = async (
  values: Record<string, string>,
  callback: () => Promise<void>
): Promise<void> => {
  const previousEntries = Object.entries(values).map(([key]) => [key, process.env[key]] as const);

  Object.entries(values).forEach(([key, value]) => {
    process.env[key] = value;
  });

  try {
    await callback();
  } finally {
    previousEntries.forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  }
};

const withMockFetch = async (
  mockFetch: typeof fetch,
  callback: () => Promise<void>
): Promise<void> => {
  const originalFetch = global.fetch;
  global.fetch = mockFetch;

  try {
    await callback();
  } finally {
    global.fetch = originalFetch;
  }
};

const tests: AsyncTestCase[] = [
  {
    name: 'googleSheetsService converts column numbers into sheet letters',
    run: async () => {
      assert.equal(columnNumberToLetter(1), 'A');
      assert.equal(columnNumberToLetter(26), 'Z');
      assert.equal(columnNumberToLetter(27), 'AA');
      assert.equal(columnNumberToLetter(52), 'AZ');
    },
  },
  {
    name: 'googleSheetsService builds batch updates from headers and rows',
    run: async () => {
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
    },
  },
  {
    name: 'googleSheetsService signs a valid-looking JWT assertion',
    run: async () => {
      const assertion = createGoogleServiceAccountAssertion(
        'certify-tests@project.iam.gserviceaccount.com',
        GOOGLE_PRIVATE_KEY,
        1_700_000_000
      );

      assert.equal(assertion.split('.').length, 3);
    },
  },
  {
    name: 'googleSheetsService syncs row values through the batch update API',
    run: async () => {
      await withEnv(
        {
          GOOGLE_SERVICE_ACCOUNT_EMAIL: 'certify-tests@project.iam.gserviceaccount.com',
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: GOOGLE_PRIVATE_KEY,
        },
        async () => {
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

            return new Response(JSON.stringify({ totalUpdatedCells: 5 }), {
              status: 200,
            });
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
          assert.match(requests[requests.length - 1].url, /values:batchUpdate$/);
          assert.match(String(requests[requests.length - 1].init?.body), /CERT-5/);
        }
      );
    },
  },
  {
    name: 'canvasService normalizes URLs and builds verification messages',
    run: async () => {
      await withEnv({ FRONTEND_URL: 'https://certify.app' }, async () => {
        assert.equal(
          normalizeCanvasBaseUrl('https://canvas.school.edu/'),
          'https://canvas.school.edu'
        );

        const message = buildCanvasCertificateMessage({
          recipientName: 'Ava Morgan',
          certificateTitle: 'Capstone Completion',
          publicCertificateId: 'CERT-AVA-001',
          pdfUrl: 'https://example.com/ava.pdf',
        });

        assert.match(message, /verify\/CERT-AVA-001/);
      });
    },
  },
  {
    name: 'canvasService validates a course connection and posts submission comments',
    run: async () => {
      await withEnv(
        {
          CANVAS_API_TOKEN: 'canvas-token',
          FRONTEND_URL: 'https://certify.app',
        },
        async () => {
          const requests: Array<{ url: string; init?: RequestInit }> = [];
          const config: CanvasResolvedConfig = {
            baseUrl: 'https://canvas.school.edu',
            courseId: '42',
            assignmentId: '8',
            moduleId: undefined,
            completionPreset: 'course_completion',
            returnMode: 'submission_comment',
          };

          const mockFetch: typeof fetch = async (input, init) => {
            requests.push({
              url: typeof input === 'string' ? input : input.toString(),
              init,
            });

            if (requests.length === 1) {
              return new Response(
                JSON.stringify({
                  id: 42,
                  name: 'Executive Leadership',
                  course_code: 'LEAD-500',
                }),
                { status: 200 }
              );
            }

            return new Response(JSON.stringify({ ok: true }), { status: 200 });
          };

          const result = await testCanvasConnection(config, mockFetch);
          assert.equal(result.courseName, 'Executive Leadership');

          await postCanvasSubmissionComment(
            config,
            {
              userId: '12345',
              message: 'Certificate ready',
            },
            mockFetch
          );

          assert.match(requests[1].url, /assignments\/8\/submissions\/12345$/);
        }
      );
    },
  },
  {
    name: 'nativeIntegrationService writes Google Sheets batch results back to the source sheet',
    integration: true,
    run: async () => {
      await withEnv(
        {
          GOOGLE_SERVICE_ACCOUNT_EMAIL: 'certify-tests@project.iam.gserviceaccount.com',
          GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: GOOGLE_PRIVATE_KEY,
        },
        async () => {
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

            return new Response(JSON.stringify({ totalUpdatedCells: 10 }), {
              status: 200,
            });
          };

          await withMockFetch(mockFetch, async () => {
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
          });
        }
      );
    },
  },
  {
    name: 'nativeIntegrationService returns certificate links back to Canvas',
    integration: true,
    run: async () => {
      await withEnv(
        {
          CANVAS_API_TOKEN: 'canvas-token',
          FRONTEND_URL: 'https://certify.app',
        },
        async () => {
          const requests: Array<{ url: string; init?: RequestInit }> = [];
          const mockFetch: typeof fetch = async (input, init) => {
            requests.push({
              url: typeof input === 'string' ? input : input.toString(),
              init,
            });
            return new Response(JSON.stringify({ ok: true }), { status: 200 });
          };

          await withMockFetch(mockFetch, async () => {
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
          });
        }
      );
    },
  },
];

const integrationOnly = process.argv.includes('--integration-only');
const selectedTests = integrationOnly ? tests.filter((test) => test.integration) : tests;

const main = async () => {
  let completed = 0;

  for (const test of selectedTests) {
    await test.run();
    completed += 1;
    console.log(`PASS ${test.name}`);
  }

  console.log(`Completed ${completed} backend test${completed === 1 ? '' : 's'}.`);
};

main().catch((error) => {
  console.error('Backend tests failed.');
  console.error(error);
  process.exit(1);
});
