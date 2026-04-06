type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const SENSITIVE_KEYS = [
  'password',
  'passwd',
  'secret',
  'token',
  'apiKey',
  'api_key',
  'apiSecret',
  'api_secret',
  'privateKey',
  'private_key',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'authorization',
  'auth',
  'credentials',
  'mongodb_uri',
  'connectionString',
  'connection_string',
];

const isSensitiveKey = (key: string): boolean => {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some((sensitive) => lowerKey.includes(sensitive));
};

const sanitizeValue = (value: unknown, depth = 0): unknown => {
  if (depth > 5) return '[Max Depth]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    if (value.length > 200) {
      return value.substring(0, 50) + '...[truncated]';
    }
    return value;
  }
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) {
    return value.slice(0, 10).map((v) => sanitizeValue(v, depth + 1));
  }
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeValue(val, depth + 1);
    }
  }
  return sanitized;
};

const formatLog = (level: LogLevel, context: string, message: string, data?: unknown): string => {
  const timestamp = new Date().toISOString();
  const logEntry: Record<string, unknown> = {
    timestamp,
    level,
    context,
    message,
  };
  if (data !== undefined) {
    logEntry.data = sanitizeValue(data);
  }
  return JSON.stringify(logEntry);
};

export const logger = {
  debug: (context: string, message: string, data?: unknown): void => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', context, message, data));
    }
  },

  info: (context: string, message: string, data?: unknown): void => {
    console.log(formatLog('info', context, message, data));
  },

  warn: (context: string, message: string, data?: unknown): void => {
    console.warn(formatLog('warn', context, message, data));
  },

  error: (context: string, message: string, error?: unknown): void => {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          }
        : error;
    console.error(formatLog('error', context, message, errorData));
  },
};

export const logRequest = (method: string, path: string, userId?: string): void => {
  logger.info('Request', `${method} ${path}`, userId ? { userId } : undefined);
};

export const logSecurityEvent = (event: string, details: Record<string, unknown>): void => {
  logger.warn('Security', event, details);
};
