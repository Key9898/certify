import fs from 'node:fs';
import path from 'node:path';

const workspaceRoot = process.cwd();
const isStrict = process.argv.includes('--strict');

const filesToCheck = [
  {
    label: 'Frontend env',
    path: path.join(workspaceRoot, 'frontend', '.env.local'),
    requiredKeys: [
      'VITE_API_URL',
      'VITE_AUTH0_DOMAIN',
      'VITE_AUTH0_CLIENT_ID',
      'VITE_AUTH0_AUDIENCE',
    ],
  },
  {
    label: 'Backend env',
    path: path.join(workspaceRoot, 'backend', '.env'),
    requiredKeys: [
      'PORT',
      'FRONTEND_URL',
      'API_URL',
      'MONGODB_URI',
      'AUTH0_DOMAIN',
      'AUTH0_AUDIENCE',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'GOOGLE_SERVICE_ACCOUNT_EMAIL',
      'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
      'CANVAS_API_TOKEN',
    ],
  },
];

const filePresenceChecks = [
  {
    label: 'Vercel config',
    path: path.join(workspaceRoot, 'frontend', 'vercel.json'),
  },
  {
    label: 'Railway root deploy config',
    path: path.join(workspaceRoot, 'railway.json'),
  },
  {
    label: 'Railway backend deploy config',
    path: path.join(workspaceRoot, 'backend', 'railway.json'),
  },
  {
    label: 'GitHub CI workflow',
    path: path.join(workspaceRoot, '.github', 'workflows', 'ci.yml'),
  },
];

const placeholderPatterns = [
  /your-/i,
  /your_/i,
  /your\./i,
  /example/i,
  /changeme/i,
  /project-id/i,
  /client-id/i,
  /tenant/i,
  /no-reply@certify\.app/i,
];

const localhostPatterns = [/^http:\/\/localhost/i, /^mongodb:\/\/localhost/i];

const readEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  const values = new Map();

  contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) {
        return;
      }

      const key = line.slice(0, separatorIndex).trim();
      const rawValue = line.slice(separatorIndex + 1).trim();
      values.set(key, rawValue.replace(/^['"]|['"]$/g, ''));
    });

  return values;
};

const getValueStatus = (value) => {
  if (!value) {
    return 'missing';
  }

  if (placeholderPatterns.some((pattern) => pattern.test(value))) {
    return 'placeholder';
  }

  if (localhostPatterns.some((pattern) => pattern.test(value))) {
    return isStrict ? 'placeholder' : 'warning';
  }

  return 'ok';
};

const printHeading = (label) => {
  console.log(`\n${label}`);
  console.log('-'.repeat(label.length));
};

const printStatus = (status, message) => {
  console.log(`[${status}] ${message}`);
};

let failureCount = 0;
let warningCount = 0;

printHeading('Production Readiness Report');

for (const check of filePresenceChecks) {
  if (fs.existsSync(check.path)) {
    printStatus('ok', `${check.label} found`);
  } else {
    failureCount += 1;
    printStatus('missing', `${check.label} is missing`);
  }
}

for (const fileCheck of filesToCheck) {
  printHeading(fileCheck.label);

  if (!fs.existsSync(fileCheck.path)) {
    failureCount += 1;
    printStatus(
      'missing',
      `${path.relative(workspaceRoot, fileCheck.path)} not found`
    );
    continue;
  }

  const values = readEnvFile(fileCheck.path);

  fileCheck.requiredKeys.forEach((key) => {
    const status = getValueStatus(values.get(key));

    if (status === 'ok') {
      printStatus('ok', `${key} configured`);
      return;
    }

    if (status === 'warning') {
      warningCount += 1;
      printStatus('warn', `${key} still points at a local development value`);
      return;
    }

    failureCount += 1;
    printStatus(status, `${key} is missing or still using a placeholder value`);
  });
}

printHeading('Summary');
printStatus('info', `${failureCount} blocking item(s)`);
printStatus('info', `${warningCount} warning(s)`);

if (failureCount > 0) {
  printStatus(
    'next',
    'Fill the remaining env values, provision Vercel/Railway/Atlas, then rerun `npm run readiness:strict`.'
  );
  process.exitCode = 1;
} else if (warningCount > 0) {
  printStatus(
    'next',
    'Swap local development URLs for production URLs before the final rollout, then rerun `npm run readiness:strict`.'
  );
} else {
  printStatus('ok', 'Repository-side deployment inputs look production-ready.');
}
