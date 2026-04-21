const DEFAULT_AUTH0_DOMAIN = 'dev-yrlotg0tuabujprc.jp.auth0.com';
const DEFAULT_AUTH0_AUDIENCE = 'https://certify-api';

const normalizeAuth0Domain = (value?: string): string => {
  if (!value) {
    return '';
  }

  return value
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/+$/, '');
};

const getEnvValue = (...keys: string[]): string => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  return '';
};

export const getAuth0RuntimeConfig = () => ({
  domain: normalizeAuth0Domain(
    getEnvValue('AUTH0_DOMAIN', 'VITE_AUTH0_DOMAIN') || DEFAULT_AUTH0_DOMAIN
  ),
  audience:
    getEnvValue('AUTH0_AUDIENCE', 'VITE_AUTH0_AUDIENCE') ||
    DEFAULT_AUTH0_AUDIENCE,
});

export const isAuth0Configured = (): boolean => {
  const { domain, audience } = getAuth0RuntimeConfig();
  return Boolean(domain && audience && audience !== 'your-api-audience');
};

export const auth0Config = {
  get domain() {
    return getAuth0RuntimeConfig().domain;
  },
  get audience() {
    return getAuth0RuntimeConfig().audience;
  },
};
