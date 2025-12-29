import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <AlertTriangle size={48} />
                </div>
                <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4">404</h1>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">Página no encontrada</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8">
                    La página que buscas no existe o ha sido movida. Verifique la URL e intente nuevamente.
                </p>
                {/* 
                   Intentionally NOT providing a "Go to Home" button that leads to login, 
                   to maintain the requested security through obscurity.
                   Users who know the real URL will type it.
                */}
            </div>
        </div>
    );
}
