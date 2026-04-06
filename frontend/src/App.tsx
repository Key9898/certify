import { lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider } from '@/context/AuthContext';
import { Loading } from '@/components/common/Loading';
import { ROUTES } from '@/utils/constants';
import { PAGE_VARIANTS } from '@/utils/motion';

const Home = lazy(() => import('@/pages/Home').then((m) => ({ default: m.Home })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Templates = lazy(() => import('@/pages/Templates').then((m) => ({ default: m.Templates })));
const CreateCertificate = lazy(() =>
  import('@/pages/CreateCertificate').then((m) => ({ default: m.CreateCertificate }))
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
const Settings = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })));
const Verify = lazy(() => import('@/pages/Verify').then((m) => ({ default: m.Verify })));
const TemplateBuilder = lazy(() =>
  import('@/pages/TemplateBuilder').then((m) => ({ default: m.TemplateBuilder }))
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
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
  const scene = (children: React.ReactNode) => <RouteScene>{children}</RouteScene>;

  return (
    <AnimatePresence initial={false} mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path={ROUTES.HOME} element={scene(<Home />)} />
        <Route
          path={ROUTES.DASHBOARD}
          element={scene(
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.TEMPLATES}
          element={scene(
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.CREATE_CERTIFICATE}
          element={scene(
            <ProtectedRoute>
              <CreateCertificate />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.CERTIFICATES}
          element={scene(
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.BATCH_GENERATE}
          element={scene(
            <ProtectedRoute>
              <BatchGenerate />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.INTEGRATIONS}
          element={scene(
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.SETTINGS}
          element={scene(
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          )}
        />
        <Route
          path={ROUTES.TEMPLATE_BUILDER}
          element={scene(
            <ProtectedRoute>
              <TemplateBuilder />
            </ProtectedRoute>
          )}
        />
        <Route path={ROUTES.VERIFY} element={scene(<Verify />)} />
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
