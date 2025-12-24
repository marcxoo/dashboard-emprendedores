import { FileText } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-600/30">
                <FileText className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">EmprendeForms</h1>
            <p className="text-slate-500 text-center max-w-sm">
                Plataforma de gestión de formularios y eventos.
            </p>
            <p className="text-xs text-slate-400 mt-8">
                Acceso restringido a personal autorizado.
            </p>
        </div>
    );
}
