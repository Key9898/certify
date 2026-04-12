import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildCanvasCertificateMessage,
  normalizeCanvasBaseUrl,
  postCanvasSubmissionComment,
  testCanvasConnection,
  type CanvasResolvedConfig,
} from './canvasService';

const withCanvasEnv = async (callback: () => Promise<void>) => {
  const previousCanvasToken = process.env.CANVAS_API_TOKEN;
  const previousFrontendUrl = process.env.FRONTEND_URL;

  process.env.CANVAS_API_TOKEN = 'canvas-token';
  process.env.FRONTEND_URL = 'https://certify.app';

  try {
    await callback();
  } finally {
    process.env.CANVAS_API_TOKEN = previousCanvasToken;
    process.env.FRONTEND_URL = previousFrontendUrl;
  }
};

describe('canvasService', () => {
  it('normalizes the Canvas base URL and builds certificate messages', () => {
    assert.equal(
      normalizeCanvasBaseUrl('https://canvas.school.edu/'),
      'https://canvas.school.edu'
    );
  });

  it('includes verification links when a frontend URL is configured', async () => {
    await withCanvasEnv(async () => {
      const message = buildCanvasCertificateMessage({
        recipientName: 'Ava Morgan',
        certificateTitle: 'Capstone Completion',
        publicCertificateId: 'CERT-AVA-001',
        pdfUrl: 'https://example.com/ava.pdf',
      });

      assert.match(message, /Capstone Completion/);
      assert.match(message, /CERT-AVA-001/);
      assert.match(message, /verify\/CERT-AVA-001/);
    });
  });

  it('tests the Canvas course connection with the configured API token', async () => {
    await withCanvasEnv(async () => {
      const requests: Array<{ url: string; init?: RequestInit }> = [];
      const config: CanvasResolvedConfig = {
        baseUrl: 'https://canvas.school.edu',
        courseId: '42',
        assignmentId: '9',
        moduleId: undefined,
        completionPreset: 'course_completion',
        returnMode: 'submission_comment',
      };

      const mockFetch: typeof fetch = async (input, init) => {
        requests.push({
          url: typeof input === 'string' ? input : input.toString(),
          init,
        });

        return new Response(
          JSON.stringify({
            id: 42,
            name: 'Executive Leadership',
            course_code: 'LEAD-500',
          }),
          { status: 200 }
        );
      };

      const result = await testCanvasConnection(config, mockFetch);

      assert.equal(result.courseName, 'Executive Leadership');
      assert.equal(result.courseCode, 'LEAD-500');
      assert.match(requests[0].url, /\/api\/v1\/courses\/42$/);
    });
  });

  it('posts a submission comment when returning certificate details back to Canvas', async () => {
    await withCanvasEnv(async () => {
      const requests: Array<{ url: string; init?: RequestInit }> = [];
      const config: CanvasResolvedConfig = {
        baseUrl: 'https://canvas.school.edu',
        courseId: '42',
        assignmentId: '8',
        moduleId: undefined,
        completionPreset: 'capstone_completion',
        returnMode: 'submission_comment',
      };

      const mockFetch: typeof fetch = async (input, init) => {
        requests.push({
          url: typeof input === 'string' ? input : input.toString(),
          init,
        });
        return new Response(JSON.stringify({ ok: true }), { status: 200 });
      };

      await postCanvasSubmissionComment(
        config,
        {
          userId: '12345',
          message: 'Certificate ready',
        },
        mockFetch
      );

      assert.match(requests[0].url, /assignments\/8\/submissions\/12345$/);
      assert.equal(
        requests[0].init?.headers
          ? (requests[0].init.headers as Record<string, string>)['Content-Type']
          : undefined,
        'application/x-www-form-urlencoded'
      );
      assert.match(
        String(requests[0].init?.body),
        /comment%5Btext_comment%5D=Certificate\+ready/
      );
    });
  });
});
