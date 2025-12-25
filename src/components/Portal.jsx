import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, ArrowRight, Sparkles, CalendarDays } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Portal() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="w-full max-w-5xl z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <span className="text-2xl font-bold text-white">E</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Hola, <span className="text-primary-600">{user?.name || 'Admin'}</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">Selecciona una plataforma para continuar</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Cerrar Sesión</span>
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                    {/* Card 1: Entrepreneur Dashboard */}
                    <div
                        onClick={() => navigate('/dashboard')}
                        className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="text-primary-500" size={24} />
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Emprendedores
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Administra perfiles, asignaciones a ferias y estadísticas.
                        </p>

                        <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all text-sm">
                            <span>Acceder</span>
                        </div>
                    </div>

                    {/* Card 2: Surveys Dashboard */}
                    <div
                        onClick={() => navigate('/surveys')}
                        className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="text-primary-500" size={24} />
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                            <MessageSquare size={32} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Encuestas
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Creación y análisis de formularios y satisfacción.
                        </p>

                        <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all text-sm">
                            <span>Acceder</span>
                        </div>
                    </div>

                    {/* Card 3: Events Dashboard */}
                    <div
                        onClick={() => navigate('/events')}
                        className="group relative bg-white dark:bg-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 cursor-pointer hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <ArrowRight className="text-primary-500" size={24} />
                        </div>

                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wider">
                                2026
                            </span>
                        </div>

                        <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform duration-300">
                            <CalendarDays size={32} strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Eventos
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Cronograma de actividades, seguimiento y logística.
                        </p>

                        <div className="flex items-center gap-2 text-primary-600 font-medium group-hover:gap-3 transition-all text-sm">
                            <span>Acceder</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Portal;
