import type { ApiResponse } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

let getToken: (() => Promise<string>) | null = null;

export const setTokenGetter = (getter: (() => Promise<string>) | null): void => {
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

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const response = await fetchWithAuth(endpoint, options);

  const data: ApiResponse<T> = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
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
