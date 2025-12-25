import { useState, useEffect } from 'react';
import { Menu, X, LogOut, Calendar, Home, CheckCircle, Filter, ChevronDown, CalendarDays, ArrowLeft, Check, Plus, Pencil, Trash2, Save, Search, Clock, MapPin } from 'lucide-react';
import { events2026, responsibleOptions } from '../data/eventsData';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function EventDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedResponsible, setSelectedResponsible] = useState('Todos');
    const [searchTerm, setSearchTerm] = useState('');
    const [events, setEvents] = useState(events2026);
    const [trackingModalOpen, setTrackingModalOpen] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);
    const [formData, setFormData] = useState({
        month: 'ENERO',
        type: 'Taller',
        name: '',
        scope: 'Interno',
        guest: '',
        responsibles: [],
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        indicator: 'Eventos de capacitación',
        tracking: {
            emailsSent: false,
            auditoriumRequested: false,
            invitationsSent: false,
            confirmedAttendance: false,
            resourcesReady: false
        }
    });

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleTracking = (eventId, field) => {
        setEvents(prev => prev.map(ev => {
            if (ev.id === eventId) {
                return {
                    ...ev,
                    tracking: {
                        ...ev.tracking,
                        [field]: !ev.tracking[field]
                    }
                };
            }
            return ev;
        }));
    };

    const getResbonsibleColor = (name) => {
        const n = name.toUpperCase();
        if (n.includes('ANGIE')) return 'bg-pink-100 text-pink-700 border-pink-200';
        if (n.includes('CARLOS')) return 'bg-blue-100 text-blue-700 border-blue-200';
        if (n.includes('XUXA')) return 'bg-green-100 text-green-700 border-green-200';
        if (n.includes('MARCOS')) return 'bg-orange-100 text-orange-700 border-orange-200';
        if (n.includes('JAEL')) return 'bg-purple-100 text-purple-700 border-purple-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getResponsibleDotColor = (name) => {
        const n = name.toUpperCase();
        if (n.includes('ANGIE')) return 'bg-pink-500 shadow-pink-500/50';
        if (n.includes('CARLOS')) return 'bg-blue-500 shadow-blue-500/50';
        if (n.includes('XUXA')) return 'bg-green-500 shadow-green-500/50';
        if (n.includes('MARCOS')) return 'bg-orange-500 shadow-orange-500/50';
        if (n.includes('JAEL')) return 'bg-purple-500 shadow-purple-500/50';
        return 'bg-slate-500 shadow-slate-500/50';
    };

    const getIndicatorColor = (indicator) => {
        switch (indicator) {
            case 'Eventos de capacitación': return 'bg-indigo-900/30 text-indigo-300 border-indigo-500/30';
            case 'Eventos de sensibilización': return 'bg-pink-900/30 text-pink-300 border-pink-500/30';
            case 'Encuentro de articulación profesional o emprendedora': return 'bg-amber-900/30 text-amber-300 border-amber-500/30';
            default: return 'bg-slate-800 text-slate-400 border-slate-700';
        }
    };

    const resetForm = () => {
        setFormData({
            month: 'ENERO',
            type: 'Taller',
            name: '',
            scope: 'Interno',
            guest: '',
            responsibles: [],
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            indicator: 'Eventos de capacitación',
            tracking: {
                emailsSent: false,
                auditoriumRequested: false,
                invitationsSent: false,
                confirmedAttendance: false,
                resourcesReady: false
            }
        });
        setCurrentEvent(null);
    };

    const handleAddNew = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEdit = (event) => {
        setCurrentEvent(event);
        setFormData(event);
        setIsFormOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de eliminar este evento?')) {
            setEvents(prev => prev.filter(ev => ev.id !== id));
        }
    };

    const handleSave = () => {
        if (currentEvent) {
            // Update existing
            setEvents(prev => prev.map(ev => ev.id === currentEvent.id ? { ...formData, id: currentEvent.id } : ev));
        } else {
            // Create new
            const newEvent = {
                ...formData,
                id: Math.max(...events.map(e => e.id), 0) + 1
            };
            setEvents(prev => [...prev, newEvent]);
        }
        setIsFormOpen(false);
        resetForm();
    };


    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleResponsibleChange = (resp) => {
        setFormData(prev => {
            const responsibles = prev.responsibles.includes(resp)
                ? prev.responsibles.filter(r => r !== resp)
                : [...prev.responsibles, resp];
            return { ...prev, responsibles };
        });
    };

    // Auto-update Month and Indicator based on Type (Auto-Mapping logic)
    useEffect(() => {
        const typeToIndicator = {
            '@Emprender': 'Eventos de sensibilización',
            'Taller': 'Eventos de capacitación',
            'Webinar': 'Eventos de capacitación',
            'Emprendex': 'Eventos de sensibilización',
            'Networking': 'Encuentro de articulación profesional o emprendedora',
            'Bootcamp Parte I': 'Eventos de capacitación',
            'Bootcamp Parte II': 'Eventos de capacitación',
            'Bootcamp Parte III': 'Eventos de capacitación',
            'Otro': ''
        };

        if (formData.type && typeToIndicator[formData.type]) {
            setFormData(prev => ({ ...prev, indicator: typeToIndicator[formData.type] }));
        }

    }, [formData.type]);

    // Auto-update Month based on Date
    useEffect(() => {
        if (formData.date) {
            const dateObj = new Date(formData.date + 'T12:00:00');
            const monthNames = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
            setFormData(prev => ({ ...prev, month: monthNames[dateObj.getMonth()] || 'ENERO' }));
        }
    }, [formData.date]);

    const [selectedMonth, setSelectedMonth] = useState('Todos');
    const months = ['Todos', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

    const filteredEvents = events.filter(ev => {
        const matchesResponsible = selectedResponsible === 'Todos' || ev.responsibles.includes(selectedResponsible);
        const matchesMonth = selectedMonth === 'Todos' || ev.month === selectedMonth;
        const matchesSearch = searchTerm === '' ||
            ev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ev.type.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesResponsible && matchesMonth && matchesSearch;
    });

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans selection:bg-primary-500/20">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 z-50 flex items-center px-4 justify-between transition-colors duration-300">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <span className="font-bold text-white text-lg">E</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white tracking-tight">Events</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 shadow-2xl lg:shadow-none transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-16 lg:pt-0 flex flex-col
            `}>
                {/* Brand */}
                <div className="hidden lg:block p-8">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/20">
                            <span className="font-bold text-xl text-white">E</span>
                        </div>
                        <h1 className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Emprende</h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 pl-1">Gestión de Eventos 2026</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Menú Principal</div>
                    <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 font-bold"
                    >
                        <CalendarDays size={20} className="text-primary-600 dark:text-primary-400" />
                        <span>Cronograma 2026</span>
                    </button>
                </nav>

                {/* User Profile & Back to Portal */}
                <div className="p-4 m-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-sm text-slate-600 font-bold">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate opacity-80">{user?.email || 'admin@emprende.com'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => navigate('/portal')} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 transition-all text-xs font-bold shadow-sm hover:shadow">
                            <ArrowLeft size={14} /> Portal
                        </button>
                        <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-500/10 border border-slate-200 dark:border-white/5 transition-all text-xs font-bold shadow-sm hover:shadow">
                            <LogOut size={14} /> Salir
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-0 bg-slate-50 dark:bg-slate-900 transition-all duration-300 w-full max-w-full overflow-x-hidden">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 px-4 lg:px-8 border-b border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl sticky top-0 z-40">
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Panel de Eventos
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            Gestión y seguimiento del cronograma 2026
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-600/30 hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all duration-300 ring-2 ring-white/20 ring-offset-2 dark:ring-offset-slate-900"
                        >
                            <Plus size={20} className="stroke-[3px]" />
                            <span>Nuevo Evento</span>
                        </button>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full space-y-8">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Calendar size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Total Eventos</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">{events.length}</span>
                        </div>
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Completados</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {events.filter(e => Object.values(e.tracking).some(t => t)).length}
                            </span>
                        </div>
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Clock size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Próximo Mes</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {events.filter(e => e.month === 'ENERO').length}
                            </span>
                        </div>
                        <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 shadow-sm">
                            <div className="flex items-center gap-3 mb-2 text-slate-500 dark:text-slate-400">
                                <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                    <Filter size={18} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Filtrados</span>
                            </div>
                            <span className="text-3xl font-black text-slate-900 dark:text-white">
                                {filteredEvents.length}
                            </span>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="flex flex-col gap-6">



                        {/* Search and Filters Container */}
                        <div className="flex flex-col gap-6 bg-slate-900 p-6 rounded-[2rem] shadow-xl border border-slate-800">

                            {/* Search Bar */}
                            <div className="relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-slate-400 transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar evento por nombre, tipo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 focus:border-slate-600 focus:ring-4 focus:ring-slate-800/50 outline-none transition-all placeholder:text-slate-600 text-slate-200 font-medium"
                                />
                            </div>

                            {/* Month Filter - Improved */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm ml-1">
                                    <Calendar size={18} className="text-orange-500" />
                                    <span>Filtrar por Mes</span>
                                </div>
                                <div className="flex overflow-x-auto pb-4 -mx-1 px-1 gap-2 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                    {months.map(month => (
                                        <button
                                            key={month}
                                            onClick={() => setSelectedMonth(month)}
                                            className={`px-6 py-2.5 rounded-2xl text-xs font-black tracking-wide whitespace-nowrap snap-center transition-all duration-300 border uppercase ${selectedMonth === month
                                                ? 'bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                                : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                                                }`}
                                        >
                                            {month}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Responsible Filter */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-200 font-bold text-sm ml-1">
                                    <Filter size={18} className="text-orange-500" />
                                    <span>Filtrar por Responsable</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedResponsible('Todos')}
                                        className={`px-6 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 border uppercase ${selectedResponsible === 'Todos'
                                            ? 'bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                            : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                                            }`}
                                    >
                                        Todos
                                    </button>
                                    {responsibleOptions.map(resp => (
                                        <button
                                            key={resp}
                                            onClick={() => setSelectedResponsible(resp)}
                                            className={`pl-5 pr-6 py-2.5 rounded-2xl text-xs font-black tracking-wide transition-all duration-300 flex items-center gap-2.5 border uppercase ${selectedResponsible === resp
                                                ? 'bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)] transform scale-105'
                                                : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 hover:text-slate-300'
                                                }`}
                                        >
                                            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] transition-colors duration-300 ${getResponsibleDotColor(resp)}`}></div>
                                            {resp.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View: Table (Floating Rows) */}
                    <div className="hidden md:block">
                        <div className="overflow-x-auto pb-4">
                            <table className="w-full text-left border-separate border-spacing-y-4">
                                <thead>
                                    <tr className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-4">
                                        <th className="px-6 py-2 w-20 text-center">Fecha</th>
                                        <th className="px-6 py-2">Evento y Orador</th>
                                        <th className="px-6 py-2 w-48">Indicador</th>
                                        <th className="px-6 py-2 w-32 text-center">Alcance</th>
                                        <th className="px-6 py-2 w-64">Responsables</th>
                                        <th className="px-6 py-2 w-40">Horario</th>
                                        <th className="px-6 py-2 w-40">Lugar</th>
                                        <th className="px-6 py-2 text-center w-32">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-600 dark:text-slate-300">
                                    {filteredEvents.map((ev, index) => (
                                        <tr
                                            key={ev.id}
                                            className="bg-white dark:bg-slate-800 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:scale-[1.005] transition-all duration-300 group rounded-2xl relative z-0 hover:z-10"
                                        >
                                            {/* Date Column - Visual Calendar */}
                                            <td className="p-4 rounded-l-2xl border-l-4 border-transparent hover:border-primary-500 transition-colors">
                                                <div className="flex flex-col items-center justify-center bg-slate-800/80 dark:bg-white/5 rounded-2xl p-2 w-16 h-16 border border-slate-700/50 dark:border-white/10 shadow-inner">
                                                    <span className="text-[10px] font-black uppercase text-red-400 tracking-wider">
                                                        {ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '') : ''}
                                                    </span>
                                                    <span className="text-2xl font-black text-white leading-none">
                                                        {ev.date ? new Date(ev.date + 'T12:00:00').getDate() : '-'}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-black text-orange-400 dark:text-orange-300 text-lg leading-tight whitespace-normal">
                                                        {ev.type}
                                                    </span>
                                                    {ev.name && (
                                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-snug whitespace-normal">
                                                            {ev.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className={`text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg text-center leading-snug whitespace-normal border bg-opacity-10 dark:bg-opacity-20 ${getIndicatorColor(ev.indicator)}`}>
                                                    {ev.indicator || '-'}
                                                </div>
                                            </td>

                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${ev.scope === 'Interno'
                                                    ? 'bg-blue-900/30 text-blue-400 border-blue-500/30'
                                                    : 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30'
                                                    }`}>
                                                    {ev.scope}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex flex-col gap-2">
                                                    {ev.responsibles.map((resp, i) => (
                                                        <div key={i} className="flex items-center gap-2 group/resp">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${getResbonsibleColor(resp).split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}></div>
                                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 group-hover/resp:text-slate-900 dark:group-hover/resp:text-white transition-colors">
                                                                {resp}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                {(ev.date || ev.startTime) ? (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                                                            <span className="capitalize">
                                                                {ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long' }) : ''}
                                                            </span>
                                                        </div>
                                                        {(ev.startTime || ev.endTime) && (
                                                            <div className="inline-flex items-center gap-2 bg-slate-800/80 dark:bg-white/5 px-3 py-1.5 rounded-lg w-fit border border-slate-700/50 dark:border-white/10">
                                                                <Clock size={12} className="text-slate-400" />
                                                                <span className="text-[11px] font-bold text-slate-400">
                                                                    {ev.startTime || '--:--'} - {ev.endTime || '--:--'}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : <span className="text-slate-300">-</span>}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                                    <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500">
                                                        <MapPin size={14} />
                                                    </div>
                                                    <span className="line-clamp-2 max-w-[120px]">{ev.location || 'Por definir'}</span>
                                                </div>
                                            </td>

                                            <td className="p-4 rounded-r-2xl">
                                                <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setTrackingModalOpen(trackingModalOpen === ev.id ? null : ev.id);
                                                        }}
                                                        className={`p-2 rounded-lg transition-all ${Object.values(ev.tracking).some(Boolean)
                                                            ? 'bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400'
                                                            : 'bg-slate-100 dark:bg-white/5 text-slate-400'
                                                            }`}
                                                        title="Seguimiento"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(ev)}
                                                        className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(ev.id)}
                                                        className="p-2 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                {/* Global Tracking Modal Trigger - Logic removed from here */}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {
                            filteredEvents.length === 0 && (
                                <div className="p-16 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <Filter size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No se encontraron eventos</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Intenta cambiar el filtro de responsable.</p>
                                </div>
                            )
                        }
                    </div >

                    {/* Mobile View: Cards */}
                    < div className="md:hidden space-y-4 pb-20" >
                        {
                            filteredEvents.map(ev => (
                                <div key={ev.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-white/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-2 min-w-[3.5rem]">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{ev.month.substring(0, 3)}</span>
                                                <span className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                                                    {ev.date ? new Date(ev.date + 'T12:00:00').getDate() : '-'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                                                    {ev.date ? new Date(ev.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '') : ''}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{ev.type}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ev.scope === 'Interno'
                                                    ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    }`}>
                                                    {ev.scope}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(ev)}
                                            className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(ev.id)}
                                            className="p-2 bg-slate-50 dark:bg-white/5 text-slate-500 rounded-xl"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setTrackingModalOpen(trackingModalOpen === ev.id ? null : ev.id)}
                                            className={`p-2 rounded-xl transition-colors ${Object.values(ev.tracking).some(Boolean)
                                                ? 'bg-primary-50 text-primary-600'
                                                : 'bg-slate-50 text-slate-400'
                                                }`}
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>

                                    {
                                        ev.name && (
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 pl-1 border-l-2 border-primary-200 dark:border-primary-800 ml-1 py-1 pr-2">
                                                {ev.name}
                                            </p>
                                        )
                                    }

                                    {
                                        ev.indicator && (
                                            <div className="mb-4">
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded border border-slate-100 dark:border-white/5 uppercase tracking-wide">
                                                    {ev.indicator}
                                                </span>
                                            </div>
                                        )
                                    }

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {
                                            ev.responsibles.map((resp, i) => (
                                                <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getResbonsibleColor(resp)}`}>
                                                    {resp.split(' ')[0]} {resp.split(' ')[1]?.[0]}.
                                                </span>
                                            ))
                                        }
                                    </div>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <Home size={14} />
                                            <span>{ev.location || 'Por definir'}</span>
                                        </div>
                                        {ev.guest && (
                                            <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                                                <span>⭐ {ev.guest}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Tracking Modal */}
                                    {trackingModalOpen === ev.id && (
                                        <>
                                            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setTrackingModalOpen(null)}></div>
                                            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 rounded-t-3xl z-50 p-6 animate-in slide-in-from-bottom-full duration-300">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">Seguimiento</h4>
                                                    <button onClick={() => setTrackingModalOpen(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {[
                                                        { key: 'emailsSent', label: 'Correos Enviados' },
                                                        { key: 'auditoriumRequested', label: 'Auditorio Solicitado' },
                                                        { key: 'invitationsSent', label: 'Invitaciones Enviadas' },
                                                        { key: 'resourcesReady', label: 'Recursos Listos' },
                                                    ].map((item) => (
                                                        <label key={item.key} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl cursor-pointer active:scale-98 transition-transform">
                                                            <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${ev.tracking[item.key]
                                                                ? 'bg-primary-500 border-primary-500 text-white'
                                                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                                                }`}>
                                                                {ev.tracking[item.key] && <Check size={14} strokeWidth={4} />}
                                                                <input
                                                                    type="checkbox"
                                                                    checked={ev.tracking[item.key]}
                                                                    onChange={() => toggleTracking(ev.id, item.key)}
                                                                    className="hidden"
                                                                />
                                                            </div>
                                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                                {item.label}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        }
                    </div >
                </div >

                {/* Edit/Create Modal */}
                {
                    isFormOpen && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsFormOpen(false)}></div>
                            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200 custom-scrollbar">
                                <div className="px-8 py-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl z-10 transition-all">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {currentEvent ? 'Editar Evento' : 'Nuevo Evento'}
                                        </h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            Completa la información del evento
                                        </p>
                                    </div>
                                    <button onClick={() => setIsFormOpen(false)} className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Type & Scope Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tipo de Evento</label>
                                            <div className="relative">
                                                <select
                                                    name="type"
                                                    value={formData.type}
                                                    onChange={handleFormChange}
                                                    className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 appearance-none transition-all cursor-pointer"
                                                >
                                                    <option>Taller</option>
                                                    <option>Webinar</option>
                                                    <option>@Emprender</option>
                                                    <option>Emprendex</option>
                                                    <option>Bootcamp Parte I</option>
                                                    <option>Bootcamp Parte II</option>
                                                    <option>Bootcamp Parte III</option>
                                                    <option>Networking</option>
                                                    <option>Otro</option>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Alcance</label>
                                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                                                {['Interno', 'Externo'].map((scopeOption) => (
                                                    <button
                                                        key={scopeOption}
                                                        onClick={() => setFormData({ ...formData, scope: scopeOption })}
                                                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${formData.scope === scopeOption
                                                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                            }`}
                                                    >
                                                        {scopeOption}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Indicator (Read Only) */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Indicador (Automático)</label>
                                        <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 cursor-not-allowed flex items-center gap-3 opacity-80">
                                            <div className={`w-3 h-3 rounded-full ${formData.indicator ? getIndicatorColor(formData.indicator).replace('text-', 'bg-').split(' ')[0] : 'bg-slate-300'}`}></div>
                                            <span className="font-bold text-slate-500 dark:text-slate-400 select-none">
                                                {formData.indicator || 'Selecciona un tipo de evento...'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Nombre del Evento</label>
                                        <textarea
                                            name="name"
                                            value={formData.name}
                                            onChange={handleFormChange}
                                            placeholder="Escribe un nombre descriptivo..."
                                            rows="2"
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white resize-none transition-all placeholder:text-slate-400"
                                        ></textarea>
                                    </div>

                                    {/* Date & Time Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fecha</label>
                                            <input
                                                type="date"
                                                name="date"
                                                value={formData.date}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Inicio</label>
                                            <input
                                                type="time"
                                                name="startTime"
                                                value={formData.startTime || ''}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                        <div className="md:col-span-4 space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Fin</label>
                                            <input
                                                type="time"
                                                name="endTime"
                                                value={formData.endTime || ''}
                                                onChange={handleFormChange}
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 dark:text-slate-200 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Ubicación</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleFormChange}
                                                    placeholder="Ej: Bloque V, Zoom..."
                                                    className="w-full pl-11 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Invitado (Opcional)</label>
                                            <input
                                                type="text"
                                                name="guest"
                                                value={formData.guest}
                                                onChange={handleFormChange}
                                                placeholder="Nombre del invitado..."
                                                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-900 dark:text-white transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Responsables</label>
                                        <div className="flex flex-wrap gap-2.5 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                            {responsibleOptions.map(resp => (
                                                <button
                                                    key={resp}
                                                    onClick={() => handleResponsibleChange(resp)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide border-2 transition-all duration-300 ${formData.responsibles.includes(resp)
                                                        ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-600/30 scale-105'
                                                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'
                                                        }`}
                                                >
                                                    {resp}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky bottom-0 z-10">
                                    <button
                                        onClick={() => setIsFormOpen(false)}
                                        className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-8 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 shadow-xl shadow-primary-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
                                    >
                                        <Save size={20} className="stroke-[2.5px]" />
                                        <span>Guardar Cambios</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </main >
            {/* Global Tracking Modal */}
            {trackingModalOpen && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" onClick={() => setTrackingModalOpen(null)}></div>
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl z-50 p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="font-black text-xl text-slate-900 dark:text-white">Seguimiento</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Control de estado logístico</p>
                            </div>
                            <button onClick={() => setTrackingModalOpen(null)} className="p-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {[
                                { key: 'emailsSent', label: 'Correos Enviados' },
                                { key: 'auditoriumRequested', label: 'Auditorio Solicitado' },
                                { key: 'invitationsSent', label: 'Invitaciones Enviadas' },
                                { key: 'resourcesReady', label: 'Recursos Listos' },
                            ].map((item) => {
                                const currentEv = events.find(e => e.id === trackingModalOpen);
                                if (!currentEv) return null;

                                return (
                                    <label key={item.key} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl cursor-pointer active:scale-98 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${currentEv.tracking[item.key]
                                            ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20'
                                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                            }`}>
                                            {currentEv.tracking[item.key] && <Check size={14} strokeWidth={4} />}
                                            <input
                                                type="checkbox"
                                                checked={currentEv.tracking[item.key]}
                                                onChange={() => toggleTracking(currentEv.id, item.key)}
                                                className="hidden"
                                            />
                                        </div>
                                        <span className={`font-bold transition-colors ${currentEv.tracking[item.key]
                                            ? 'text-slate-900 dark:text-white'
                                            : 'text-slate-600 dark:text-slate-400'}`}>
                                            {item.label}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div >
    );
}

export default EventDashboard;
