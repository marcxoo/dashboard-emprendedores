import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import PortalGate from './components/PortalGate';
import NotFound from './components/NotFound';
import EntrepreneurDashboard from './components/EntrepreneurDashboard';
import SurveyEventDashboard from './components/SurveyEventDashboard';
import EventDashboard from './components/EventDashboard';
import PublicSurveyView from './components/PublicSurveyView';

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
              <Routes>
                {/* Public Route for Surveys */}
                <Route path="/forms/:id" element={<PublicSurveyView />} />

                {/* Secure Login & Portal Entry Point */}
                <Route path="/portal" element={<PortalGate />} />

                {/* Root & Catch-all -> 404 (Hidden Login) */}
                <Route path="/" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/" replace />} />

                {/* Protected Routes */}
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <EntrepreneurDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/events/*" element={
                  <ProtectedRoute>
                    <EventDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/surveys/*" element={
                  <ProtectedRoute>
                    <SurveyEventDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
