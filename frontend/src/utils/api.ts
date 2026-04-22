import type { ApiResponse } from '@/types/api';

const withApiPrefix = (baseUrl: string): string => {
  const normalized = baseUrl.trim().replace(/\/+$/, '');

  if (!normalized || normalized.endsWith('/api')) {
    return normalized;
  }

  return `${normalized}/api`;
};

const resolveApiBaseUrl = (): string => {
  if (import.meta.env.DEV) {
    return '/api';
  }

  const configuredUrl = import.meta.env.VITE_API_URL;

  if (!configuredUrl) {
    throw new Error(
      'Missing VITE_API_URL. Set it to your backend URL, for example https://your-backend.up.railway.app/api.'
    );
  }

  return withApiPrefix(configuredUrl);
};

export const API_BASE_URL = resolveApiBaseUrl();

let getToken: (() => Promise<string>) | null = null;

export const setTokenGetter = (
  getter: (() => Promise<string>) | null
): void => {
  getToken = getter;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (!getToken) return {};
  try {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

const buildRequestHeaders = async (
  options: RequestInit = {}
): Promise<Record<string, string>> => {
  const authHeaders = await getAuthHeaders();
  const shouldSetJsonContentType =
    options.body !== undefined && !(options.body instanceof FormData);

  return {
    ...(shouldSetJsonContentType ? { 'Content-Type': 'application/json' } : {}),
    ...authHeaders,
    ...(options.headers as Record<string, string> | undefined),
  };
};

export const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await buildRequestHeaders(options);

  return fetch(url, {
    ...options,
    headers,
  });
};

export const parseApiResponse = async <T>(
  response: Response
): Promise<ApiResponse<T>> => {
  const rawBody = await response.text();

  if (!rawBody) {
    return { success: response.ok };
  }

  try {
    return JSON.parse(rawBody) as ApiResponse<T>;
  } catch {
    return {
      success: false,
      error: {
        code: 'INVALID_RESPONSE',
        message:
          response.status >= 500
            ? 'The server returned an unexpected response. Please try again in a moment.'
            : 'The server returned an invalid response.',
      },
    };
  }
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const response = await fetchWithAuth(endpoint, options);

  const data = await parseApiResponse<T>(response);

  if (!response.ok) {
    const err = Object.assign(
      new Error(
        data.error?.message || `HTTP error! status: ${response.status}`
      ),
      { status: response.status, code: data.error?.code }
    );
    throw err;
  }

  return data;
};

export const get = <T>(endpoint: string) => apiRequest<T>(endpoint);

export const post = <T>(endpoint: string, body: unknown) =>
  apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const put = <T>(endpoint: string, body: unknown) =>
  apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const patch = <T>(endpoint: string, body: unknown) =>
  apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const del = <T>(endpoint: string) =>
  apiRequest<T>(endpoint, { method: 'DELETE' });
