import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import { DataProvider, useData } from './context/DataContext'
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './components/Dashboard'
import EntrepreneursList from './components/EntrepreneursList'
import AssignmentsHistory from './components/AssignmentsHistory'
import Statistics from './components/Statistics';
import SurveyPage from './components/SurveyPage';
import SurveysDashboard from './components/SurveysDashboard';
import { LayoutDashboard, Users, History, LogOut, Menu, X, Shield, DollarSign, MessageSquare } from 'lucide-react';

function AdminPanel() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isLoaded } = useData();
  const { isAuthenticated, user, logout } = useAuth();

  // If not authenticated, show Login screen
  if (!isAuthenticated) {
    return <Login />;
  }

  // Close sidebar when view changes on mobile
  const handleViewChange = (view) => {
    setCurrentView(view);
    setIsSidebarOpen(false);
  };

  return (
    <div className="app flex min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-secondary z-50 flex items-center px-4 justify-between shadow-md">
        <div className="font-bold text-xl text-white tracking-tight">
          <span className="text-primary-400">Emprende</span>
          <span className="text-white">Dashboard</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-secondary text-white shadow-xl transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        pt-16 lg:pt-0 flex flex-col
      `}>
        {/* Brand (Desktop) */}
        <div className="hidden lg:block p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary flex items-center justify-center shadow-lg shadow-primary-500/20">
              <span className="text-xl font-bold text-white">E</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight">
                <span className="text-primary-400">Emprende</span>
                <span className="text-white">Dashboard</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Panel de Administración</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'dashboard'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <LayoutDashboard size={20} className={`transition-transform group-hover:scale-110 ${currentView === 'dashboard' ? 'scale-110' : ''}`} />
            <span className="font-medium">Dashboard</span>
            {currentView === 'dashboard' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          <button
            onClick={() => handleViewChange('entrepreneurs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'entrepreneurs'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <Users size={20} className={`transition-transform group-hover:scale-110 ${currentView === 'entrepreneurs' ? 'scale-110' : ''}`} />
            <span className="font-medium">Emprendedores</span>
            {currentView === 'entrepreneurs' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          <button
            onClick={() => handleViewChange('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'history'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <History size={20} className={`transition-transform group-hover:scale-110 ${currentView === 'history' ? 'scale-110' : ''}`} />
            <span className="font-medium">Historial</span>
            {currentView === 'history' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          <button
            onClick={() => handleViewChange('statistics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'statistics'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <DollarSign size={20} className={`transition-transform group-hover:scale-110 ${currentView === 'statistics' ? 'scale-110' : ''}`} />
            <span className="font-medium">Estadísticas</span>
            {currentView === 'statistics' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>

          <button
            onClick={() => handleViewChange('surveys')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${currentView === 'surveys'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
              : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
          >
            <MessageSquare size={20} className={`transition-transform group-hover:scale-110 ${currentView === 'surveys' ? 'scale-110' : ''}`} />
            <span className="font-medium">Encuestas</span>
            {currentView === 'surveys' && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/50 bg-secondary/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
              <Shield size={16} className="text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@emprende.com'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/50 border border-transparent transition-all text-sm font-medium group"
          >
            <LogOut size={18} className="group-hover:text-red-400 transition-colors" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 pt-20 lg:p-8 max-w-7xl mx-auto">
          {!isLoaded ? (
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Cargando datos...</p>
              </div>
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && <Dashboard />}
              {currentView === 'entrepreneurs' && <EntrepreneursList />}
              {currentView === 'history' && <AssignmentsHistory />}
              {currentView === 'statistics' && <Statistics />}
              {currentView === 'surveys' && <SurveysDashboard />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/encuesta/:id" element={<SurveyPage />} />
              <Route path="/*" element={<AdminPanel />} />
            </Routes>
          </BrowserRouter>
        </DataProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App
