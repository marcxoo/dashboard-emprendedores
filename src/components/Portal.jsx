import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, ArrowRight, Sparkles, CalendarDays, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShineBorder } from './ui/ShineBorder';

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

            <div className="w-full max-w-7xl z-10 px-4 sm:px-6 lg:px-8 relative">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 md:mb-12 gap-6 text-center md:text-left pt-8 md:pt-0">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
                            <span className="text-3xl font-bold text-white">E</span>
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                                Hola, <span className="text-primary-600">{user?.name || 'Admin'}</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-lg">Selecciona una plataforma para continuar</p>
                        </div>
                    </div>

                    {/* Logout Button - Absolute on mobile, Normal on Desktop */}
                    <button
                        onClick={handleLogout}
                        className="absolute top-4 right-4 md:static p-2 md:px-6 md:py-3 rounded-xl bg-transparent md:bg-white md:dark:bg-slate-800 border border-transparent md:border-slate-200 md:dark:border-slate-700 text-slate-400 md:text-slate-500 hover:text-red-500 hover:bg-red-50 md:hover:bg-red-50 md:dark:hover:bg-red-900/10 hover:border-red-100 md:dark:hover:border-red-900/30 transition-all font-medium shadow-none md:shadow-sm md:hover:shadow-md active:scale-95 flex items-center gap-2 justify-center"
                        title="Cerrar Sesión"
                    >
                        <LogOut size={24} className="md:w-5 md:h-5" />
                        <span className="hidden md:inline">Cerrar Sesión</span>
                    </button>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Card 1: Entrepreneur Dashboard */}
                    <ShineBorder
                        onClick={() => navigate('/dashboard')}
                        className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer hover:-translate-y-2 transition-all duration-300 block min-h-[280px] lg:min-h-[320px] w-full"
                        color={["#06b6d4", "#3b82f6", "#0ea5e9"]}
                        borderRadius={32}
                        borderWidth={2}
                        duration={8}
                    >
                        <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="text-cyan-500" size={24} />
                        </div>

                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-center mb-6 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-cyan-500/20">
                            <Users size={28} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            Emprendedores
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Administra perfiles, asignaciones a ferias y estadísticas.
                        </p>

                        <div className="flex items-center gap-2 text-cyan-600 font-bold group-hover:gap-3 transition-all text-sm uppercase tracking-wide absolute bottom-6 lg:bottom-8">
                            <span>Acceder</span>
                        </div>
                        {/* Spacer for absolute button */}
                        <div className="h-4"></div>
                    </ShineBorder>

                    {/* Card 2: Surveys Dashboard */}
                    <ShineBorder
                        onClick={() => navigate('/surveys')}
                        className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer hover:-translate-y-2 transition-all duration-300 block min-h-[280px] lg:min-h-[320px] w-full"
                        color={["#d946ef", "#a855f7", "#ec4899"]}
                        borderRadius={32}
                        borderWidth={2}
                        duration={8}
                    >
                        <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="text-fuchsia-500" size={24} />
                        </div>

                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-900/20 dark:to-purple-900/20 flex items-center justify-center mb-6 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-fuchsia-500/20">
                            <MessageSquare size={28} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                            Formularios
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Creación y análisis de formularios y satisfacción.
                        </p>

                        <div className="flex items-center gap-2 text-fuchsia-600 font-bold group-hover:gap-3 transition-all text-sm uppercase tracking-wide absolute bottom-6 lg:bottom-8">
                            <span>Acceder</span>
                        </div>
                        <div className="h-4"></div>
                    </ShineBorder>

                    {/* Card 3: Events Dashboard */}
                    <ShineBorder
                        onClick={() => navigate('/events')}
                        className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer hover:-translate-y-2 transition-all duration-300 block min-h-[280px] lg:min-h-[320px] w-full md:col-span-2 lg:col-span-1"
                        color={["#f97316", "#ef4444", "#f59e0b"]}
                        borderRadius={32}
                        borderWidth={2}
                        duration={8}
                    >
                        <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="text-orange-500" size={24} />
                        </div>

                        <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
                            <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wider animate-pulse">
                                2026
                            </span>
                        </div>

                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center mb-6 text-orange-600 dark:text-orange-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-sm group-hover:shadow-orange-500/20">
                            <CalendarDays size={28} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                            Eventos
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Cronograma de actividades, seguimiento y logística.
                        </p>

                        <div className="flex items-center gap-2 text-orange-600 font-bold group-hover:gap-3 transition-all text-sm uppercase tracking-wide absolute bottom-6 lg:bottom-8">
                            <span>Acceder</span>
                        </div>
                        <div className="h-4"></div>
                    </ShineBorder>

                    {/* Card 4: Invitations */}
                    <ShineBorder
                        onClick={() => navigate('/invitations')}
                        className="group relative bg-white dark:bg-slate-800 rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none cursor-pointer hover:-translate-y-2 transition-all duration-300 block min-h-[280px] lg:min-h-[320px] w-full md:col-span-2 lg:col-span-1"
                        color={["#22c55e", "#10b981", "#4ade80"]}
                        borderRadius={32}
                        borderWidth={2}
                        duration={8}
                    >
                        <div className="absolute top-0 right-0 p-6 lg:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                            <ArrowRight className="text-green-500" size={24} />
                        </div>

                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-center mb-6 text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-green-500/20">
                            <Send size={28} className="lg:w-8 lg:h-8" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                            Invitaciones
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed text-sm lg:text-base">
                            Envía invitaciones a talleres y eventos por WhatsApp y Correo.
                        </p>

                        <div className="flex items-center gap-2 text-green-600 font-bold group-hover:gap-3 transition-all text-sm uppercase tracking-wide absolute bottom-6 lg:bottom-8">
                            <span>Acceder</span>
                        </div>
                        <div className="h-4"></div>
                    </ShineBorder>
                </div>
            </div>
        </div>
    );
}

export default Portal;
