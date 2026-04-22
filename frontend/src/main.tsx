/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import { MotionConfig, motion } from 'framer-motion';
import App from './App';
import { DemoProvider } from '@/context/DemoContext';
import { MockAuth0Provider } from '@/demo/MockAuth0Provider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MOTION_EASE, SOFT_SPRING } from '@/utils/motion';
import { ROUTES } from '@/utils/constants';
import './global.css';

const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
const isAuth0Configured =
  domain &&
  clientId &&
  domain !== 'your-domain.auth0.com' &&
  clientId !== 'your-client-id';
const CHUNK_RELOAD_RETRY_KEY = 'certify:chunk-reload-retry-path';

const getCanonicalLocalhostUrl = () => {
  if (!import.meta.env.DEV || window.location.hostname !== '127.0.0.1') {
    return null;
  }

  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//localhost${port}${window.location.pathname}${window.location.search}${window.location.hash}`;
};

const resolveAppReturnPath = (returnTo?: string): string => {
  if (!returnTo || returnTo === '/') {
    return ROUTES.DASHBOARD;
  }

  try {
    const parsed = new URL(returnTo, window.location.origin);
    if (parsed.origin !== window.location.origin) {
      return ROUTES.DASHBOARD;
    }

    return (
      `${parsed.pathname}${parsed.search}${parsed.hash}` || ROUTES.DASHBOARD
    );
  } catch {
    return returnTo.startsWith('/') ? returnTo : ROUTES.DASHBOARD;
  }
};

const registerChunkLoadRecovery = () => {
  window.setTimeout(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_RETRY_KEY);
  }, 10000);

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const retryPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (sessionStorage.getItem(CHUNK_RELOAD_RETRY_KEY) === retryPath) {
      return;
    }

    sessionStorage.setItem(CHUNK_RELOAD_RETRY_KEY, retryPath);
    window.location.reload();
  });
};

registerChunkLoadRecovery();

const SetupRequired: React.FC<{ onTryDemo: () => void }> = ({ onTryDemo }) => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base-100 p-6">
    <motion.div
      animate={{ x: [0, 16, 0], y: [0, -14, 0] }}
      transition={{ duration: 18, ease: 'easeInOut', repeat: Infinity }}
      className="pointer-events-none absolute right-[-10%] top-[-8%] h-72 w-72 rounded-full bg-primary/8 blur-3xl"
    />
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.48, ease: MOTION_EASE }}
      className="card max-w-lg w-full rounded border border-base-200 bg-base-100 p-8 text-center shadow-xl"
    >
      <div className="mb-4 text-5xl">Key</div>
      <h1 className="mb-2 text-2xl font-bold text-base-content">
        Auth0 Setup Required
      </h1>
      <p className="mb-6 text-sm leading-relaxed text-base-content/60">
        To run Certify, you need to configure your Auth0 credentials in{' '}
        <code className="rounded bg-base-200 px-1.5 py-0.5 text-xs">
          frontend/.env.local
        </code>
      </p>
      <div className="mb-6 space-y-1 rounded bg-base-200 p-4 text-left font-mono text-xs">
        <p className="text-success">
          VITE_AUTH0_DOMAIN=
          <span className="text-warning">your-tenant.auth0.com</span>
        </p>
        <p className="text-success">
          VITE_AUTH0_CLIENT_ID=
          <span className="text-warning">your-client-id</span>
        </p>
        <p className="text-success">
          VITE_AUTH0_AUDIENCE=
          <span className="text-warning">https://certify-api</span>
        </p>
      </div>
      <div className="mb-8 space-y-1 text-xs text-base-content/40">
        <p>
          1. Go to <strong>auth0.com</strong> and create a Single Page App
        </p>
        <p>
          2. Set Callback/Logout URL to{' '}
          <code className="rounded bg-base-200 px-1">
            http://localhost:5174
          </code>
        </p>
        <p>
          3. Create an API with identifier{' '}
          <code className="rounded bg-base-200 px-1">https://certify-api</code>
        </p>
        <p>
          4. Fill in{' '}
          <code className="rounded bg-base-200 px-1">.env.local</code> and
          restart the dev server
        </p>
      </div>
      <div className="divider text-xs text-base-content/30">OR</div>
      <motion.button
        className="btn btn-primary mt-4 w-full"
        onClick={onTryDemo}
        whileHover={{ y: -2, transition: SOFT_SPRING }}
        whileTap={{ scale: 0.99 }}
      >
        Try Demo - No Setup Required
      </motion.button>
      <p className="mt-2 text-xs text-base-content/40">
        Explore the full UI with sample data
      </p>
    </motion.div>
  </div>
);

const Root: React.FC = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const canonicalLocalhostUrl = getCanonicalLocalhostUrl();

  React.useEffect(() => {
    if (!canonicalLocalhostUrl) {
      return;
    }

    window.location.replace(canonicalLocalhostUrl);
  }, [canonicalLocalhostUrl]);

  if (canonicalLocalhostUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-100 p-6 text-center">
        <div className="rounded border border-base-200 bg-base-100 px-6 py-5 shadow-sm">
          <p className="text-sm font-medium text-base-content/60">
            Redirecting to the canonical localhost origin for Auth0...
          </p>
        </div>
      </div>
    );
  }

  const handleRedirectCallback = (appState?: { returnTo?: string }) => {
    const target = resolveAppReturnPath(appState?.returnTo);
    window.history.replaceState({}, document.title, target);
    window.dispatchEvent(
      new PopStateEvent('popstate', { state: window.history.state })
    );
  };

  if (isDemoMode) {
    return (
      <MockAuth0Provider>
        <DemoProvider>
          <App />
        </DemoProvider>
      </MockAuth0Provider>
    );
  }

  if (!isAuth0Configured) {
    return <SetupRequired onTryDemo={() => setIsDemoMode(true)} />;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      onRedirectCallback={handleRedirectCallback}
      useRefreshTokens={true}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  );
};

const AppCrashFallback = (
  <div className="flex min-h-screen items-center justify-center bg-base-100 p-6 text-center">
    <div className="max-w-[440px]">
      <p className="mb-2 text-lg font-bold text-base-content">
        Something went wrong
      </p>
      <p className="mb-5 text-sm text-base-content/60">
        The application failed to load. Open the browser console for details,
        then reload.
      </p>
      <button
        className="btn btn-primary"
        onClick={() => window.location.reload()}
      >
        Reload
      </button>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary fallback={AppCrashFallback}>
    <MotionConfig reducedMotion="user">
      <Root />
    </MotionConfig>
  </ErrorBoundary>
);
