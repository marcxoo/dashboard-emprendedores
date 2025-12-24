import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import { DataProvider } from './context/DataContext'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import Portal from './components/Portal';
import EntrepreneurDashboard from './components/EntrepreneurDashboard';
import SurveyEventDashboard from './components/SurveyEventDashboard';
import PublicSurveyView from './components/PublicSurveyView';

import LandingPage from './components/LandingPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
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

                {/* Public Landing Page (No Login) */}
                <Route path="/" element={<LandingPage />} />

                {/* Admin Login - Hidden Route */}
                <Route path="/admin/login" element={<Login />} />

                {/* Portals Redirect to Dashboard or specific portal logic */}
                {/* Keeping logic simple: /portal is protected, root / goes to landing */}

                {/* Protected Routes */}
                <Route path="/portal" element={
                  <ProtectedRoute>
                    <Portal />
                  </ProtectedRoute>
                } />

                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <EntrepreneurDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/events/*" element={
                  <ProtectedRoute>
                    <SurveyEventDashboard />
                  </ProtectedRoute>
                } />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </DataProvider>
        </ThemeProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
