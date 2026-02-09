import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Lazy load heavy components
const PortalGate = lazy(() => import('./components/PortalGate'));
const NotFound = lazy(() => import('./components/NotFound'));
const EntrepreneurDashboard = lazy(() => import('./components/EntrepreneurDashboard'));
const SurveyEventDashboard = lazy(() => import('./components/SurveyEventDashboard'));
const EventDashboard = lazy(() => import('./components/EventDashboard'));
const PublicSurveyView = lazy(() => import('./components/PublicSurveyView'));
const InvitationsDashboard = lazy(() => import('./components/InvitationsDashboard'));
const SurveyRaffle = lazy(() => import('./components/SurveyRaffle'));
const CertificatesDashboard = lazy(() => import('./components/CertificatesDashboard'));
const FairsDashboard = lazy(() => import('./components/FairsDashboard'));

// Loading Fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to 404 (Root) if unauthorized trying to access protected route
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ThemeProvider>
          <DataProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/forms/:id" element={<PublicSurveyView />} />
                  <Route path="/portal" element={<PortalGate />} />

                  {/* Protected Routes */}
                  <Route path="/panel/*" element={
                    <ProtectedRoute>
                      <EntrepreneurDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/eventos/*" element={
                    <ProtectedRoute>
                      <EventDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/ferias/*" element={
                    <ProtectedRoute>
                      <FairsDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/encuestas/*" element={
                    <ProtectedRoute>
                      <SurveyEventDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/invitaciones/*" element={
                    <ProtectedRoute>
                      <InvitationsDashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/sorteo/:id" element={
                    <ProtectedRoute>
                      <SurveyRaffle />
                    </ProtectedRoute>
                  } />

                  <Route path="/certificados/*" element={
                    <ProtectedRoute>
                      <CertificatesDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Root & Catch-all -> 404 (Hidden Login) */}
                  <Route path="/" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </DataProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
// Force Reload: 88766
