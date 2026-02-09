import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Users from 'lucide-react/dist/esm/icons/users';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import Send from 'lucide-react/dist/esm/icons/send';
import Award from 'lucide-react/dist/esm/icons/award';
import Database from 'lucide-react/dist/esm/icons/database';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Check from 'lucide-react/dist/esm/icons/check';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import BentoCard from './portal/BentoCard';
import { motion } from 'framer-motion';

function Portal() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { entrepreneurs, customSurveys } = useData();
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
    const [currentTime, setCurrentTime] = useState(new Date());

    // Detectar si estamos en localhost (el sync solo funciona localmente)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // Calculate upcoming events (surveys with eventDate in the future)
    const upcomingEventsCount = (customSurveys || []).filter(survey => {
        if (!survey.eventDate) return false;
        const eventDate = new Date(survey.eventDate + 'T23:59:59');
        return eventDate >= new Date();
    }).length;

    // Update time for the hero section
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleSync = async () => {
        setSyncStatus('syncing');
        try {
            const response = await fetch('http://localhost:3001/sync/full-backup', {
                method: 'POST',
                signal: AbortSignal.timeout(60000)
            });

            if (response.ok) {
                setSyncStatus('success');
                setTimeout(() => setSyncStatus('idle'), 3000);
            } else {
                throw new Error('Sync failed');
            }
        } catch (err) {
            console.error('Sync error:', err);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 3000);
        }
    };

    // Greeting based on time
    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 18) return 'Buenas tardes';
        return 'Buenas noches';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-x-hidden selection:bg-cyan-500/30">
            {/* Background Decor */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-cyan-500/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] bg-purple-500/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>
                <div className="absolute bottom-0 left-1/2 w-full h-1/2 bg-gradient-to-t from-slate-50/80 dark:from-slate-900/80 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">
                {/* Header / Hero */}
                <header className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div>
                        <div className="flex items-center gap-3 text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-2">
                            <span>{currentTime.toLocaleDateString('es-EC', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500">{user?.name?.split(' ')[0] || 'Admin'}</span>.
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                            Bienvenido al centro de operaciones. Todos los sistemas están operativos y listos para gestionar el ecosistema emprendedor.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLocalhost && (
                            <button
                                onClick={handleSync}
                                disabled={syncStatus === 'syncing'}
                                className={`group relative overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 ${syncStatus === 'success' ? '!border-green-500 !text-green-500' :
                                    syncStatus === 'error' ? '!border-red-500 !text-red-500' : ''
                                    }`}
                            >
                                {syncStatus === 'syncing' ? <Loader2 size={18} className="animate-spin" /> :
                                    syncStatus === 'success' ? <Check size={18} /> :
                                        syncStatus === 'error' ? <AlertCircle size={18} /> :
                                            <Database size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors" />}

                                <span className="relative z-10">
                                    {syncStatus === 'syncing' ? 'Sincronizando...' :
                                        syncStatus === 'success' ? 'Backup Completado' :
                                            syncStatus === 'error' ? 'Error al Sincronizar' :
                                                'Sincronizar Datos'}
                                </span>
                            </button>
                        )}

                        <button
                            onClick={handleLogout}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all hover:shadow-lg"
                            title="Cerrar Sesión"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </header>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] flex-1">
                    {/* Primary Module: Entrepreneurs (Large) */}
                    <BentoCard
                        span="md:col-span-2 md:row-span-2"
                        title="Emprendedores"
                        description="Gestión centralizada de perfiles, estados de proyecto y asignaciones."
                        icon={Users}
                        iconColor="text-cyan-500"
                        gradient="from-cyan-500/10 to-blue-500/10"
                        delay={1}
                        stats={{
                            value: entrepreneurs.length.toString(),
                            label: 'Registrados',
                            backgroundImage: '/images/fondo-emprendedores.png',
                            backgroundPosition: 'object-bottom'
                        }}
                        onClick={() => navigate('/dashboard')}
                    />

                    {/* Secondary Module: Events (Large Vertical) */}
                    <BentoCard
                        span="md:col-span-2 md:row-span-1"
                        title="Eventos & Talleres"
                        description="Cronograma, logística y seguimiento de asistencia en tiempo real."
                        icon={CalendarDays}
                        iconColor="text-orange-500"
                        gradient="from-orange-500/10 to-red-500/10"
                        delay={2}
                        stats={{ value: upcomingEventsCount.toString(), label: 'Eventos' }}
                        onClick={() => navigate('/events')}
                    />

                    {/* Quick Access: Invitations */}
                    <BentoCard
                        span="md:col-span-1 md:row-span-1"
                        title="Invitaciones"
                        description="Campañas por Email y WhatsApp."
                        icon={Send}
                        iconColor="text-green-500"
                        gradient="from-green-500/10 to-emerald-500/10"
                        delay={3}
                        onClick={() => navigate('/invitations')}
                    />

                    {/* Quick Access: Forms */}
                    <BentoCard
                        span="md:col-span-1 md:row-span-1"
                        title="Formularios"
                        description="Encuestas de satisfacción y registro."
                        icon={MessageSquare}
                        iconColor="text-fuchsia-500"
                        gradient="from-fuchsia-500/10 to-purple-500/10"
                        delay={4}
                        onClick={() => navigate('/surveys')}
                    />

                    {/* Utility: Fairs */}
                    <BentoCard
                        span="md:col-span-1 md:row-span-1"
                        title="Ferias"
                        description="Gestión de asignación de stands."
                        icon={Briefcase}
                        iconColor="text-indigo-500"
                        gradient="from-indigo-500/10 to-violet-500/10"
                        delay={5}
                        onClick={() => navigate('/fairs')}
                    />

                    {/* Utility: Certificates */}
                    <BentoCard
                        span="md:col-span-1 md:row-span-1"
                        title="Certificados"
                        description="Generación automática de diplomas."
                        icon={Award}
                        iconColor="text-amber-500"
                        gradient="from-amber-500/10 to-yellow-500/10"
                        delay={6}
                        onClick={() => navigate('/certificates')}
                    />
                </div>

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-widest">
                    <span>UNEMI • Emprendimiento</span>
                    <span>v2.5.0 • Mission Control</span>
                </footer>
            </div>
        </div>
    );
}

export default Portal;
