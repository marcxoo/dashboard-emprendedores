import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase, Plus, ArrowLeft, Search, MapPin, Trash2, Edit, X, Check, Filter, ChevronRight, Store, Phone, Mail, Database, DollarSign, TrendingUp, Download, ArrowUpDown, ArrowUp, ArrowDown, UserPlus, Building2, Tag, FileText, List, Instagram, Facebook, Globe } from 'lucide-react';
import { useData } from '../context/DataContext';
import { EntrepreneurModal } from './EntrepreneursList';
import { ShineBorder } from './ui/ShineBorder';

export default function FairsDashboard() {
    const { fairs } = useData();
    const [selectedFairId, setSelectedFairId] = useState(null);

    // If a fair is selected, show the details view
    const selectedFair = fairs.find(f => f.id === selectedFairId);

    if (selectedFair) {
        return <FairDetails fair={selectedFair} onBack={() => setSelectedFairId(null)} />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <FairsOverview onSelect={setSelectedFairId} />
            </div>
        </div>
    );
}

// --- High Level View: List of Fairs ---

// --- High Level View: List of Fairs ---

function FairsOverview({ onSelect }) {
    const { fairs, addFair, fairAssignments, updateFair } = useData();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [currentFair, setCurrentFair] = useState(null);

    // Calculate stats for each fair
    const getFairStats = (fairId) => {
        const assignments = (fairAssignments || []).filter(a => a.fair_id === fairId);
        return { count: assignments.length };
    };

    return (
        <div className="space-y-10">
            {/* Hero Header - Redesigned Premium */}
            <div className="relative rounded-[2.5rem] bg-[#0b2e43] p-8 sm:p-12 overflow-hidden shadow-2xl isolate border border-white/5">
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff7900] opacity-15 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0ea5e9] opacity-10 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="max-w-2xl">
                        <button
                            onClick={() => navigate('/portal')}
                            className="flex items-center gap-2 text-slate-300 hover:text-white mb-6 transition-colors font-medium group"
                        >
                            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                <ArrowLeft size={18} />
                            </div>
                            <span className="text-sm tracking-wide">Volver al Portal</span>
                        </button>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1] mb-4">
                            Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7900] to-[#fb923c]">Ferias</span>
                        </h1>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
                            Administra tus eventos, designa emprendedores y lleva el control financiero con precisión.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsEditing(true)}
                        className="group bg-white text-[#0b2e43] pl-2 pr-8 py-2 rounded-full font-bold flex items-center gap-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                        <div className="bg-[#ff7900] w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                            <Plus size={26} strokeWidth={3} />
                        </div>
                        <span className="text-lg tracking-tight">Nueva Feria</span>
                    </button>
                </div>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(fairs || []).map(fair => {
                    const stats = getFairStats(fair.id);
                    const isFinished = isPast(fair.date);

                    return (
                        <div key={fair.id} onClick={() => onSelect(fair.id)} className="group relative cursor-pointer h-full">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                            <div className="bg-white dark:bg-slate-900 rounded-[1.9rem] p-6 border border-slate-200 dark:border-slate-800 relative h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1">

                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isFinished
                                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isFinished ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                                        {isFinished ? 'Finalizada' : 'Activa'}
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentFair(fair); setIsEditing(true); }}
                                        className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>

                                {/* Icon & Title */}
                                <div className="mb-6">
                                    <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 ${isFinished ? 'bg-slate-400 dark:bg-slate-700' : 'bg-gradient-to-br from-primary-500 to-primary-600'
                                        }`}>
                                        <Store size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {fair.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <MapPin size={16} className="text-secondary-500" />
                                        <span className="truncate">{fair.location || 'Ubicación pendientes'}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-4"></div>

                                {/* Footer Stats */}
                                <div className="mt-auto grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">FECHA</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {fair.end_date && fair.end_date !== fair.date
                                                ? `${new Date(fair.date + 'T12:00:00').getDate()}-${new Date(fair.end_date + 'T12:00:00').getDate()} ${new Date(fair.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}`
                                                : new Date(fair.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">EMPRENDEDORES</p>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-primary-500" />
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{stats.count}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isEditing && (
                <FairModal
                    fair={currentFair}
                    onClose={() => { setIsEditing(false); setCurrentFair(null); }}
                    onSave={(data) => {
                        if (currentFair) updateFair(currentFair.id, data);
                        else addFair(data);
                        setIsEditing(false);
                        setCurrentFair(null);
                    }}
                />
            )}
        </div>
    )
}

// --- Detail View: Single Fair Panel ---

// --- Detail View: Single Fair Panel ---

function FairDetails({ fair, onBack }) {
    const [activeTab, setActiveTab] = useState('participants'); // participants, sales

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Sticky Header with Glassmorphism */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-4">
                        <button
                            onClick={onBack}
                            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors font-medium text-sm"
                        >
                            <div className="p-1 rounded-lg group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                                <ArrowLeft size={16} />
                            </div>
                            <span>Volver a Ferias</span>
                        </button>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                                    {fair.name}
                                    {isPast(fair.date) && (
                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                                            Finalizada
                                        </span>
                                    )}
                                </h1>
                                <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <Calendar size={16} className="text-primary-500" />
                                        {formatDateRange(fair.date, fair.end_date)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="flex items-center gap-2">
                                        <MapPin size={16} className="text-secondary-500" />
                                        {fair.location}
                                    </span>
                                </div>
                            </div>

                            {/* Premium Tabs */}
                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl gap-1">
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'participants'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Users size={18} /> Participantes
                                </button>
                                <button
                                    onClick={() => setActiveTab('sales')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'sales'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <DollarSign size={18} /> Ventas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                {activeTab === 'participants' && <FairParticipants fairId={fair.id} />}
                {activeTab === 'sales' && <FairSalesTracker fairId={fair.id} />}
            </div>
        </div>
    )
}

function FairParticipants({ fairId }) {
    const {
        fairAssignments,
        fairEntrepreneurs,
        entrepreneurs, // Import main list for cross-referencing details
        assignEntrepreneurToFair,
        addFairEntrepreneur,
        addEntrepreneur, // Main DB add
        updateFairAssignmentStatus, // Import logic
        bulkImportFairEntrepreneurs, // Bulk Import
        removeEntrepreneurFromFair // Add this for delete functionality
    } = useData();
    const [showImport, setShowImport] = useState(false);
    const [filter, setFilter] = useState('');

    // Quick Register State
    const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false);

    // Dynamic categories derived from existing entrepreneurs + defaults
    const categories = useMemo(() => {
        const defaults = ['ALIMENTOS', 'ARTESANIAS', 'BEBIDAS', 'COMIDA RAPIDA', 'COSMETICOS', 'POSTRES', 'ROPA', 'SERVICIOS', 'OTRO'];
        const existing = entrepreneurs?.map(e => e.categoria_principal).filter(Boolean) || [];
        return [...new Set([...defaults, ...existing])].sort();
    }, [entrepreneurs]);

    const handleQuickRegister = async (data) => {
        try {
            // Create Entrepreneur
            const newEnt = await addEntrepreneur({
                ...data,
                active_status: 'active'
            });

            if (newEnt && newEnt.id) {
                // Assign to Fair
                await assignEntrepreneurToFair(fairId, newEnt.id);
                // Set status to confirmed
                await updateFairAssignmentStatus(fairId, newEnt.id, 'confirmed');

                setIsQuickRegisterOpen(false);
            }
        } catch (error) {
            console.error("Quick Register Error:", error);
            alert("Error al registrar: " + error.message);
        }
    };

    const handleExportCSV = () => {
        // Headers - Using semicolon separator for Spanish Excel compatibility
        const headers = ['Nombre Emprendimiento', 'Nombre del Emprendedor', 'Número de Contacto', 'Descripción'];

        // Rows
        const rows = participants.map(p => {
            // Logic to find description from main list if missing (same as display logic)
            let displayActivity = p.activity || '';
            if (!displayActivity && entrepreneurs) {
                const match = entrepreneurs.find(ent =>
                    (ent.nombre_emprendimiento && ent.nombre_emprendimiento === p.business_name) ||
                    (ent.persona_contacto && ent.persona_contacto === p.name)
                );
                if (match) displayActivity = match.actividad_economica || '';
            }

            // Clean values - remove newlines and extra quotes
            const cleanValue = (val) => (val || '').replace(/[\r\n]+/g, ' ').replace(/"/g, '""').trim();

            return [
                `"${cleanValue(p.business_name)}"`,
                `"${cleanValue(p.name)}"`,
                `"${cleanValue(p.phone)}"`,
                `"${cleanValue(displayActivity)}"`
            ].join(';'); // Semicolon for Spanish Excel
        });

        // Add BOM for UTF-8 Excel compatibility
        const BOM = '\uFEFF';
        const csvContent = BOM + [headers.join(';'), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `participantes_feria_${fairId}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Detailed View State
    const [selectedParticipant, setSelectedParticipant] = useState(null);

    // Get assigned entrepreneurs with extra data (status)
    const assignments = (fairAssignments || []).filter(a => a.fair_id === fairId);

    // Create a map for fast lookup of assignment details (status)
    const assignmentMap = new Map();
    assignments.forEach(a => assignmentMap.set(a.entrepreneur_id, a));

    const participants = (fairEntrepreneurs || [])
        .filter(e => assignmentMap.has(e.id))
        .filter(e => {
            if (!filter) return true;
            const term = filter.toLowerCase();
            return (
                e.name.toLowerCase().includes(term) ||
                (e.business_name && e.business_name.toLowerCase().includes(term))
            );
        });

    // Sort logic: Confirmed first? Or Alphabetical? Let's go alphabetical for now.
    participants.sort((a, b) => (a.business_name || a.name).localeCompare(b.business_name || b.name));

    return (
        <div className="space-y-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="w-full lg:w-auto flex-1 flex items-center gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-slate-900 dark:text-white font-medium"
                            placeholder="Buscar participante..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    {/* Participant Count */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 text-primary-600 dark:text-primary-400 font-bold text-sm">
                        <Users size={16} />
                        <span>{participants.length}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full lg:w-auto">
                    <button
                        onClick={handleExportCSV}
                        className="flex-1 lg:flex-none btn bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                        title="Exportar a CSV"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                    <button
                        onClick={() => setIsQuickRegisterOpen(true)}
                        className="flex-1 lg:flex-none btn bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                    >
                        <UserPlus size={18} />
                        <span className="hidden sm:inline">Registrar</span>
                    </button>
                    <button
                        onClick={() => setShowImport(true)}
                        className="flex-1 lg:flex-none btn bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all active:scale-95 text-sm"
                    >
                        <Database size={18} />
                        <span>Importar Emprendedor</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {participants.map(e => {
                    const assignment = assignmentMap.get(e.id);
                    const isConfirmed = assignment?.status === 'confirmed';

                    // Fallback to find description from main list if missing
                    let displayActivity = e.activity;
                    if (!displayActivity && entrepreneurs) {
                        const match = entrepreneurs.find(ent =>
                            (ent.nombre_emprendimiento && ent.nombre_emprendimiento === e.business_name) ||
                            (ent.persona_contacto && ent.persona_contacto === e.name)
                        );
                        if (match) displayActivity = match.actividad_economica;
                    }

                    // Create object with activity for modal
                    const participantWithDetails = { ...e, activity: displayActivity };

                    return (
                        <div key={e.id} className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 relative ${isConfirmed
                            ? 'border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                            : 'border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-md'
                            }`}>
                            {/* Card Content - Clickable Region */}
                            <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedParticipant(participantWithDetails)}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm transition-colors shrink-0 ${isConfirmed
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                                        }`}>
                                        {isConfirmed ? <Check size={18} strokeWidth={3} /> : (e.business_name?.charAt(0) || e.name.charAt(0))}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate pr-6 text-base group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {e.business_name || e.name}
                                        </div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5 flex items-center gap-1.5">
                                            {e.category || 'Sin categoría'}
                                        </div>
                                        {displayActivity && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                                {displayActivity}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        const newStatus = isConfirmed ? 'pending' : 'confirmed';
                                        updateFairAssignmentStatus(fairId, e.id, newStatus);
                                    }}
                                    className={`flex-1 text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${isConfirmed
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:border-primary-200 dark:hover:border-primary-500/30 hover:text-primary-600 dark:hover:text-primary-400'
                                        }`}
                                >
                                    {isConfirmed ? (
                                        <>Asistencia Confirmada</>
                                    ) : (
                                        <>Confirmar Asistencia</>
                                    )}
                                </button>

                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (confirm('¿Quitar de esta feria?')) removeEntrepreneurFromFair(fairId, e.id);
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                    title="Remover participante"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}

                {participants.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Users size={32} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-white mb-2">No hay participantes aún</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                            Comienza agregando emprendedores a esta feria. Puedes importarlos masivamente o crear uno nuevo.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowImport(true)}
                                className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/25 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <Database size={18} />
                                Importar Existentes
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Impost Modal */}
            {showImport && (
                <ImportModal
                    existingParticipants={participants} // Pass the full array of participants for name matching
                    onClose={() => setShowImport(false)}
                    onImport={async (selected) => {
                        const newEntrepreneurs = selected.map(emp => ({
                            name: emp.persona_contacto || emp.nombre_emprendimiento,
                            business_name: emp.nombre_emprendimiento,
                            category: emp.categoria_principal,
                            // activity: emp.actividad_economica, // Removed as column doesn't exist
                            phone: emp.telefono,
                            email: emp.correo,
                            status: 'active'
                        }));

                        await bulkImportFairEntrepreneurs(fairId, newEntrepreneurs);
                        setShowImport(false);
                    }} />
            )}

            {/* Detailed Info Modal */}
            {selectedParticipant && (
                <ParticipantDetailsModal
                    participant={selectedParticipant}
                    onClose={() => setSelectedParticipant(null)}
                    fairId={fairId}
                />
            )}



            {/* Quick Register Modal - Reused Component */}
            <EntrepreneurModal
                isOpen={isQuickRegisterOpen}
                onClose={() => setIsQuickRegisterOpen(false)}
                onSave={handleQuickRegister}
                categories={categories}
            />
        </div>
    )
}

function FairSalesTracker({ fairId }) {
    const { fairs, fairAssignments, fairEntrepreneurs, fairSales, addFairSale, deleteFairSale, updateFairAssignmentStatus } = useData();

    // Get current fair first to use its date
    const fair = fairs?.find(f => f.id === fairId);

    // Default to fair's start date, fallback to today
    const [selectedDate, setSelectedDate] = useState(fair?.date || new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntId, setSelectedEntId] = useState(null);
    const [filter, setFilter] = useState('');
    const [viewMode, setViewMode] = useState('participants'); // 'participants' | 'sales'
    const [isExpanded, setIsExpanded] = useState(true);

    // Sorting State
    const [sortConfig, setSortConfig] = useState({ key: 'dailyRevenue', direction: 'desc' });

    // Sync selectedDate when fair data loads (since fairs might load async)
    const [dateSynced, setDateSynced] = useState(false);
    useEffect(() => {
        if (fair?.date && !dateSynced) {
            setSelectedDate(fair.date);
            setDateSynced(true);
        }
    }, [fair?.date, dateSynced]);

    // Escape to close logic
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        if (isModalOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isModalOpen]);

    // Filter participants
    const assignedIds = (fairAssignments || []).filter(a => a.fair_id === fairId).map(a => a.entrepreneur_id);
    const assignedSet = new Set(assignedIds);
    const participants = (fairEntrepreneurs || []).filter(e => assignedSet.has(e.id));

    // Get sales for this fair
    const currentSales = (fairSales || []).filter(s => s.fair_id === fairId);

    // 1. Process Data (Calculate Revenues)
    const processedParticipants = useMemo(() => {
        return participants.map(p => {
            const daySale = currentSales.find(s => s.entrepreneur_id === p.id && s.sale_date === selectedDate);
            const totalEntRevenue = currentSales.filter(s => s.entrepreneur_id === p.id).reduce((sum, s) => sum + Number(s.amount), 0);

            return {
                ...p,
                displayName: p.business_name || p.name,
                dailyRevenue: daySale ? Number(daySale.amount) : 0,
                totalRevenue: totalEntRevenue,
                hasDaySale: !!daySale
            };
        });
    }, [participants, currentSales, selectedDate]);

    // 2. Filter & Sort
    const filteredAndSortedParticipants = useMemo(() => {
        let result = processedParticipants.filter(p => {
            const term = filter.toLowerCase();
            return (
                (p.business_name && p.business_name.toLowerCase().includes(term)) ||
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term))
            );
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Handle string comparison for names
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }

                // Handle numeric comparison
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [processedParticipants, filter, sortConfig]);

    // Calculate totals
    const totalRevenue = currentSales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const dailyRevenue = currentSales
        .filter(s => s.sale_date === selectedDate)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Handlers for Sorting
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="ml-1 text-primary-500" />
            : <ArrowDown size={14} className="ml-1 text-primary-500" />;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 col-span-1 sm:col-span-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-primary-100 font-bold text-xs uppercase tracking-wider mb-1">Recaudación Total</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">${totalRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 sm:col-span-2 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">Ventas del Día</p>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">${dailyRevenue.toFixed(2)}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary-500 h-full rounded-full" style={{ width: `${totalRevenue > 0 ? (dailyRevenue / totalRevenue) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Collapsible Content Container */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
                {/* Header Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            <Store size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white text-left">
                            {fair?.name || 'Registro de Ventas'}
                        </h3>
                    </div>
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}>
                        <ChevronRight size={20} className="rotate-90" />
                    </div>
                </button>

                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setViewMode('participants')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'participants'
                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Users size={16} /> Participantes
                            </button>
                            <button
                                onClick={() => setViewMode('sales')}
                                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${viewMode === 'sales'
                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                    }`}
                            >
                                <DollarSign size={16} /> Ventas
                            </button>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-sm transition-all font-medium text-slate-900 dark:text-white"
                                placeholder={viewMode === 'participants' ? "Buscar participante..." : "Buscar para registrar venta..."}
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* DEBUG INFO */}
                    <div className="md:hidden px-5 py-2 text-xs text-red-500 font-bold bg-red-100 border-b border-red-200 mb-2">
                        DEBUG: viewMode="{viewMode}", isExpanded="{isExpanded.toString()}", salesCount={currentSales.length}
                    </div>

                    {/* Mobile Sort Controls - Force Render */}
                    <div className="md:hidden px-5 pb-4 flex gap-2 overflow-x-auto no-scrollbar">
                        <select
                            value={sortConfig.key}
                            onChange={(e) => requestSort(e.target.value)}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 font-bold"
                        >
                            <option value="displayName">Ordenar por Nombre</option>
                            <option value="dailyRevenue">Ordenar por Venta Día</option>
                            <option value="totalRevenue">Ordenar por Acumulado</option>
                            <option value="category">Ordenar por Categoría</option>
                        </select>
                        <button
                            onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            {sortConfig.direction === 'asc' ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                        </button>
                    </div>

                    {/* Desktop/Tablet View - Toggled */}
                    {viewMode === 'sales' ? (
                        /* Sales Table View */
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th
                                            onClick={() => requestSort('displayName')}
                                            className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-1">Emprendedor {getSortIcon('displayName')}</div>
                                        </th>
                                        <th
                                            onClick={() => requestSort('category')}
                                            className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                                        >
                                            <div className="flex items-center gap-1">Categoría {getSortIcon('category')}</div>
                                        </th>
                                        <th
                                            onClick={() => requestSort('dailyRevenue')}
                                            className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                                        >
                                            <div className="flex items-center justify-end gap-1">Venta Día {getSortIcon('dailyRevenue')}</div>
                                        </th>
                                        <th
                                            onClick={() => requestSort('totalRevenue')}
                                            className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors select-none"
                                        >
                                            <div className="flex items-center justify-end gap-1">Acumulado {getSortIcon('totalRevenue')}</div>
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                    {filteredAndSortedParticipants.map(participant => {
                                        return (
                                            <tr key={participant.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-900 dark:text-white">{participant.displayName}</div>
                                                    {participant.business_name && (
                                                        <div className="text-xs text-slate-500 text-pretty max-w-[200px]">{participant.name}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium">
                                                        {participant.category || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {participant.hasDaySale ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                                            ${participant.dailyRevenue.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm italic">Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                                                    ${participant.totalRevenue.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {participant.hasDaySale ? (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                                className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 bg-slate-100 dark:bg-slate-800 transition-colors"
                                                                title="Editar monto"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 transition-all active:scale-95"
                                                        >
                                                            Registrar
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredAndSortedParticipants.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                                {filter ? 'No se encontraron resultados para tu búsqueda.' : 'No hay participantes asignados para mostrar.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* Participants Grid View */
                        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                            {filteredAndSortedParticipants.map(participant => {
                                // Verify status from assignments
                                const assignment = (fairAssignments || []).find(a => a.fair_id === fair?.id && a.entrepreneur_id === participant.id);
                                const isConfirmed = assignment?.status === 'confirmed';

                                return (
                                    <div key={participant.id} className="relative bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer" onClick={() => setSelectedParticipant(participant)}>

                                        {/* Status Line - Left Accent */}
                                        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isConfirmed ? 'bg-emerald-500' : 'bg-transparent'}`}></div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-400 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-900/20 dark:group-hover:text-primary-400 transition-colors">
                                                {participant.business_name?.charAt(0) || participant.name.charAt(0)}
                                            </div>
                                            <div className="min-w-0 flex-1 pr-8">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate text-lg leading-tight mb-1">
                                                    {participant.business_name || participant.name}
                                                </h4>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                        {participant.category || 'SIN CATEGORÍA'}
                                                    </p>
                                                    {isConfirmed && (
                                                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">
                                                            CONFIRMADO
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {participant.activity || 'Venta de productos y servicios varios.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Delete Button - Top Right */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); confirmDelete(participant.id); }}
                                            className="absolute top-4 right-4 p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                                            title="Eliminar participante"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                );
                            })}
                            {filteredAndSortedParticipants.length === 0 && (
                                <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                                    <p>{filter ? 'No se encontraron resultados.' : 'No hay participantes asignados.'}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Card List View */}
                    <div className="md:hidden flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/50">
                        {filteredAndSortedParticipants.map(participant => {
                            return (
                                <div key={participant.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.99] duration-200">
                                    {/* Status Strip if active sale */}
                                    {participant.hasDaySale && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}

                                    <div className="flex justify-between items-start gap-3">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white truncate text-base leading-tight max-w-full">
                                                    {participant.business_name || participant.name}
                                                </h4>
                                                {participant.category && (
                                                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide border border-slate-200 dark:border-slate-600">
                                                        {participant.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                                                {participant.name}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Venta Día</p>
                                            {participant.hasDaySale ? (
                                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${participant.dailyRevenue.toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-300 dark:text-slate-600 italic">--</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50 gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Acumulado</span>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                ${participant.totalRevenue.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex-1 max-w-[160px]">
                                            {participant.hasDaySale ? (
                                                <button
                                                    onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <Edit size={14} />
                                                    <span>Editar</span>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                                                >
                                                    <Plus size={16} strokeWidth={3} />
                                                    Registrar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredAndSortedParticipants.length === 0 && (
                            <div className="px-6 py-12 text-center text-slate-500">
                                {filter ? 'No se encontraron resultados.' : 'No hay participantes asignados.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Register Sale Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-sm shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">

                        {/* Clean Header */}
                        <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">Registrar Venta del Día</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">Ingresa el monto generado en el día</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-8 pb-8">
                            {/* Entrepreneur Info Card */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-xl font-bold text-primary-600 dark:text-primary-400 shadow-sm shrink-0">
                                    {participants.find(p => p.id === selectedEntId)?.business_name?.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Emprendedor</p>
                                    <p className="font-bold text-slate-900 dark:text-white truncate text-base">
                                        {participants.find(p => p.id === selectedEntId)?.business_name}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const val = e.target.amount.value;
                                if (val) {
                                    addFairSale({
                                        fair_id: fairId,
                                        entrepreneur_id: selectedEntId,
                                        sale_date: selectedDate,
                                        amount: parseFloat(val)
                                    });
                                    setIsModalOpen(false);
                                }
                            }}>
                                <div className="mb-8 text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <span className="text-4xl font-bold text-slate-300 dark:text-slate-600 mr-2 absolute -left-6 top-2">$</span>
                                        <input
                                            name="amount"
                                            type="number"
                                            step="0.01"
                                            autoFocus
                                            className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none text-6xl font-extrabold text-slate-900 dark:text-white text-center pb-2 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>

                                <button className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-lg shadow-xl shadow-primary-500/25 transition-all hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-3">
                                    <div className="p-1 bg-white/20 rounded-lg">
                                        <Check size={20} className="text-white" strokeWidth={3} />
                                    </div>
                                    Guardar Registro
                                </button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}

// Reusing previous components (ImportModal, FairModal, EntrepreneurModal)
// Just copying them below for completeness or assuming they are in the same file. 
// I will include them to ensure the file is self-contained.

function FairModal({ fair, onClose, onSave }) {
    const [form, setForm] = useState({
        name: fair?.name || '',
        date: fair?.date || '',
        end_date: fair?.end_date || '',
        location: fair?.location || '',
        description: fair?.description || ''
    });

    // Escape listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[50] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {fair ? <Edit size={20} className="text-primary-500" /> : <Plus size={20} className="text-primary-500" />}
                        {fair ? 'Editar Feria' : 'Nueva Feria'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nombre del Evento</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Ej. Feria de Emprendimiento 2026"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fecha Inicio</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fecha Fin</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                value={form.end_date}
                                onChange={e => setForm({ ...form, end_date: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ubicación</label>
                        <input
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            placeholder="Ej. Campus Central"
                        />
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-500/25 transition-all active:scale-95">Guardar Feria</button>
                </div>
            </div>
        </div>
    )
}

function ImportModal({ onClose, onImport, existingParticipants }) {
    const { entrepreneurs } = useData();
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [rucOnly, setRucOnly] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [expandedIds, setExpandedIds] = useState(new Set());
    const [isImporting, setIsImporting] = useState(false);

    // Escape listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Get unique categories for filter
    const categories = useMemo(() => {
        const cats = new Set((entrepreneurs || []).map(e => e.categoria_principal).filter(Boolean));
        return Array.from(cats).sort();
    }, [entrepreneurs]);

    // Create a Set of existing identifiers (names) for fast lookup
    const existingKeys = useMemo(() => {
        const keys = new Set();
        (existingParticipants || []).forEach(p => {
            if (p.business_name) keys.add(p.business_name.toLowerCase().trim());
            if (p.name) keys.add(p.name.toLowerCase().trim());
        });
        return keys;
    }, [existingParticipants]);

    // Filter main entrepreneurs list
    const filtered = (entrepreneurs || []).filter(e => {
        // Exclude already assigned entrepreneurs by checking if their name exists in the fair
        const businessName = e.nombre_emprendimiento?.toLowerCase().trim();
        const contactName = e.persona_contacto?.toLowerCase().trim() || e.name?.toLowerCase().trim();

        if (businessName && existingKeys.has(businessName)) return false;
        // If they don't have a business name, check contact name as secondary check, 
        // but be careful not to exclude over-aggresively. 
        // Ideally, if the CSV record has a business name, we match on that.
        // If it interacts with a record that ONLY has a contact name, we check that too.
        if (!businessName && contactName && existingKeys.has(contactName)) return false;

        const term = search.toLowerCase();
        const matchesSearch = (
            (e.name && e.name.toLowerCase().includes(term)) ||
            (e.nombre_emprendimiento && e.nombre_emprendimiento.toLowerCase().includes(term)) ||
            (e.persona_contacto && e.persona_contacto.toLowerCase().includes(term)) ||
            (e.categoria_principal && e.categoria_principal.toLowerCase().includes(term))
        );
        const matchesCategory = categoryFilter ? e.categoria_principal === categoryFilter : true;
        const matchesRuc = rucOnly ? (e.ruc && e.ruc.length > 5) : true;

        return matchesSearch && matchesCategory && matchesRuc;
    });

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleExpansion = (e, id) => {
        e.stopPropagation();
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const handleImport = async () => {
        setIsImporting(true);
        const selected = (entrepreneurs || []).filter(e => selectedIds.has(e.id));

        // Note: onImport passed from parent handles the loop and insertion
        // But looking at the parent code (FairParticipants), the logic is:
        /*
          onImport={async (selected) => {
               for (const emp of selected) {
                   const newEmp = { ... };
                   await addFairEntrepreneur(newEmp);
               }
          }}
        */
        // Wait, ImportModal calls onImport(selected). The logic defining newEmp is in the PARENT (FairParticipants).
        await onImport(selected);
        setIsImporting(false);
    };

    // Use createPortal to render at the document body level, bypassing all parent stacking contexts
    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-scale-in">

                {/* 1. Header - Fixed */}
                <div className="flex-none px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center z-20">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <div className="bg-primary-50 p-2 rounded-xl text-primary-600 dark:bg-primary-500/20 dark:text-primary-400">
                                <Database size={24} />
                            </div>
                            Importar Emprendedores
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 ml-1">Selecciona participantes de la base de datos global</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Filters - Fixed */}
                <div className="flex-none p-5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                placeholder="Buscar por nombre, ruc o categoría..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="w-full md:w-72">
                            <div className="relative">
                                <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all text-sm font-medium cursor-pointer"
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Todas las Categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* RUC Toggle Button */}
                        <button
                            onClick={() => setRucOnly(!rucOnly)}
                            className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border whitespace-nowrap ${rucOnly
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/50 dark:text-emerald-400'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {rucOnly ? <Check size={18} strokeWidth={3} /> : <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600"></div>}
                            <span>Solo con RUC</span>
                        </button>
                    </div>
                </div>

                {/* 3. List - Flexible */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-slate-950 p-4">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-800">
                                <Search size={32} className="opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">Sin resultados</h3>
                            <p className="text-sm">Intenta ajustar tu búsqueda o filtros</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filtered.map(e => {
                                const isSelected = selectedIds.has(e.id);
                                const hasRuc = e.ruc && e.ruc.length > 5;
                                return (
                                    <div
                                        key={e.id}
                                        onClick={() => toggleSelection(e.id)}
                                        className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${isSelected
                                            ? 'bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-500'
                                            : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-primary-500 border-primary-500 text-white' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent'
                                            }`}>
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`font-bold truncate text-base ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {e.nombre_emprendimiento || e.name || 'Sin Nombre'}
                                                </span>
                                                {hasRuc && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wide">
                                                        RUC
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1.5"><Users size={12} className="text-primary-500" /> {e.persona_contacto || e.name}</span>
                                                {e.categoria_principal && (
                                                    <>
                                                        <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                                                        <span className="text-slate-400 uppercase tracking-wider font-medium">{e.categoria_principal}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Expanded Content */}
                                            {expandedIds.has(e.id) && (
                                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50 text-sm text-slate-600 dark:text-slate-300 animate-fade-in block">
                                                    <p className="font-bold text-primary-500 dark:text-primary-400 text-xs uppercase tracking-wider mb-1">Descripción / Actividad</p>
                                                    {e.actividad_economica || 'Sin descripción disponible.'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Button */}
                                        <button
                                            onClick={(event) => toggleExpansion(event, e.id)}
                                            className={`p-2 rounded-lg transition-colors ${expandedIds.has(e.id) ? 'bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800'}`}
                                            title="Ver más información"
                                        >
                                            <Filter size={18} className="rotate-180" /> {/* Using generic icon or Chevron */}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* 4. Footer - Fixed */}
                <div className="flex-none px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-20 flex justify-between items-center">
                    <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        {selectedIds.size > 0 ? (
                            <span className="text-primary-600 dark:text-primary-400 font-bold">{selectedIds.size} emprendedores seleccionados</span>
                        ) : (
                            <span>Selecciona items de la lista</span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0 || isImporting}
                            className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
                        >
                            {isImporting ? 'Importando...' : 'Importar Selección'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}


function ParticipantDetailsModal({ participant, onClose, fairId }) {
    const {
        fairAssignments,
        updateFairAssignmentStatus
    } = useData();

    // Find assignment status
    const assignment = (fairAssignments || []).find(a => a.fair_id === fairId && a.entrepreneur_id === participant.id);
    const isConfirmed = assignment?.status === 'confirmed';

    // Escape listener
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden flex flex-col max-h-[85vh]">

                {/* Clean Header - White/Transparent */}
                <div className="absolute top-0 right-0 p-6 z-10">
                    <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pb-0 pt-12 flex-1 overflow-y-auto">
                    {/* Centered Big Avatar */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-3xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-700 flex items-center justify-center text-5xl font-bold text-slate-300 dark:text-slate-600 mb-6">
                            {participant.business_name?.charAt(0) || participant.name.charAt(0)}
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                            {participant.business_name || participant.name}
                        </h2>

                        <div className="flex items-center gap-2 mb-4 justify-center text-slate-500 dark:text-slate-400 font-medium">
                            <Users size={16} className="text-primary-500" />
                            <span>{participant.name}</span>
                        </div>

                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border mb-8 flex items-center gap-2 ${isConfirmed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>
                            <div className={`w-2 h-2 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            {isConfirmed ? 'ASISTENCIA CONFIRMADA' : 'PENDIENTE DE CONFIRMACIÓN'}
                        </div>
                    </div>

                    {/* Info Sections */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 space-y-6">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Información de Contacto</h4>

                        {participant.phone && (
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                                        <Phone size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs text-slate-400 font-medium mb-0.5">Teléfono</div>
                                        <div className="font-bold text-slate-700 dark:text-slate-200">{participant.phone}</div>
                                    </div>
                                </div>
                                <a
                                    href={`https://wa.me/${participant.phone?.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                                >
                                    WhatsApp <ArrowLeft size={14} className="rotate-180" />
                                </a>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                                <Mail size={18} />
                            </div>
                            <div className="text-left min-w-0">
                                <div className="text-xs text-slate-400 font-medium mb-0.5">Correo Electrónico</div>
                                <div className="font-bold text-slate-700 dark:text-slate-200 truncate">{participant.email || 'No registrado'}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                                <Briefcase size={18} />
                            </div>
                            <div className="text-left">
                                <div className="text-xs text-slate-400 font-medium mb-0.5">Categoría</div>
                                <div className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{participant.category || 'GENERAL'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6 mb-8">
                        <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                            <Store size={14} /> Actividad / Descripción
                        </h4>
                        <div className="p-5 rounded-3xl border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 leading-relaxed text-sm bg-white dark:bg-slate-800">
                            {participant.activity || participant.displayActivity || 'Sin descripción disponible.'}
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 pb-8">
                    <button
                        onClick={() => {
                            const newStatus = isConfirmed ? 'pending' : 'confirmed';
                            updateFairAssignmentStatus(fairId, participant.id, newStatus);
                            onClose();
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg ${isConfirmed
                            ? 'bg-white text-slate-700 border-2 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                            : 'bg-[#ff7900] hover:bg-[#ea580c] text-white shadow-[#ff7900]/30'
                            }`}
                    >
                        {isConfirmed ? (
                            <>
                                <X size={20} /> Cancelar Asistencia
                            </>
                        ) : (
                            <>
                                <Check size={20} strokeWidth={3} /> Confirmar Asistencia
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}


// Utils
const formatDate = (dateStr) => {
    if (!dateStr) return 'Fecha pendiente';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'Fecha pendiente';

    const start = new Date(startDate + 'T12:00:00');
    const startDay = start.getDate();
    const startMonth = start.toLocaleDateString('es-ES', { month: 'long' });
    const startYear = start.getFullYear();
    const startWeekday = start.toLocaleDateString('es-ES', { weekday: 'long' });

    if (!endDate || endDate === startDate) {
        // Single day event
        return `${startWeekday}, ${startDay} de ${startMonth} de ${startYear}`;
    }

    const end = new Date(endDate + 'T12:00:00');
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('es-ES', { month: 'long' });
    const endYear = end.getFullYear();

    if (startMonth === endMonth && startYear === endYear) {
        // Same month, e.g., "23-25 de enero de 2026"
        return `${startDay}-${endDay} de ${startMonth} de ${startYear}`;
    } else if (startYear === endYear) {
        // Different months, same year
        return `${startDay} de ${startMonth} - ${endDay} de ${endMonth} de ${startYear}`;
    } else {
        // Different years
        return `${startDay} de ${startMonth} de ${startYear} - ${endDay} de ${endMonth} de ${endYear}`;
    }
};

const isPast = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}
