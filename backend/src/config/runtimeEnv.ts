import { isAuth0Configured } from './auth0';

const PLACEHOLDER_PATTERNS = [
  /your-/i,
  /your_/i,
  /example/i,
  /project-id/i,
  /client-id/i,
  /tenant/i,
  /no-reply@certify\.app/i,
];

const hasRealValue = (value?: string): boolean => {
  if (!value) {
    return false;
  }

  return !PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
};

export const logRuntimeEnvReadiness = (): void => {
  const requiredKeys = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const optionalConnectorKeys = [
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    'CANVAS_API_TOKEN',
  ];

  const missingRequired = requiredKeys.filter(
    (key) => !hasRealValue(process.env[key])
  );
  const missingAuth = isAuth0Configured() ? [] : ['AUTH0_DOMAIN/AUDIENCE'];
  const missingConnectors = optionalConnectorKeys.filter(
    (key) => !hasRealValue(process.env[key])
  );

  if (missingAuth.length > 0 || missingRequired.length > 0) {
    console.warn(
      `[env] Missing or placeholder production settings: ${[
        ...missingAuth,
        ...missingRequired,
      ].join(', ')}`
    );
  }

  if (missingConnectors.length > 0) {
    console.warn(
      `[env] Native provider features are limited until these values are set: ${missingConnectors.join(', ')}`
    );
  }

  if (
    missingAuth.length === 0 &&
    missingRequired.length === 0 &&
    missingConnectors.length === 0
  ) {
    console.log(
      '[env] Runtime configuration looks ready for full production feature coverage.'
    );
  }
};
