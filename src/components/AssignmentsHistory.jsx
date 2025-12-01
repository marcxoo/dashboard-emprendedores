
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EntrepreneurDetail from './EntrepreneurDetail';
import { getDateRangeFromWeek, sortWeeksDesc } from '../utils/dateUtils';
import { useData } from '../context/DataContext';
import { STANDS } from '../data/Database';
import { Trash2, Download, CheckCircle, XCircle, Clock, Calendar, AlertTriangle, FileText, X, Sparkles } from 'lucide-react';

// Modal Component for Attendance Observations
const AttendanceModal = ({ isOpen, onClose, onConfirm, entrepreneurName }) => {
    const [observation, setObservation] = useState('');

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-red-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                        <FileText size={20} /> Motivo de Inasistencia
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <p className="text-slate-600 mb-4 text-sm">
                        Por favor, indica el motivo por el cual <strong>{entrepreneurName}</strong> no asistió al stand asignado.
                    </p>

                    <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        placeholder="Escribe aquí el motivo (ej: Enfermedad, Calamidad doméstica, Sin aviso...)"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400 min-h-[120px]"
                        autoFocus
                    />
                </div>

                <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(observation)}
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                    >
                        Guardar Inasistencia
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default function AssignmentsHistory() {
    const { assignments, entrepreneurs, deleteAssignment, updateAssignmentAttendance, clearAllData, isLoaded } = useData();
    const [groupedHistory, setGroupedHistory] = useState({});
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'attended', 'not_attended', 'pending'

    // State for Attendance Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [viewingEntrepreneur, setViewingEntrepreneur] = useState(null);

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    useEffect(() => {
        if (!Array.isArray(assignments)) {
            setGroupedHistory({});
            return;
        }

        // Filter assignments based on status
        const filteredAssignments = assignments.filter(a => {
            if (filterStatus === 'all') return true;
            if (filterStatus === 'attended') return a.asistio === true;
            if (filterStatus === 'not_attended') return a.asistio === false;
            if (filterStatus === 'pending') return a.asistio === null || a.asistio === undefined;
            return true;
        });

        // Group by Week -> Block
        const grouped = filteredAssignments.reduce((acc, curr) => {
            const week = curr.semana;
            const block = curr.bloque || 'lunes-martes'; // Default for old data

            if (!acc[week]) acc[week] = {};
            if (!acc[week][block]) acc[week][block] = [];

            acc[week][block].push(curr);
            return acc;
        }, {});

        setGroupedHistory(grouped);
    }, [assignments, filterStatus]);

    const getEntrepreneurName = (id) => {
        if (!Array.isArray(entrepreneurs)) return 'Desconocido';
        const emp = entrepreneurs.find(e => e.id === id);
        return emp ? emp.nombre_emprendimiento : 'Desconocido';
    };

    const getEntrepreneurCategory = (id) => {
        if (!Array.isArray(entrepreneurs)) return '-';
        const emp = entrepreneurs.find(e => e.id === id);
        return emp ? emp.categoria_principal : '-';
    };

    const formatBlock = (block) => {
        if (!block) return '-';
        return block.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' - ');
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
                return `${startStr} al ${endStr} `;
            }
            return startStr;
        } catch (e) { return ''; }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación del historial?')) {
            deleteAssignment(id);
        }
    };

    const handleAttendanceClick = (assignment) => {
        if (assignment.asistio) {
            // If already attended, toggle to not attended (which opens modal) or just toggle off?
            // Logic: If currently YES, clicking means toggle to NO -> Open Modal
            setSelectedAssignment(assignment);
            setIsModalOpen(true);
        } else {
            // If currently NO, clicking means toggle to YES -> No modal needed, clear comments
            updateAssignmentAttendance(assignment.id_asignacion, true, '');
        }
    };

    // Correct logic: The button shows current state. Clicking it flips the state.
    // If currently "Asistió" (Green), user wants to mark "No Asistió" -> Open Modal.
    // If currently "No Asistió" (Red), user wants to mark "Asistió" -> Just do it.
    const handleAttendanceToggle = (assignment) => {
        if (assignment.asistio) {
            // Currently YES, switching to NO
            setSelectedAssignment(assignment);
            setIsModalOpen(true);
        } else {
            // Currently NO, switching to YES
            updateAssignmentAttendance(assignment.id_asignacion, true, '');
        }
    };

    const confirmAttendanceChange = (observation) => {
        if (selectedAssignment) {
            updateAssignmentAttendance(selectedAssignment.id_asignacion, false, observation);
            setIsModalOpen(false);
            setSelectedAssignment(null);
        }
    };

    const handleCardClick = (entrepreneurId) => {
        const emp = entrepreneurs.find(e => e.id === entrepreneurId);
        if (emp) {
            setViewingEntrepreneur(emp);
        }
    };

    const exportToCSV = () => {
        const rows = assignments.map(record => {
            const stand = STANDS.find(s => s.id === record.id_stand);
            const empName = getEntrepreneurName(record.id_emprendedor);
            const category = getEntrepreneurCategory(record.id_emprendedor);
            return [
                record.semana,
                formatBlock(record.bloque),
                record.jornada,
                stand?.name,
                empName,
                category,
                record.estado,
                record.asistio ? 'SI' : 'NO',
                record.comentarios || ''
            ].join(',');
        });
        const headers = ['Semana', 'Bloque', 'Jornada', 'Stand', 'Emprendedor', 'Categoría', 'Estado', 'Asistió', 'Observaciones'];
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "historial_asignaciones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sort weeks descending using robust comparator
    const sortedWeeks = sortWeeksDesc(Object.keys(groupedHistory));

    // Block order
    const blockOrder = ['lunes-martes', 'miercoles-jueves', 'viernes'];

    // Helper to render an assignment cell
    const AssignmentCell = ({ assignment }) => {
        if (!assignment) {
            return (
                <div className="h-full min-h-[140px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl p-4 transition-colors hover:border-slate-200 hover:bg-slate-50/50 group">
                    <Sparkles size={24} className="mb-2 opacity-50 group-hover:opacity-70 transition-opacity" />
                    <span className="text-xs font-medium italic">Disponible</span>
                </div>
            );
        }

        return (
            <div
                onClick={() => handleCardClick(assignment.id_emprendedor)}
                className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative group h-full flex flex-col min-h-[140px] cursor-pointer hover:border-primary-200"
            >
                {/* Header: Status & Delete */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-wrap gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${assignment.estado === 'Confirmado' ? 'bg-green-50 text-green-700 border-green-100' :
                            assignment.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            } `}>
                            {assignment.estado}
                        </span>

                        {(assignment.jornada === 'completa' || !assignment.jornada) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                                Jornada Completa
                            </span>
                        )}
                        {assignment.jornada === 'manana' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                                Matutina
                            </span>
                        )}
                        {assignment.jornada === 'tarde' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                                Vespertina
                            </span>
                        )}
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(assignment.id_asignacion); }}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar asignación"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Content: Name & Category */}
                <div className="mb-4">
                    <div className="font-bold text-slate-800 text-base leading-tight mb-1 line-clamp-2" title={getEntrepreneurName(assignment.id_emprendedor)}>
                        {getEntrepreneurName(assignment.id_emprendedor)}
                    </div>
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wide line-clamp-1" title={getEntrepreneurCategory(assignment.id_emprendedor)}>
                        {getEntrepreneurCategory(assignment.id_emprendedor)}
                    </div>
                </div>

                {/* Comments Warning */}
                {assignment.comentarios && assignment.comentarios !== 'Asignación manual' && !assignment.asistio && (
                    <div className="mb-3 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 italic flex items-start gap-1.5">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span className="line-clamp-2" title={assignment.comentarios}>"{assignment.comentarios}"</span>
                    </div>
                )}

                {/* Footer: Attendance Controls */}
                <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Asistencia</span>

                    {assignment.asistio === null || assignment.asistio === undefined ? (
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateAssignmentAttendance(assignment.id_asignacion, true, ''); }}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-green-600 hover:bg-green-50 hover:border-green-200 border border-transparent transition-all shadow-sm"
                                title="Marcar como Asistió"
                            >
                                <CheckCircle size={16} />
                            </button>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAttendanceToggle({ ...assignment, asistio: true }); }}
                                className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent transition-all shadow-sm"
                                title="Marcar como No Asistió"
                            >
                                <XCircle size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAttendanceToggle(assignment); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border ${assignment.asistio
                                ? 'bg-green-50 text-green-700 border-green-100 hover:bg-green-100'
                                : 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                                }`}
                        >
                            {assignment.asistio ? (
                                <><CheckCircle size={14} /> Asistió</>
                            ) : (
                                <><XCircle size={14} /> No Asistió</>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // Helper for Mobile Assignment Item
    const MobileAssignmentItem = ({ assignment, label }) => {
        if (!assignment) return null;

        return (
            <div
                onClick={() => handleCardClick(assignment.id_emprendedor)}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm active:scale-[0.99] transition-transform"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">{label}</span>
                        <div className="flex gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${assignment.estado === 'Confirmado' ? 'bg-green-50 text-green-700 border-green-100' :
                                assignment.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                    'bg-red-50 text-red-700 border-red-100'
                                } `}>
                                {assignment.estado}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                    <div className="font-bold text-slate-900 text-base mb-1">{getEntrepreneurName(assignment.id_emprendedor)}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{getEntrepreneurCategory(assignment.id_emprendedor)}</div>
                </div>

                {/* Warning */}
                {assignment.comentarios && assignment.comentarios !== 'Asignación manual' && !assignment.asistio && (
                    <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 italic flex items-start gap-2">
                        <AlertTriangle size={16} className="shrink-0" />
                        <span>"{assignment.comentarios}"</span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    {assignment.asistio === null || assignment.asistio === undefined ? (
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); updateAssignmentAttendance(assignment.id_asignacion, true, ''); }}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-all text-sm flex items-center gap-2 shadow-sm"
                            >
                                <CheckCircle size={16} /> Asistió
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleAttendanceToggle({ ...assignment, asistio: true }); }}
                                className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all text-sm flex items-center gap-2 shadow-sm"
                            >
                                <XCircle size={16} /> No Asistió
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleAttendanceToggle(assignment); }}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 shadow-sm border ${assignment.asistio
                                ? 'bg-green-50 text-green-700 border-green-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                                }`}
                        >
                            {assignment.asistio ? (
                                <><CheckCircle size={16} /> Asistió</>
                            ) : (
                                <><XCircle size={16} /> No Asistió</>
                            )}
                        </button>
                    )}

                    <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(assignment.id_asignacion); }}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all"
                        title="Eliminar"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
            <AttendanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={confirmAttendanceChange}
                entrepreneurName={selectedAssignment ? getEntrepreneurName(selectedAssignment.id_emprendedor) : ''}
            />

            <EntrepreneurDetail
                entrepreneur={viewingEntrepreneur}
                onClose={() => setViewingEntrepreneur(null)}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historial de Asignaciones</h1>
                    <p className="text-slate-500 mt-2 text-lg">Registro histórico de stands asignados</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que deseas borrar TODO el historial de asignaciones? Esta acción no se puede deshacer.')) {
                                clearAllData();
                            }
                        }}
                        className="btn bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 shadow-sm transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    >
                        <Trash2 size={18} /> Borrar Historial
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="btn bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    >
                        <Download size={18} /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-fit">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('attended')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'attended' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-green-600 hover:bg-slate-100'}`}
                >
                    <CheckCircle size={16} /> Asistieron
                </button>
                <button
                    onClick={() => setFilterStatus('not_attended')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'not_attended' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'}`}
                >
                    <XCircle size={16} /> No Asistieron
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filterStatus === 'pending' ? 'bg-white text-yellow-700 shadow-sm' : 'text-slate-500 hover:text-yellow-600 hover:bg-slate-100'}`}
                >
                    <Clock size={16} /> Pendientes
                </button>
            </div>

            {sortedWeeks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Calendar size={48} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No hay historial disponible</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Aún no se han generado asignaciones. Ve al Dashboard para generar la primera asignación de stands.
                    </p>
                </div>
            ) : (
                <div className="space-y-12">
                    {sortedWeeks.map(week => (
                        <div key={week} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-bold text-slate-800 bg-slate-100 px-4 py-2 rounded-lg inline-block border border-slate-200">
                                    Semana {week}
                                </h2>
                                <div className="h-px bg-slate-200 flex-1"></div>
                            </div>

                            {blockOrder.map(block => {
                                // Check if this block has ANY assignments
                                const blockAssignments = groupedHistory[week][block];
                                if (!blockAssignments || blockAssignments.length === 0) return null;

                                return (
                                    <div key={block} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-700">{formatBlock(block)}</h3>
                                                <p className="text-sm text-slate-500">{formatDateRange(week, block)}</p>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto hidden md:block">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-white border-b border-slate-100">
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Stand</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Matutina (08:30 - 12:30)</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Vespertina (13:00 - 16:30)</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {STANDS.map(stand => {
                                                        const standAssignments = blockAssignments.filter(a => a.id_stand === stand.id);
                                                        const fullDay = standAssignments.find(a => a.jornada === 'completa' || !a.jornada);
                                                        const morning = standAssignments.find(a => a.jornada === 'manana');
                                                        const afternoon = standAssignments.find(a => a.jornada === 'tarde');

                                                        return (
                                                            <tr key={stand.id} className="hover:bg-slate-50/30 transition-colors">
                                                                <td className="px-6 py-4">
                                                                    <div className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded text-sm inline-block whitespace-nowrap">
                                                                        {stand.name}
                                                                    </div>
                                                                </td>
                                                                {fullDay ? (
                                                                    <td colSpan={2} className="px-6 py-2">
                                                                        <AssignmentCell assignment={fullDay} />
                                                                    </td>
                                                                ) : (
                                                                    <>
                                                                        <td className="px-6 py-2">
                                                                            <AssignmentCell assignment={morning} />
                                                                        </td>
                                                                        <td className="px-6 py-2">
                                                                            <AssignmentCell assignment={afternoon} />
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card View - Grouped by Stand */}
                                        <div className="md:hidden divide-y divide-slate-100 border-t border-slate-100">
                                            {STANDS.map(stand => {
                                                const standAssignments = blockAssignments.filter(a => a.id_stand === stand.id);
                                                if (standAssignments.length === 0) return null;

                                                const fullDay = standAssignments.find(a => a.jornada === 'completa' || !a.jornada);
                                                const morning = standAssignments.find(a => a.jornada === 'manana');
                                                const afternoon = standAssignments.find(a => a.jornada === 'tarde');

                                                return (
                                                    <div key={stand.id} className="p-4">
                                                        <div className="mb-3">
                                                            <span className="font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded text-sm">
                                                                {stand.name}
                                                            </span>
                                                        </div>

                                                        <div className="space-y-3">
                                                            {fullDay ? (
                                                                <MobileAssignmentItem assignment={fullDay} label="Jornada Completa" />
                                                            ) : (
                                                                <>
                                                                    <MobileAssignmentItem assignment={morning} label="Matutina" />
                                                                    <MobileAssignmentItem assignment={afternoon} label="Vespertina" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div >
    );
}
