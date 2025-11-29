import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { STANDS } from '../data/Database';
import { Trash2, Users, Calendar, Edit, Sun, Sunset, Search, X, Check, Loader2, CalendarDays, DollarSign } from 'lucide-react';

export default function Dashboard() {
    const {
        getAssignmentsByWeek,
        generateAssignments,
        entrepreneurs,
        earnings,
        clearAllData,
        setManualAssignment,
        removeAssignment,
        selectedDate,
        setSelectedDate,
        currentWeek,
        currentBlock,
        clearBlockAssignments
    } = useData();

    const [loading, setLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState({ total: 0, assigned: 0, participationRate: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [weeklyEarnings, setWeeklyEarnings] = useState(0);
    const [monthlyEarnings, setMonthlyEarnings] = useState(0);

    const [selectedStandId, setSelectedStandId] = useState(null);
    const [selectedJornada, setSelectedJornada] = useState('completa'); // 'manana', 'tarde', 'completa'

    useEffect(() => {
        if (currentWeek) {
            const weekAssignments = getAssignmentsByWeek(currentWeek);
            setAssignments(weekAssignments);

            // Calculate stats
            const totalSlots = STANDS.length * 3 * 2; // 3 blocks * 2 shifts (approx)

            // Count unique stands occupied in the current block
            const occupiedStands = new Set(
                weekAssignments
                    .filter(a => a.bloque === currentBlock || (!a.bloque && currentBlock === 'lunes-martes'))
                    .map(a => a.id_stand)
            ).size;

            setStats({
                total: totalSlots,
                assigned: occupiedStands,
                participationRate: 0 // Not used anymore
            });

            // Calculate Earnings
            const safeEarnings = Array.isArray(earnings) ? earnings : [];

            const currentWeekEarnings = safeEarnings
                .filter(e => e.week === currentWeek)
                .reduce((sum, e) => sum + e.amount, 0);
            setWeeklyEarnings(currentWeekEarnings);

            if (selectedDate) {
                const [year, month] = selectedDate.split('-').map(Number);
                const currentMonthEarnings = safeEarnings
                    .filter(e => {
                        if (!e.date) return false;
                        const eDate = new Date(e.date);
                        return eDate.getFullYear() === year && (eDate.getMonth() + 1) === month;
                    })
                    .reduce((sum, e) => sum + e.amount, 0);
                setMonthlyEarnings(currentMonthEarnings);
            }
        }
    }, [currentWeek, currentBlock, getAssignmentsByWeek, earnings, selectedDate]);

    const handleGenerate = () => {
        setLoading(true);
        setTimeout(() => {
            generateAssignments(currentWeek);
            setLoading(false);
        }, 500);
    };

    const getEntrepreneurDetails = (id) => {
        return entrepreneurs.find(e => e.id === id);
    };

    const handleStandClick = (standId, jornada = 'completa') => {
        setSelectedStandId(standId);
        setSelectedJornada(jornada);
        setIsModalOpen(true);
    };

    const handleManualSelect = (entrepreneur, jornada) => {
        setManualAssignment({
            id_stand: selectedStandId,
            id_emprendedor: entrepreneur.id,
            semana: currentWeek,
            estado: 'confirmado',
            comentarios: '',
            jornada: jornada,
            bloque: currentBlock
        });
        setIsModalOpen(false);
    };

    const handleRemoveAssignment = (standId, jornada) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación?')) {
            removeAssignment(standId, currentWeek, jornada, currentBlock);
        }
    };

    const getCategoryClass = (category) => {
        if (!category) return 'cat-libre';
        const cat = category.toLowerCase();
        if (cat.includes('alimento') || cat.includes('comida') || cat.includes('dulce') || cat.includes('postre') || cat.includes('pastel') || cat.includes('bebida') || cat.includes('chocolate') || cat.includes('miel') || cat.includes('granizado') || cat.includes('condimento') || cat.includes('snack')) return 'cat-alimentos';
        if (cat.includes('bisuter') || cat.includes('accesorio') || cat.includes('joya') || cat.includes('zapato') || cat.includes('ropa') || cat.includes('cosmetico') || cat.includes('belleza')) return 'cat-bisuteria';
        if (cat.includes('servicio') || cat.includes('salud') || cat.includes('limpieza') || cat.includes('vivero') || cat.includes('mercado') || cat.includes('profesional')) return 'cat-servicios';
        if (cat.includes('artesan') || cat.includes('manualidad') || cat.includes('arte') || cat.includes('detalle') || cat.includes('fiesta') || cat.includes('bazar') || cat.includes('anime') || cat.includes('regalo')) return 'cat-artesanias';
        if (cat.includes('tecnolog') || cat.includes('celular') || cat.includes('comput')) return 'cat-tecnologia';
        return 'cat-libre';
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-secondary tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 mt-2 text-lg">Resumen de actividad y gestión de stands</p>
                </div>
                <div className="flex flex-col w-full lg:w-auto gap-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
                        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full lg:w-auto justify-between lg:justify-start">
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar size={20} />
                                <span className="font-medium">Fecha:</span>
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border-none bg-transparent font-bold text-slate-800 focus:ring-0 cursor-pointer"
                            />
                            <div className="text-sm text-slate-400 border-l pl-4">
                                Semana: {currentWeek}
                            </div>
                        </div>
                        <div className="hidden lg:block h-8 w-px bg-slate-200"></div>
                        <button
                            className="btn btn-primary px-6 py-4 lg:py-2.5 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all active:scale-95 w-full lg:w-auto justify-center"
                            onClick={handleGenerate}
                            disabled={loading || assignments.length > 0}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="animate-spin h-4 w-4 text-white" />
                                    Generando...
                                </span>
                            ) : assignments.length > 0 ? (
                                <span className="flex items-center gap-2">
                                    <Check size={16} /> Asignación Completa
                                </span>
                            ) : (
                                'Generar Asignación'
                            )}
                        </button>
                    </div>
                    <button
                        className="btn bg-red-50 text-red-600 hover:bg-red-100 px-4 py-3 lg:py-2.5 rounded-lg font-medium transition-all active:scale-95 border border-red-100 w-full lg:w-auto flex justify-center items-center gap-2"
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas reiniciar las asignaciones PARA ESTOS DÍAS? Esto borrará solo las asignaciones visibles actualmente.')) {
                                clearBlockAssignments(currentWeek, currentBlock);
                            }
                        }}
                    >
                        <Trash2 size={18} /> Reiniciar Días
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4 rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
                        <Users size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Emprendedores</div>
                        <div className="text-2xl font-bold text-secondary mt-1">
                            {entrepreneurs.filter(e => e.veces_en_stand > 0).length}
                        </div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-secondary-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4 rounded-2xl bg-secondary-50 text-secondary-600 shadow-inner">
                        <CalendarDays size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Stands Asignados</div>
                        <div className="text-2xl font-bold text-secondary mt-1">{stats.assigned} <span className="text-lg text-slate-400 font-normal">/ 6</span></div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4 rounded-2xl bg-green-50 text-green-600 shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ganancia Semanal</div>
                        <div className="text-2xl font-bold text-secondary mt-1">${weeklyEarnings.toFixed(2)}</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Ganancia Mensual</div>
                        <div className="text-2xl font-bold text-secondary mt-1">${monthlyEarnings.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Stands Grid */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
                    Distribución de Stands
                </h2>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(340px,1fr))]">
                    {STANDS.map((stand, index) => {
                        const standAssignments = assignments.filter(a =>
                            a.id_stand === stand.id &&
                            (a.bloque === currentBlock || (!a.bloque && currentBlock === 'lunes-martes')) // Backward compatibility for old data
                        );

                        // Check for full day assignment
                        const fullDay = standAssignments.find(a => a.jornada === 'completa' || !a.jornada);
                        const morning = standAssignments.find(a => a.jornada === 'manana');
                        const afternoon = standAssignments.find(a => a.jornada === 'tarde');

                        // Helper to render a slot
                        const renderSlot = (assignment, jornadaLabel, jornadaValue) => {
                            const emp = assignment ? getEntrepreneurDetails(assignment.id_emprendedor) : null;
                            const isAssigned = !!assignment;

                            return (
                                <div
                                    className={`flex-1 p-3 rounded-xl transition-all border-2 border-dashed ${isAssigned ? 'bg-white border-transparent shadow-sm' : 'bg-slate-50 border-slate-200 hover:border-primary-300 hover:bg-primary-50 cursor-pointer group/slot'}`}
                                    onClick={(e) => {
                                        if (!isAssigned) {
                                            e.stopPropagation();
                                            handleStandClick(stand.id, jornadaValue);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{jornadaLabel}</span>
                                        <div className="flex gap-1">
                                            {isAssigned && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveAssignment(stand.id, jornadaValue); }}
                                                    className="p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Eliminar asignación"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleStandClick(stand.id, jornadaValue); }}
                                                className={`p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-primary-600 transition-colors ${isAssigned ? 'opacity-100' : 'opacity-0 group-hover/slot:opacity-100'}`}
                                                title="Editar asignación"
                                            >
                                                <Edit size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {isAssigned && emp ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                                {emp.nombre_emprendimiento.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-secondary text-sm truncate">{emp.nombre_emprendimiento}</div>
                                                <div className="text-xs text-slate-500 truncate">{emp.categoria_principal}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-10 flex items-center justify-center text-slate-400 text-sm font-medium">
                                            + Disponible
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        return (
                            <div key={stand.id} className="card relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 border-t-transparent hover:border-t-primary-500">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] font-black text-8xl select-none pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                                    {index + 1}
                                </div>

                                <div className="p-6 h-full flex flex-col relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 group-hover:text-primary-600 transition-colors">{stand.name}</h3>
                                            <span className="badge mt-1 cat-libre shadow-sm">{stand.category}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                            #{stand.id}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {fullDay ? (
                                            renderSlot(fullDay, 'Jornada Completa (08:30 - 16:30)', 'completa')
                                        ) : (
                                            <>
                                                {renderSlot(morning, 'Matutina (08:30 - 12:30)', 'manana')}
                                                {renderSlot(afternoon, 'Vespertina (13:00 - 16:30)', 'tarde')}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <EntrepreneurSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleManualSelect}
                entrepreneurs={entrepreneurs}
                initialJornada={selectedJornada}
            />
        </div >
    );
}

function EntrepreneurSelectionModal({ isOpen, onClose, onSelect, entrepreneurs, initialJornada }) {
    const [search, setSearch] = useState('');
    const [jornada, setJornada] = useState(initialJornada || 'completa');

    useEffect(() => {
        if (isOpen) {
            setJornada(initialJornada || 'completa');
        }
    }, [isOpen, initialJornada]);

    if (!isOpen) return null;

    const filtered = entrepreneurs.filter(e =>
        e.nombre_emprendimiento.toLowerCase().includes(search.toLowerCase()) ||
        e.persona_contacto.toLowerCase().includes(search.toLowerCase())
    );

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">Seleccionar Emprendedor</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 w-8 h-8 rounded-full transition-colors flex items-center justify-center"><X size={20} /></button>
                </div>
                <div className="p-4 border-b border-slate-100 space-y-3">
                    {/* Shift Selector */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${jornada === 'manana' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setJornada('manana')}
                        >
                            <Sun size={16} /> Matutina
                        </button>
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${jornada === 'tarde' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setJornada('tarde')}
                        >
                            <Sunset size={16} /> Vespertina
                        </button>
                        <button
                            className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${jornada === 'completa' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setJornada('completa')}
                        >
                            <Calendar size={16} /> Completa
                        </button>
                    </div>

                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={18} /></span>
                        <input
                            autoFocus
                            className="input w-full pl-10"
                            placeholder="Buscar por nombre o emprendimiento..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    {filtered.length > 0 ? (
                        filtered.map(e => (
                            <button
                                key={e.id}
                                onClick={() => onSelect(e, jornada)}
                                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-colors flex items-center gap-3 group border border-transparent hover:border-slate-100"
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shrink-0">
                                    {e.nombre_emprendimiento.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-secondary truncate">{e.nombre_emprendimiento}</div>
                                    <div className="text-xs text-slate-500 truncate">{e.persona_contacto} • {e.categoria_principal}</div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-400">
                            No se encontraron resultados
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
