import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../context/DataContext';
import { STANDS } from '../data/Database';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Users from 'lucide-react/dist/esm/icons/users';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Edit from 'lucide-react/dist/esm/icons/edit';
import Sun from 'lucide-react/dist/esm/icons/sun';
import Sunset from 'lucide-react/dist/esm/icons/sunset';
import Search from 'lucide-react/dist/esm/icons/search';
import X from 'lucide-react/dist/esm/icons/x';
import Check from 'lucide-react/dist/esm/icons/check';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import CalendarDays from 'lucide-react/dist/esm/icons/calendar-days';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';

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
        return entrepreneurs.find(e => String(e.id) === String(id));
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

    const formatDateRange = (weekString, block) => {
        if (!weekString || !block) return '';
        try {
            // Support both new 'S' and old 'W' formats
            const parts = weekString.split(/-[SW]/);
            if (parts.length !== 2) return '';
            const [yearStr, weekStr] = parts;
            const year = parseInt(yearStr);
            const week = parseInt(weekStr);
            if (isNaN(year) || isNaN(week)) return '';

            // Calculate Monday of the ISO week
            const simple = new Date(year, 0, 1 + (week - 1) * 7);
            const dow = simple.getDay();
            const isoWeekStart = simple;
            if (dow <= 4)
                isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
            else
                isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());

            let startDate = new Date(isoWeekStart);
            let endDate = null;

            if (block === 'lunes-martes') {
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
            } else if (block === 'miercoles-jueves') {
                startDate.setDate(startDate.getDate() + 2);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 1);
            } else if (block === 'viernes') {
                startDate.setDate(startDate.getDate() + 4);
            }

            const options = { day: 'numeric', month: 'long' };
            const startStr = startDate.toLocaleDateString('es-ES', options);

            if (endDate) {
                const endStr = endDate.toLocaleDateString('es-ES', options);
                // Check if same month to shorten? e.g. 1 al 2 de diciembre
                return `${startStr} al ${endStr}`;
            }
            return startStr;
        } catch (e) { return ''; }
    };

    const formatBlockName = (block) => {
        if (!block) return '';
        return block.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' - ');
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 lg:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Resumen de actividad y gestión de stands</p>
                </div>
                <div className="flex flex-col w-full lg:w-auto gap-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 w-full">
                        <div className="glass-panel p-4 w-full lg:w-auto flex items-center gap-4 justify-between lg:justify-start bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Calendar size={20} />
                                <span className="font-medium">Fecha:</span>
                            </div>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border-none bg-transparent font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer p-0 dark:[color-scheme:dark]"
                            />
                            <div className="text-sm text-slate-400 border-l border-slate-300 dark:border-slate-600 pl-4">
                                Semana: {currentWeek}
                            </div>
                        </div>
                        <div className="hidden lg:block h-8 w-px bg-white/20"></div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-blue-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-inner">
                        <Users size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Emprendedores</div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                            {entrepreneurs.filter(e => e.veces_en_stand > 0).length}
                        </div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-primary-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-4 rounded-2xl bg-orange-50 dark:bg-slate-700/50 text-primary-600 dark:text-slate-300 shadow-inner">
                        <CalendarDays size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Stands Asignados</div>
                        <div className="text-2xl font-bold text-primary-600 dark:text-white mt-1">{stats.assigned} <span className="text-lg text-slate-400 font-normal">/ 6</span></div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-green-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                    <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Ganancia Semanal</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-white mt-1">${weeklyEarnings.toFixed(2)}</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-emerald-500 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-sm">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Ganancia Mensual</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-white mt-1">${monthlyEarnings.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Stands Grid */}
            <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
                        Distribución de Stands
                    </h2>
                    <div className="glass-panel px-4 py-2 flex items-center gap-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-lg">{formatBlockName(currentBlock)}</span>
                        <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{formatDateRange(currentWeek, currentBlock)}</span>
                    </div>
                </div>
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
                                    className={`flex-1 p-3 rounded-xl transition-all border-2 border-dashed ${selectedStandId === stand.id && selectedJornada === jornadaValue
                                        ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-900/20 ring-4 ring-primary-500/10 z-10'
                                        : isAssigned
                                            ? 'bg-white/60 dark:bg-slate-700/60 border-white/50 dark:border-slate-600/50 shadow-sm backdrop-blur-md'
                                            : 'bg-slate-50/40 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 hover:border-primary-300 dark:hover:border-primary-500/50 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer group/slot'
                                        }`}
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
                                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                {emp.nombre_emprendimiento.charAt(0)}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{emp.nombre_emprendimiento}</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.categoria_principal}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-10 flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm font-medium">
                                            + Disponible
                                        </div>
                                    )}
                                </div>
                            );
                        };

                        return (
                            <div key={stand.id} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-t-4 border-t-transparent hover:border-t-primary-500">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] font-black text-8xl select-none pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                                    {index + 1}
                                </div>

                                <div className="p-6 h-full flex flex-col relative z-10 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{stand.name}</h3>
                                            <span className="badge mt-1 cat-libre shadow-sm">{stand.category}</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
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
                standId={selectedStandId}
                standName={STANDS.find(s => s.id === selectedStandId)?.name}
            />
        </div >
    );
}

