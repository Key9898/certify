import { lazy, Suspense, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider, useAppUser } from '@/context/AuthContext';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/utils/constants';
import { PAGE_VARIANTS } from '@/utils/motion';

const Home = lazy(() =>
  import('@/pages/Home').then((m) => ({ default: m.Home }))
);
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const Templates = lazy(() =>
  import('@/pages/Templates').then((m) => ({ default: m.Templates }))
);
const CreateCertificate = lazy(() =>
  import('@/pages/CreateCertificate').then((m) => ({
    default: m.CreateCertificate,
  }))
);
const Certificates = lazy(() =>
  import('@/pages/Certificates').then((m) => ({ default: m.Certificates }))
);
const BatchGenerate = lazy(() =>
  import('@/pages/BatchGenerate').then((m) => ({ default: m.BatchGenerate }))
);
const Integrations = lazy(() =>
  import('@/pages/Integrations').then((m) => ({ default: m.Integrations }))
);
const Settings = lazy(() =>
  import('@/pages/Settings').then((m) => ({ default: m.Settings }))
);
const Verify = lazy(() =>
  import('@/pages/Verify').then((m) => ({ default: m.Verify }))
);
const VerifyPortal = lazy(() =>
  import('@/pages/Verify').then((m) => ({ default: m.VerifyPortal }))
);
const TemplateBuilder = lazy(() =>
  import('@/pages/TemplateBuilder').then((m) => ({
    default: m.TemplateBuilder,
  }))
);

// Support & Legal
const About = lazy(() =>
  import('@/pages/Support').then((m) => ({ default: m.About }))
);
const FAQ = lazy(() =>
  import('@/pages/Support').then((m) => ({ default: m.FAQ }))
);
const Privacy = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.Privacy }))
);
const Terms = lazy(() =>
  import('@/pages/Legal').then((m) => ({ default: m.Terms }))
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  const { isApiAuthReady, apiAuthError } = useAppUser();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isLoading || isAuthenticated) {
      return;
    }

    void loginWithRedirect({
      appState: {
        returnTo,
      },
    });
  }, [isAuthenticated, isLoading, loginWithRedirect, returnTo]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (apiAuthError) {
    return (
      <div className="flex h-screen items-center justify-center bg-base-100 p-6">
        <div className="card max-w-md border border-base-200 bg-base-100 p-6 text-center shadow-xl">
          <p className="text-lg font-bold text-base-content">
            Secure session needs a refresh
          </p>
          <p className="mt-2 text-sm leading-relaxed text-base-content/65">
            {apiAuthError}
          </p>
          <button
            className="btn btn-primary mt-5"
            onClick={() =>
              void loginWithRedirect({
                appState: { returnTo },
                authorizationParams: { prompt: 'login' },
              })
            }
          >
            Sign in again
          </button>
        </div>
      </div>
    );
  }

  if (!isApiAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

const RouteScene: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    variants={PAGE_VARIANTS}
    initial="initial"
    animate="animate"
    exit="exit"
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const scene = (children: React.ReactNode) => (
    <RouteScene>{children}</RouteScene>
  );
  const protectedScene = (children: React.ReactNode) =>
    scene(<ProtectedRoute>{children}</ProtectedRoute>);

  return (
    <AnimatePresence initial={false} mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path={ROUTES.HOME} element={scene(<Home />)} />
        <Route
          path={ROUTES.DASHBOARD}
          element={protectedScene(<Dashboard />)}
        />
        <Route
          path={ROUTES.TEMPLATES}
          element={protectedScene(<Templates />)}
        />
        <Route
          path={ROUTES.CREATE_CERTIFICATE}
          element={protectedScene(<CreateCertificate />)}
        />
        <Route
          path={ROUTES.CERTIFICATES}
          element={protectedScene(<Certificates />)}
        />
        <Route
          path={ROUTES.BATCH_GENERATE}
          element={protectedScene(<BatchGenerate />)}
        />
        <Route
          path={ROUTES.INTEGRATIONS}
          element={protectedScene(<Integrations />)}
        />
        <Route path={ROUTES.SETTINGS} element={protectedScene(<Settings />)} />
        <Route
          path={ROUTES.TEMPLATE_BUILDER}
          element={protectedScene(<TemplateBuilder />)}
        />
        <Route path={ROUTES.VERIFY} element={scene(<Verify />)} />
        <Route path={ROUTES.VERIFY_PORTAL} element={scene(<VerifyPortal />)} />
        <Route path={ROUTES.ABOUT} element={scene(<About />)} />
        <Route path={ROUTES.FAQ} element={scene(<FAQ />)} />
        <Route path={ROUTES.PRIVACY} element={scene(<Privacy />)} />
        <Route path={ROUTES.TERMS} element={scene(<Terms />)} />
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="flex h-screen items-center justify-center">
              <Loading size="lg" />
            </div>
          }
        >
          <AppRoutes />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
