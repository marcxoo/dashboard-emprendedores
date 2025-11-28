import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { STANDS } from '../data/Database';

export default function AssignmentsHistory() {
    const { assignments, entrepreneurs, deleteAssignment, updateAssignmentAttendance, clearAllData, isLoaded } = useData();
    const [groupedHistory, setGroupedHistory] = useState({});

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    useEffect(() => {
        if (!Array.isArray(assignments)) {
            setGroupedHistory({});
            return;
        }

        // Group by Week -> Block
        const grouped = assignments.reduce((acc, curr) => {
            const week = curr.semana;
            const block = curr.bloque || 'lunes-martes'; // Default for old data

            if (!acc[week]) acc[week] = {};
            if (!acc[week][block]) acc[week][block] = [];

            acc[week][block].push(curr);
            return acc;
        }, {});

        setGroupedHistory(grouped);
    }, [assignments]);

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
            const parts = weekString.split('-W');
            if (parts.length !== 2) return '';
            const [yearStr, weekStr] = parts;
            const year = parseInt(yearStr);
            const week = parseInt(weekStr);
            if (isNaN(year) || isNaN(week)) return '';

            const jan4 = new Date(year, 0, 4);
            const dayOfJan4 = jan4.getDay() || 7;
            const mondayWeek1 = new Date(year, 0, 4 - dayOfJan4 + 1);
            const mondayCurrentWeek = new Date(mondayWeek1);
            mondayCurrentWeek.setDate(mondayWeek1.getDate() + (week - 1) * 7);

            let startDate = new Date(mondayCurrentWeek);
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
                return `${startStr} al ${endStr}`;
            }
            return startStr;
        } catch (e) { return ''; }
    };

    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta asignación del historial?')) {
            deleteAssignment(id);
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
                record.estado
            ].join(',');
        });
        const headers = ['Semana', 'Bloque', 'Jornada', 'Stand', 'Emprendedor', 'Categoría', 'Estado'];
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "historial_asignaciones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Sort weeks descending
    const sortedWeeks = Object.keys(groupedHistory).sort().reverse();

    // Block order
    const blockOrder = ['lunes-martes', 'miercoles-jueves', 'viernes'];

    // Helper to render an assignment cell
    const AssignmentCell = ({ assignment }) => {
        if (!assignment) {
            return (
                <div className="h-full flex items-center justify-center text-slate-300 text-xs italic border-2 border-dashed border-slate-100 rounded-lg p-2">
                    Disponible
                </div>
            );
        }

        return (
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow relative group h-full flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${assignment.estado === 'Confirmado' ? 'bg-green-50 text-green-700' :
                        assignment.estado === 'Pendiente' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-red-50 text-red-700'
                        }`}>
                        {assignment.estado}
                    </span>
                    <button
                        onClick={() => handleDelete(assignment.id_asignacion)}
                        className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                    >
                        🗑️
                    </button>
                </div>
                <div className="font-bold text-slate-800 text-sm mb-0.5 line-clamp-1" title={getEntrepreneurName(assignment.id_emprendedor)}>
                    {getEntrepreneurName(assignment.id_emprendedor)}
                </div>
                <div className="text-xs text-slate-500 line-clamp-1 mb-2" title={getEntrepreneurCategory(assignment.id_emprendedor)}>
                    {getEntrepreneurCategory(assignment.id_emprendedor)}
                </div>

                <div className="mt-auto pt-2 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Asistencia:</span>
                    <button
                        onClick={() => updateAssignmentAttendance(assignment.id_asignacion, !assignment.asistio)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full transition-all ${assignment.asistio
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                    >
                        {assignment.asistio ? '✅ ASISTIÓ' : '❌ NO ASISTIÓ'}
                    </button>
                </div>
            </div>
        );
    };

    // Helper for Mobile Assignment Item
    const MobileAssignmentItem = ({ assignment, label }) => {
        if (!assignment) return null;

        return (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">{label}</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${assignment.estado === 'Confirmado' ? 'bg-green-100 text-green-700' :
                        assignment.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {assignment.estado}
                    </span>
                </div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">{getEntrepreneurName(assignment.id_emprendedor)}</div>
                <div className="text-xs text-slate-500 mb-2">{getEntrepreneurCategory(assignment.id_emprendedor)}</div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                    <button
                        onClick={() => updateAssignmentAttendance(assignment.id_asignacion, !assignment.asistio)}
                        className={`text-xs font-bold px-2 py-1 rounded-md transition-all flex items-center gap-1 ${assignment.asistio
                            ? 'bg-green-100 text-green-700'
                            : 'bg-white border border-slate-200 text-slate-500'
                            }`}
                    >
                        {assignment.asistio ? '✅ Asistió' : '❌ No Asistió'}
                    </button>

                    <button
                        onClick={() => handleDelete(assignment.id_asignacion)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium flex items-center gap-1"
                    >
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in pb-20">
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
                        <span>🗑️</span> Borrar Historial
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="btn bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 shadow-sm transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl"
                    >
                        <span className="text-lg">📥</span> Exportar CSV
                    </button>
                </div>
            </div>

            {sortedWeeks.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <span className="text-4xl opacity-50">📅</span>
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
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Mañana (09:00 - 13:00)</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider w-1/2">Tarde (13:00 - 17:00)</th>
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
                                                                    <MobileAssignmentItem assignment={morning} label="Mañana" />
                                                                    <MobileAssignmentItem assignment={afternoon} label="Tarde" />
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
