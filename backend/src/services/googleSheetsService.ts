import crypto from 'crypto';
import type { IGoogleSheetsSettings } from '../models/Integration';

const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets';
const TOKEN_REFRESH_BUFFER_MS = 60_000;

interface GoogleAccessTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

interface GoogleSheetValuesResponse {
  values?: string[][];
}

interface GoogleBatchUpdateResponse {
  totalUpdatedCells?: number;
}

interface GoogleAccessTokenCache {
  accessToken: string | null;
  expiresAt: number;
}

export interface GoogleSheetsResolvedConfig {
  spreadsheetId: string;
  sheetName: string;
  statusColumn?: string;
  certificateIdColumn?: string;
  pdfUrlColumn?: string;
  batchJobIdColumn?: string;
  processedAtColumn?: string;
}

export interface GoogleSheetsRowUpdate {
  rowNumber: number;
  status?: string;
  certificateId?: string;
  pdfUrl?: string;
  batchJobId?: string;
  processedAt?: string;
}

const tokenCache: GoogleAccessTokenCache = {
  accessToken: null,
  expiresAt: 0,
};

const getEnvValue = (value?: string): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const normalizeGooglePrivateKey = (value: string): string =>
  value.replace(/\\n/g, '\n');

const getGoogleServiceAccountCredentials = () => {
  const clientEmail = getEnvValue(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
  const privateKey = getEnvValue(
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

  if (!clientEmail || !privateKey) {
    return null;
  }

  return {
    clientEmail,
    privateKey: normalizeGooglePrivateKey(privateKey),
  };
};

const base64UrlEncode = (value: Buffer | string): string =>
  Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

export const createGoogleServiceAccountAssertion = (
  clientEmail: string,
  privateKey: string,
  now = Math.floor(Date.now() / 1000)
): string => {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: clientEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(signingInput)
    .sign(privateKey);

  return `${signingInput}.${base64UrlEncode(signature)}`;
};

export const isGoogleSheetsNativeSyncReady = (
  settings?: IGoogleSheetsSettings | null
): settings is GoogleSheetsResolvedConfig =>
  Boolean(
    settings?.enabled &&
    getEnvValue(settings.spreadsheetId) &&
    getEnvValue(settings.sheetName) &&
    getGoogleServiceAccountCredentials()
  );

export const resolveGoogleSheetsConfig = (
  settings?: IGoogleSheetsSettings | null
): GoogleSheetsResolvedConfig | null => {
  if (!isGoogleSheetsNativeSyncReady(settings)) {
    return null;
  }

  return {
    spreadsheetId: settings.spreadsheetId!.trim(),
    sheetName: settings.sheetName!.trim(),
    statusColumn: getEnvValue(settings.statusColumn),
    certificateIdColumn: getEnvValue(settings.certificateIdColumn),
    pdfUrlColumn: getEnvValue(settings.pdfUrlColumn),
    batchJobIdColumn: getEnvValue(settings.batchJobIdColumn),
    processedAtColumn: getEnvValue(settings.processedAtColumn),
  };
};

export const columnNumberToLetter = (columnNumber: number): string => {
  let result = '';
  let current = columnNumber;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
};

export const mapHeaderColumns = (headers: string[]): Record<string, string> =>
  headers.reduce<Record<string, string>>((accumulator, header, index) => {
    const normalized = header.trim().toLowerCase();
    if (normalized) {
      accumulator[normalized] = columnNumberToLetter(index + 1);
    }
    return accumulator;
  }, {});

export const buildGoogleSheetRange = (
  sheetName: string,
  columnLetter: string,
  rowNumber: number
): string => `${sheetName}!${columnLetter}${rowNumber}`;

const getGoogleAuthHeaders = async (
  fetchImpl: typeof fetch
): Promise<Record<string, string>> => {
  const accessToken = await getGoogleAccessToken(fetchImpl);
  return {
    Authorization: `Bearer ${accessToken}`,
  };
};

export const getGoogleAccessToken = async (
  fetchImpl: typeof fetch = fetch
): Promise<string> => {
  if (
    tokenCache.accessToken &&
    tokenCache.expiresAt - TOKEN_REFRESH_BUFFER_MS > Date.now()
  ) {
    return tokenCache.accessToken;
  }

  const credentials = getGoogleServiceAccountCredentials();
  if (!credentials) {
    throw new Error(
      'Google Sheets native sync is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.'
    );
  }

  const assertion = createGoogleServiceAccountAssertion(
    credentials.clientEmail,
    credentials.privateKey
  );

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetchImpl(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    signal: AbortSignal.timeout(10_000),
  });

  const result = (await response.json()) as GoogleAccessTokenResponse;

  if (!response.ok || !result.access_token) {
    throw new Error(
      result.error_description ||
        result.error ||
        'Failed to obtain a Google access token.'
    );
  }

  tokenCache.accessToken = result.access_token;
  tokenCache.expiresAt = Date.now() + (result.expires_in || 3600) * 1000;

  return result.access_token;
};

export const fetchGoogleSheetHeaders = async (
  config: GoogleSheetsResolvedConfig,
  fetchImpl: typeof fetch = fetch
): Promise<string[]> => {
  const headers = await getGoogleAuthHeaders(fetchImpl);
  const range = encodeURIComponent(`${config.sheetName}!1:1`);
  const response = await fetchImpl(
    `${GOOGLE_SHEETS_API_URL}/${config.spreadsheetId}/values/${range}`,
    {
      headers,
      signal: AbortSignal.timeout(10_000),
    }
  );

  const result = (await response.json()) as GoogleSheetValuesResponse;

  if (!response.ok) {
    throw new Error('Failed to read the Google Sheets header row.');
  }

  return result.values?.[0] || [];
};

const resolveColumnLetter = (
  headerMap: Record<string, string>,
  columnName: string | undefined,
  label: string
): string | null => {
  if (!columnName) {
    return null;
  }

  const normalized = columnName.trim().toLowerCase();
  const resolved = headerMap[normalized];

  if (!resolved) {
    throw new Error(
      `Google Sheets column "${columnName}" for ${label} was not found.`
    );
  }

  return resolved;
};

export const buildGoogleBatchUpdateData = (
  config: GoogleSheetsResolvedConfig,
  headers: string[],
  rowUpdates: GoogleSheetsRowUpdate[]
): Array<{ range: string; values: string[][] }> => {
  const headerMap = mapHeaderColumns(headers);
  const statusColumn = resolveColumnLetter(
    headerMap,
    config.statusColumn,
    'status'
  );
  const certificateIdColumn = resolveColumnLetter(
    headerMap,
    config.certificateIdColumn,
    'certificate ID'
  );
  const pdfUrlColumn = resolveColumnLetter(
    headerMap,
    config.pdfUrlColumn,
    'PDF URL'
  );
  const batchJobIdColumn = resolveColumnLetter(
    headerMap,
    config.batchJobIdColumn,
    'batch job ID'
  );
  const processedAtColumn = resolveColumnLetter(
    headerMap,
    config.processedAtColumn,
    'processed at'
  );

  const updates: Array<{ range: string; values: string[][] }> = [];

  rowUpdates.forEach((rowUpdate) => {
    if (statusColumn && rowUpdate.status !== undefined) {
      updates.push({
        range: buildGoogleSheetRange(
          config.sheetName,
          statusColumn,
          rowUpdate.rowNumber
        ),
        values: [[rowUpdate.status]],
      });
    }

    if (certificateIdColumn && rowUpdate.certificateId !== undefined) {
      updates.push({
        range: buildGoogleSheetRange(
          config.sheetName,
          certificateIdColumn,
          rowUpdate.rowNumber
        ),
        values: [[rowUpdate.certificateId]],
      });
    }

    if (pdfUrlColumn && rowUpdate.pdfUrl !== undefined) {
      updates.push({
        range: buildGoogleSheetRange(
          config.sheetName,
          pdfUrlColumn,
          rowUpdate.rowNumber
        ),
        values: [[rowUpdate.pdfUrl]],
      });
    }

    if (batchJobIdColumn && rowUpdate.batchJobId !== undefined) {
      updates.push({
        range: buildGoogleSheetRange(
          config.sheetName,
          batchJobIdColumn,
          rowUpdate.rowNumber
        ),
        values: [[rowUpdate.batchJobId]],
      });
    }

    if (processedAtColumn && rowUpdate.processedAt !== undefined) {
      updates.push({
        range: buildGoogleSheetRange(
          config.sheetName,
          processedAtColumn,
          rowUpdate.rowNumber
        ),
        values: [[rowUpdate.processedAt]],
      });
    }
  });

  return updates;
};

export const syncGoogleSheetsRows = async (
  config: GoogleSheetsResolvedConfig,
  rowUpdates: GoogleSheetsRowUpdate[],
  fetchImpl: typeof fetch = fetch
): Promise<{ updatedCells: number }> => {
  const filteredUpdates = rowUpdates.filter(
    (rowUpdate) => rowUpdate.rowNumber > 0
  );
  if (filteredUpdates.length === 0) {
    return { updatedCells: 0 };
  }

  const sheetHeaders = await fetchGoogleSheetHeaders(config, fetchImpl);
  const data = buildGoogleBatchUpdateData(
    config,
    sheetHeaders,
    filteredUpdates
  );

  if (data.length === 0) {
    return { updatedCells: 0 };
  }

  const headers = await getGoogleAuthHeaders(fetchImpl);
  const response = await fetchImpl(
    `${GOOGLE_SHEETS_API_URL}/${config.spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data,
      }),
      signal: AbortSignal.timeout(10_000),
    }
  );

  const result = (await response.json()) as GoogleBatchUpdateResponse;

  if (!response.ok) {
    throw new Error('Failed to write rows back to Google Sheets.');
  }

  return { updatedCells: result.totalUpdatedCells || data.length };
};

export const testGoogleSheetsConnection = async (
  config: GoogleSheetsResolvedConfig,
  fetchImpl: typeof fetch = fetch
): Promise<{
  sheetName: string;
  headerCount: number;
  sampleHeaders: string[];
}> => {
  const headers = await fetchGoogleSheetHeaders(config, fetchImpl);

  return {
    sheetName: config.sheetName,
    headerCount: headers.length,
    sampleHeaders: headers.slice(0, 6),
  };
};
