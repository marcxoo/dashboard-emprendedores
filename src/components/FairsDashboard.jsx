import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Briefcase, Plus, ArrowLeft, Search, MapPin, Trash2, Edit, X, Check, Filter, ChevronRight, Store, Phone, Mail, Database, DollarSign, TrendingUp, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
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
            {/* Hero Header */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 p-8 sm:p-12 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-violet-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <button
                            onClick={() => navigate('/portal')}
                            className="flex items-center gap-2 text-indigo-300 hover:text-white mb-4 transition-colors font-medium"
                        >
                            <ArrowLeft size={20} /> Volver al Portal
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">
                            Gestión de Ferias
                        </h1>
                        <p className="text-lg text-indigo-200 max-w-xl">
                            Administra tus eventos, designa emprendedores y lleva el control financiero en un solo lugar.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="group bg-white text-indigo-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-95"
                    >
                        <div className="bg-indigo-100 p-1 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <Plus size={24} />
                        </div>
                        <span className="text-lg">Nueva Feria</span>
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
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
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
                                        className="p-2 -mr-2 -mt-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>

                                {/* Icon & Title */}
                                <div className="mb-6">
                                    <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ${isFinished ? 'bg-slate-400 dark:bg-slate-700' : 'bg-gradient-to-br from-indigo-500 to-violet-600'
                                        }`}>
                                        <Store size={32} />
                                    </div>
                                    <h3 className="font-bold text-2xl text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {fair.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <MapPin size={16} className="text-violet-500" />
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
                                            {new Date(fair.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-1">EMPRENDEDORES</p>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={14} className="text-indigo-500" />
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
                                        <Calendar size={16} className="text-indigo-500" />
                                        {formatDate(fair.date)}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="flex items-center gap-2">
                                        <MapPin size={16} className="text-violet-500" />
                                        {fair.location}
                                    </span>
                                </div>
                            </div>

                            {/* Premium Tabs */}
                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl gap-1">
                                <button
                                    onClick={() => setActiveTab('participants')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'participants'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Users size={18} /> Participantes
                                </button>
                                <button
                                    onClick={() => setActiveTab('sales')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 ${activeTab === 'sales'
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
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
        updateFairAssignmentStatus, // Import logic
        bulkImportFairEntrepreneurs // Bulk Import
    } = useData();
    const [showImport, setShowImport] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [filter, setFilter] = useState('');

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
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all dark:text-white font-medium"
                            placeholder="Buscar participante..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    {/* Participant Count */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
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
                        onClick={() => setShowImport(true)}
                        className="flex-1 lg:flex-none btn bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 text-sm"
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
                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:shadow-md'
                            }`}>
                            {/* Card Content - Clickable Region */}
                            <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedParticipant(participantWithDetails)}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm transition-colors shrink-0 ${isConfirmed
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                        }`}>
                                        {isConfirmed ? <Check size={18} strokeWidth={3} /> : (e.business_name?.charAt(0) || e.name.charAt(0))}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-bold text-slate-800 dark:text-slate-100 truncate pr-6 text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                                        : 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400'
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
                                className="btn bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center gap-2"
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

            {/* Simple Create Modal reused or inline */}
            {isCreating && (
                <EntrepreneurModal onClose={() => setIsCreating(false)} onSave={async (data) => {
                    const created = await addFairEntrepreneur(data);
                    if (created) await assignEntrepreneurToFair(fairId, created.id);
                    setIsCreating(false);
                }} />
            )}
        </div>
    )
}

function FairSalesTracker({ fairId }) {
    const { fairs, fairAssignments, fairEntrepreneurs, fairSales, addFairSale, deleteFairSale } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEntId, setSelectedEntId] = useState(null);
    const [filter, setFilter] = useState('');
    const [isExpanded, setIsExpanded] = useState(true); // Default open or closed? User said "when I click they appear", maybe closed? Let's try true first as it's the active view.

    // Get current fair
    const fair = fairs?.find(f => f.id === fairId);

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

    // Sort and Filter logic
    const sortedParticipants = [...participants].sort((a, b) => (a.business_name || a.name).localeCompare(b.business_name || b.name));

    const filteredParticipants = sortedParticipants.filter(p => {
        const term = filter.toLowerCase();
        return (
            (p.business_name && p.business_name.toLowerCase().includes(term)) ||
            (p.name && p.name.toLowerCase().includes(term)) ||
            (p.category && p.category.toLowerCase().includes(term))
        );
    });

    // Calculate totals
    const totalRevenue = currentSales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const dailyRevenue = currentSales
        .filter(s => s.sale_date === selectedDate)
        .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 col-span-1 sm:col-span-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 font-bold text-xs uppercase tracking-wider mb-1">Recaudación Total</p>
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
                                className="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-2 text-slate-800 dark:text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${totalRevenue > 0 ? (dailyRevenue / totalRevenue) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Collapsible Sales Container */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
                {/* Header Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full flex items-center justify-between p-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors ${isExpanded ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                            <Store size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white text-left">
                            {fair?.name || 'Registro de Ventas'}
                        </h3>
                    </div>
                    <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} text-slate-400`}>
                        <ChevronRight size={20} className="rotate-90" /> {/* Using generic chevron that can rotate */}
                    </div>
                </button>

                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                    <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/30 dark:bg-slate-800/30">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">Participantes</h3>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700/50 px-3 py-1 rounded-lg whitespace-nowrap hidden sm:block">
                                {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none text-sm transition-all font-medium dark:text-white"
                                placeholder="Buscar emprendedor..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Desktop/Tablet Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Emprendedor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoría</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Venta Día</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acumulado</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                                {filteredParticipants.map(participant => {
                                    const daySale = currentSales.find(s => s.entrepreneur_id === participant.id && s.sale_date === selectedDate);
                                    const totalEntRevenue = currentSales.filter(s => s.entrepreneur_id === participant.id).reduce((sum, s) => sum + Number(s.amount), 0);

                                    return (
                                        <tr key={participant.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white">{participant.business_name || participant.name}</div>
                                                <div className="text-xs text-slate-500 text-pretty max-w-[200px]">{participant.name}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs font-medium">
                                                    {participant.category || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {daySale ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-lg">
                                                        ${Number(daySale.amount).toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm italic">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                                                ${totalEntRevenue.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {daySale ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 bg-slate-100 dark:bg-slate-800 transition-colors"
                                                            title="Editar monto"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => { setSelectedEntId(participant.id); setIsModalOpen(true); }}
                                                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                                                    >
                                                        Registrar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredParticipants.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                            {filter ? 'No se encontraron resultados para tu búsqueda.' : 'No hay participantes asignados para mostrar.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="md:hidden flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-900/50">
                        {filteredParticipants.map(participant => {
                            const daySale = currentSales.find(s => s.entrepreneur_id === participant.id && s.sale_date === selectedDate);
                            const totalEntRevenue = currentSales.filter(s => s.entrepreneur_id === participant.id).reduce((sum, s) => sum + Number(s.amount), 0);

                            return (
                                <div key={participant.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-4 relative overflow-hidden transition-all active:scale-[0.99] duration-200">
                                    {/* Status Strip if active sale */}
                                    {daySale && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>}

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
                                            {daySale ? (
                                                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                                    ${Number(daySale.amount).toFixed(2)}
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
                                                ${totalEntRevenue.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex-1 max-w-[160px]">
                                            {daySale ? (
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
                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
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
                        {filteredParticipants.length === 0 && (
                            <div className="px-6 py-12 text-center text-slate-500">
                                {filter ? 'No se encontraron resultados.' : 'No hay participantes asignados.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Register Sale Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Registrar Venta</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-6 text-center">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">
                                {participants.find(p => p.id === selectedEntId)?.business_name}
                            </p>
                            <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                                {new Date(selectedDate).toLocaleDateString()}
                            </p>
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
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto ($)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                                    <input
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        autoFocus
                                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-2xl font-bold text-slate-900 dark:text-white transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
                                Guardar Registro
                            </button>
                        </form>
                    </div>
                </div>
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
                        {fair ? <Edit size={20} className="text-indigo-500" /> : <Plus size={20} className="text-indigo-500" />}
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
                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Ej. Feria de Emprendimiento 2026"
                            autoFocus
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fecha</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Ubicación</label>
                            <input
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white"
                                value={form.location}
                                onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="Ej. Campus Central"
                            />
                        </div>
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95">Guardar Feria</button>
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
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-slate-900 rounded-3xl w-full max-w-5xl h-[85vh] shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-scale-in">

                {/* 1. Header - Fixed */}
                <div className="flex-none px-6 py-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center z-20">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400">
                                <Database size={24} />
                            </div>
                            Importar Emprendedores
                        </h3>
                        <p className="text-slate-400 text-sm mt-1 ml-1">Selecciona participantes de la base de datos global</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* 2. Filters - Fixed */}
                <div className="flex-none p-5 bg-slate-900 border-b border-slate-800 z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                placeholder="Buscar por nombre, ruc o categoría..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="w-full md:w-72">
                            <div className="relative">
                                <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <select
                                    className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white appearance-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all text-sm font-medium cursor-pointer"
                                    value={categoryFilter}
                                    onChange={e => setCategoryFilter(e.target.value)}
                                >
                                    <option value="">Todas las Categorías</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" />
                            </div>
                        </div>

                        {/* RUC Toggle Button */}
                        <button
                            onClick={() => setRucOnly(!rucOnly)}
                            className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border whitespace-nowrap ${rucOnly
                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                }`}
                        >
                            {rucOnly ? <Check size={18} strokeWidth={3} /> : <div className="w-4 h-4 rounded border-2 border-slate-600"></div>}
                            <span>Solo con RUC</span>
                        </button>
                    </div>
                </div>

                {/* 3. List - Flexible */}
                <div className="flex-1 overflow-y-auto min-h-0 bg-slate-950 p-4">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                                <Search size={32} className="opacity-50" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-400 mb-1">Sin resultados</h3>
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
                                            ? 'bg-indigo-900/20 border-indigo-500'
                                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                                            }`}
                                    >
                                        {/* Checkbox */}
                                        <div className={`w-6 h-6 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-transparent'
                                            }`}>
                                            {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`font-bold truncate text-base ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                    {e.nombre_emprendimiento || e.name || 'Sin Nombre'}
                                                </span>
                                                {hasRuc && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-500/20">
                                                        RUC
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-500 flex-wrap">
                                                <span className="flex items-center gap-1.5"><Users size={12} className="text-indigo-400" /> {e.persona_contacto || e.name}</span>
                                                {e.categoria_principal && (
                                                    <>
                                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                        <span className="text-slate-400 uppercase tracking-wider font-medium">{e.categoria_principal}</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Expanded Content */}
                                            {expandedIds.has(e.id) && (
                                                <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 text-sm text-slate-300 animate-fade-in block">
                                                    <p className="font-bold text-indigo-400 text-xs uppercase tracking-wider mb-1">Descripción / Actividad</p>
                                                    {e.actividad_economica || 'Sin descripción disponible.'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Button */}
                                        <button
                                            onClick={(event) => toggleExpansion(event, e.id)}
                                            className={`p-2 rounded-lg transition-colors ${expandedIds.has(e.id) ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
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
                <div className="flex-none px-6 py-5 border-t border-slate-800 bg-slate-900 z-20 flex justify-between items-center">
                    <div className="text-slate-400 text-sm font-medium">
                        {selectedIds.size > 0 ? (
                            <span className="text-indigo-400 font-bold">{selectedIds.size} emprendedores seleccionados</span>
                        ) : (
                            <span>Selecciona items de la lista</span>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                            Cancelar
                        </button>
                        <button
                            onClick={handleImport}
                            disabled={selectedIds.size === 0 || isImporting}
                            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2"
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

function EntrepreneurModal({ data, onClose, onSave }) {
    const [form, setForm] = useState({
        name: data?.name || '',
        business_name: data?.business_name || '',
        category: data?.category || '',
        phone: data?.phone || '',
        email: data?.email || ''
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
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {data ? 'Editar Emprendedor' : 'Nuevo Emprendedor'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label">Nombre Propietario</label>
                            <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="label">Nombre Comercial</label>
                            <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="label">Categoría</label>
                        <input className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-slate-900 dark:text-white" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ej. Artesanía, Gastronomía" />
                    </div>
                </div>
                <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
                    <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors">Cancelar</button>
                    <button onClick={() => onSave(form)} className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95">Guardar</button>
                </div>
            </div>
        </div>
    )
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
            <div className="relative bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with visual flair */}
                <div className="h-28 bg-gradient-to-br from-indigo-600 to-violet-700 relative shrink-0">
                    <button onClick={onClose} className="absolute top-3 right-3 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full backdrop-blur-md transition-colors z-10">
                        <X size={18} />
                    </button>
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                </div>

                <div className="px-6 pb-6 -mt-12 flex-1 overflow-y-auto">
                    {/* Avatar & Main Info */}
                    <div className="relative flex flex-col items-center text-center mb-6">
                        <div className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-indigo-600 dark:text-indigo-400 shadow-lg mb-3">
                            {participant.business_name?.charAt(0) || participant.name.charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight mb-1">
                            {participant.business_name || participant.name}
                        </h2>
                        {participant.business_name && (
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Users size={14} className="text-indigo-500" />
                                {participant.name}
                            </p>
                        )}
                        <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${isConfirmed
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>
                            {isConfirmed ? <Check size={12} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                            {isConfirmed ? 'Asistencia Confirmada' : 'Pendiente de Confirmación'}
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="space-y-4">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                                Información de Contacto
                            </h4>

                            <div className="space-y-4">
                                {participant.phone && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                                            <Phone size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Teléfono</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate select-all">{participant.phone}</p>
                                        </div>
                                        <a
                                            href={`https://wa.me/${participant.phone?.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5"
                                        >
                                            WhatsApp <ArrowLeft size={12} className="rotate-180" />
                                        </a>
                                    </div>
                                )}

                                {participant.email && (
                                    <div className="flex items-start gap-3 group">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                                            <Mail size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Correo Electrónico</p>
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate select-all">{participant.email}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                                        <Briefcase size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Categoría</p>
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{participant.category || 'Sin categoría'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        {(participant.activity || participant.displayActivity) && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Store size={14} /> Actividad / Descripción
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-pretty">
                                    {participant.activity || participant.displayActivity}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                    <button
                        onClick={() => {
                            const newStatus = isConfirmed ? 'pending' : 'confirmed';
                            updateFairAssignmentStatus(fairId, participant.id, newStatus);
                            if (!isConfirmed) onClose(); // Optional: close on confirm? Let's keep it open for feedback
                        }}
                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-sm ${isConfirmed
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
                            }`}
                    >
                        {isConfirmed ? (
                            <>
                                <X size={18} /> Cancelar Asistencia
                            </>
                        ) : (
                            <>
                                <Check size={18} strokeWidth={3} /> Confirmar Asistencia
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
const isPast = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
}
