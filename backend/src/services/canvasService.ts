import type { CanvasReturnMode, ICanvasSettings } from '../models/Integration';

interface CanvasCourseResponse {
  id?: number | string;
  name?: string;
  course_code?: string;
}

export interface CanvasResolvedConfig {
  baseUrl: string;
  courseId: string;
  assignmentId?: string;
  moduleId?: string;
  completionPreset: ICanvasSettings['completionPreset'];
  returnMode: CanvasReturnMode;
}

export interface CanvasSubmissionCommentInput {
  userId: string;
  message: string;
  assignmentId?: string;
  courseId?: string;
}

const getEnvValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const getCanvasToken = (): string | undefined =>
  getEnvValue(process.env.CANVAS_API_TOKEN);

export const normalizeCanvasBaseUrl = (value: string): string =>
  value.replace(/\/+$/, '');

export const isCanvasNativeSyncReady = (
  settings?: ICanvasSettings | null
): settings is CanvasResolvedConfig =>
  Boolean(
    settings?.enabled &&
    getEnvValue(settings.baseUrl) &&
    getEnvValue(settings.courseId) &&
    getCanvasToken()
  );

export const resolveCanvasConfig = (
  settings?: ICanvasSettings | null
): CanvasResolvedConfig | null => {
  if (!isCanvasNativeSyncReady(settings)) {
    return null;
  }

  return {
    baseUrl: normalizeCanvasBaseUrl(settings.baseUrl!),
    courseId: settings.courseId!.trim(),
    assignmentId: getEnvValue(settings.assignmentId),
    moduleId: getEnvValue(settings.moduleId),
    completionPreset: settings.completionPreset || 'course_completion',
    returnMode: settings.returnMode || 'response_only',
  };
};

export const buildCanvasApiUrl = (baseUrl: string, path: string): string =>
  `${normalizeCanvasBaseUrl(baseUrl)}${path}`;

const getCanvasHeaders = (): Record<string, string> => {
  const token = getCanvasToken();
  if (!token) {
    throw new Error(
      'Canvas native sync is not configured. Set CANVAS_API_TOKEN in the backend environment.'
    );
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const buildCanvasCertificateMessage = ({
  recipientName,
  certificateTitle,
  publicCertificateId,
  pdfUrl,
}: {
  recipientName: string;
  certificateTitle: string;
  publicCertificateId: string;
  pdfUrl?: string;
}): string => {
  const verificationBaseUrl = getEnvValue(process.env.FRONTEND_URL);
  const verificationUrl = verificationBaseUrl
    ? `${verificationBaseUrl.replace(/\/$/, '')}/verify/${publicCertificateId}`
    : undefined;

  const lines = [
    `Certificate created for ${recipientName}.`,
    `${certificateTitle} (${publicCertificateId})`,
  ];

  if (pdfUrl) {
    lines.push(`PDF: ${pdfUrl}`);
  }

  if (verificationUrl) {
    lines.push(`Verify: ${verificationUrl}`);
  }

  return lines.join('\n');
};

export const fetchCanvasCourse = async (
  config: CanvasResolvedConfig,
  fetchImpl: typeof fetch = fetch
): Promise<CanvasCourseResponse> => {
  const response = await fetchImpl(
    buildCanvasApiUrl(
      config.baseUrl,
      `/api/v1/courses/${encodeURIComponent(config.courseId)}`
    ),
    {
      headers: getCanvasHeaders(),
      signal: AbortSignal.timeout(10_000),
    }
  );

  const result = (await response.json()) as CanvasCourseResponse;

  if (!response.ok) {
    throw new Error('Failed to connect to the configured Canvas course.');
  }

  return result;
};

export const postCanvasSubmissionComment = async (
  config: CanvasResolvedConfig,
  input: CanvasSubmissionCommentInput,
  fetchImpl: typeof fetch = fetch
): Promise<void> => {
  const assignmentId = input.assignmentId || config.assignmentId;
  const courseId = input.courseId || config.courseId;

  if (!assignmentId) {
    throw new Error(
      'Canvas assignmentId is required to return certificate links as submission comments.'
    );
  }

  const response = await fetchImpl(
    buildCanvasApiUrl(
      config.baseUrl,
      `/api/v1/courses/${encodeURIComponent(courseId)}/assignments/${encodeURIComponent(
        assignmentId
      )}/submissions/${encodeURIComponent(input.userId)}`
    ),
    {
      method: 'PUT',
      headers: {
        ...getCanvasHeaders(),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'comment[text_comment]': input.message,
      }).toString(),
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to write the certificate link back to Canvas.');
  }
};

export const testCanvasConnection = async (
  config: CanvasResolvedConfig,
  fetchImpl: typeof fetch = fetch
): Promise<{ courseName: string; courseCode?: string }> => {
  const course = await fetchCanvasCourse(config, fetchImpl);

  return {
    courseName: course.name || String(course.id || config.courseId),
    courseCode: course.course_code,
  };
};