function EntrepreneurSelectionModal({ isOpen, onClose, onSelect, entrepreneurs, initialJornada, standId, standName }) {
    const [search, setSearch] = useState('');
    const [jornada, setJornada] = useState(initialJornada || 'completa');

    useEffect(() => {
        if (isOpen) {
            setJornada(initialJornada || 'completa');
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, initialJornada, onClose]);

    if (!isOpen) return null;

    const filtered = entrepreneurs.filter(e =>
        e.nombre_emprendimiento.toLowerCase().includes(search.toLowerCase()) ||
        e.persona_contacto.toLowerCase().includes(search.toLowerCase())
    );

    const getJornadaLabel = (j) => {
        if (j === 'manana') return 'Jornada Matutina';
        if (j === 'tarde') return 'Jornada Vespertina';
        return 'Jornada Completa';
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 z-10 relative">
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 uppercase tracking-wide">
                                Stand {standId}
                            </span>
                            <span className="text-xs text-slate-400 font-medium truncate">
                                {getJornadaLabel(jornada)}
                            </span>
                        </div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white tracking-tight truncate">
                            {standName && standName !== `Stand ${standId}` ? standName : 'Seleccionar Emprendedor'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-9 h-9 rounded-full transition-colors flex items-center justify-center flex-none"><X size={20} /></button>
                </div>

                <div className="p-4 border-b border-slate-100 dark:border-slate-700 space-y-4 bg-slate-50/50 dark:bg-slate-800/50">
                    {/* Shift Selector */}
                    <div className="flex gap-2 bg-slate-200/50 dark:bg-slate-700/50 p-1.5 rounded-xl">
                        <button
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${jornada === 'manana' ? 'bg-white dark:bg-slate-600 text-orange-600 dark:text-orange-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                            onClick={() => setJornada('manana')}
                        >
                            <Sun size={14} /> Matutina
                        </button>
                        <button
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${jornada === 'tarde' ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                            onClick={() => setJornada('tarde')}
                        >
                            <Sunset size={14} /> Vespertina
                        </button>
                        <button
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${jornada === 'completa' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-400 shadow-md transform scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-600/50'}`}
                            onClick={() => setJornada('completa')}
                        >
                            <Calendar size={14} /> Completa
                        </button>
                    </div>

                    <div className="relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors"><Search size={18} /></span>
                        <input
                            autoFocus
                            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400 text-sm shadow-sm"
                            placeholder="Buscar por nombre o emprendimiento..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-3 bg-white dark:bg-slate-800 space-y-2 custom-scrollbar">
                    {filtered.length > 0 ? (
                        filtered.map(e => (
                            <button
                                key={e.id}
                                onClick={() => onSelect(e, jornada)}
                                className="w-full text-left p-3 rounded-xl transition-all flex items-center gap-4 group border border-transparent hover:border-primary-200 dark:hover:border-primary-500/30 hover:bg-primary-50 dark:hover:bg-primary-900/10 active:scale-[0.99]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-lg group-hover:bg-white dark:group-hover:bg-slate-600 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0 shadow-sm border border-slate-200 dark:border-slate-600 group-hover:border-primary-100 dark:group-hover:border-primary-500/30">
                                    {e.nombre_emprendimiento.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-slate-800 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors truncate text-base">
                                        {e.nombre_emprendimiento}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{e.persona_contacto}</span>
                                        <span className="inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                            // Quick category styling helper inline
                                            'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                                            }`}>
                                            {e.categoria_principal}
                                        </span>
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 dark:text-slate-500">
                            <Search size={40} className="mb-3 opacity-20" />
                            <p className="font-medium">No se encontraron resultados</p>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-400">Mostrando {filtered.length} emprendedores</p>
                </div>
            </div>
        </div>,
        document.body
    );
}
