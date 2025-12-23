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

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
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

                {/* Protected Routes */}
                <Route path="/" element={
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
