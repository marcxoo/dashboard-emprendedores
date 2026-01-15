import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, LogOut, ArrowRight, Sparkles, CalendarDays, Send, Award } from 'lucide-react';
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

                {/* Cards Grid - 2x2 Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                    {/* Card 1: Entrepreneur Dashboard */}
                    <div onClick={() => navigate('/dashboard')} className="group relative cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>
                        <ShineBorder
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 h-full relative overflow-hidden border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-cyan-400/50 transition-all duration-300"
                            color={["#06b6d4", "#3b82f6"]}
                            borderRadius={32}
                            borderWidth={2}
                            duration={8}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <ArrowRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-500/10 dark:to-blue-600/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/20">
                                    <Users size={36} strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                Emprendedores
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Administra perfiles, asignaciones a ferias y estadísticas.
                            </p>
                        </ShineBorder>
                    </div>

                    {/* Card 2: Surveys Dashboard */}
                    <div onClick={() => navigate('/surveys')} className="group relative cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-400 to-purple-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>
                        <ShineBorder
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 h-full relative overflow-hidden border border-slate-200 dark:border-white/10 hover:border-fuchsia-500/50 dark:hover:border-fuchsia-400/50 transition-all duration-300"
                            color={["#d946ef", "#a855f7"]}
                            borderRadius={32}
                            borderWidth={2}
                            duration={8}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12">
                                    <ArrowRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-fuchsia-50 to-purple-50 dark:from-fuchsia-500/10 dark:to-purple-600/10 flex items-center justify-center text-fuchsia-500 dark:text-fuchsia-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-fuchsia-500/10 group-hover:shadow-fuchsia-500/20">
                                    <MessageSquare size={36} strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                                Formularios
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Creación y análisis de formularios y satisfacción.
                            </p>
                        </ShineBorder>
                    </div>

                    {/* Card 3: Events Dashboard */}
                    <div onClick={() => navigate('/events')} className="group relative cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-red-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>
                        <ShineBorder
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 h-full relative overflow-hidden border border-slate-200 dark:border-white/10 hover:border-orange-500/50 dark:hover:border-orange-400/50 transition-all duration-300"
                            color={["#f97316", "#ef4444"]}
                            borderRadius={32}
                            borderWidth={2}
                            duration={8}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <ArrowRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>

                            <div className="absolute top-8 right-24 opacity-80">
                                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                                    2026
                                </span>
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-500/10 dark:to-red-600/10 flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-orange-500/10 group-hover:shadow-orange-500/20">
                                    <CalendarDays size={36} strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                                Eventos
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Cronograma de actividades, seguimiento y logística.
                            </p>
                        </ShineBorder>
                    </div>

                    {/* Card 4: Invitations */}
                    <div onClick={() => navigate('/invitations')} className="group relative cursor-pointer">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>
                        <ShineBorder
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 h-full relative overflow-hidden border border-slate-200 dark:border-white/10 hover:border-green-500/50 dark:hover:border-green-400/50 transition-all duration-300"
                            color={["#22c55e", "#10b981"]}
                            borderRadius={32}
                            borderWidth={2}
                            duration={8}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12">
                                    <ArrowRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-600/10 flex items-center justify-center text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-500/20">
                                    <Send size={36} strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                Invitaciones
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Envía invitaciones a talleres y eventos por WhatsApp y Correo.
                            </p>
                        </ShineBorder>
                    </div>

                    {/* Card 5: Certificates (Hidden for Development)
                    <div onClick={() => navigate('/certificates')} className="group relative cursor-pointer md:col-span-2">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition duration-500"></div>
                        <ShineBorder
                            className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] p-8 h-full relative overflow-hidden border border-slate-200 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-amber-400/50 transition-all duration-300"
                            color={["#f59e0b", "#eab308"]}
                            borderRadius={32}
                            borderWidth={2}
                            duration={8}
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <ArrowRight size={20} className="text-slate-400 dark:text-slate-500 group-hover:text-white transition-colors" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-500/10 dark:to-yellow-600/10 flex items-center justify-center text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-amber-500/10 group-hover:shadow-amber-500/20">
                                    <Award size={36} strokeWidth={1.5} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                Certificados
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                Genera certificados de participación para talleres y eventos.
                            </p>
                        </ShineBorder>
                    </div> */}
                </div>
            </div>
        </div>
    );
}

export default Portal;
