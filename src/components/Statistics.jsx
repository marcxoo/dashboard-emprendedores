import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Search, DollarSign, Calendar, Filter } from 'lucide-react';

export default function Statistics() {
    const { entrepreneurs, earnings, addEarning, deleteEarning, getAssignmentsByWeek } = useData();
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterWeek, setFilterWeek] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        entrepreneur_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Filter entrepreneurs based on selected date's week
    const availableEntrepreneurs = useMemo(() => {
        if (!formData.date) return [];
        const [year, month, day] = formData.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const week = getWeekNumberString(dateObj);
        const assignments = getAssignmentsByWeek(week);

        const assignedIds = new Set(assignments.map(a => a.id_emprendedor));

        return entrepreneurs.filter(e => assignedIds.has(e.id));
    }, [formData.date, entrepreneurs, getAssignmentsByWeek]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.entrepreneur_id || !formData.amount || !formData.date) return;

        const [y, m, d] = formData.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const week = getWeekNumberString(dateObj);
        const year = dateObj.getFullYear();

        const newEarning = {
            entrepreneur_id: formData.entrepreneur_id,
            amount: parseFloat(formData.amount),
            date: formData.date,
            week,
            year,
            notes: formData.notes
        };

        await addEarning(newEarning);
        setIsAdding(false);
        setFormData({
            entrepreneur_id: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            notes: ''
        });
    };

    const filteredEarnings = useMemo(() => {
        return earnings.filter(e => {
            const emp = entrepreneurs.find(emp => emp.id === e.entrepreneur_id);
            const empName = emp ? emp.nombre_emprendimiento.toLowerCase() : '';
            const matchesSearch = empName.includes(searchTerm.toLowerCase());
            const matchesWeek = filterWeek ? e.week === filterWeek : true;
            return matchesSearch && matchesWeek;
        });
    }, [earnings, entrepreneurs, searchTerm, filterWeek]);

    const totalEarnings = useMemo(() => {
        return filteredEarnings.reduce((sum, e) => sum + e.amount, 0);
    }, [filteredEarnings]);

    const uniqueWeeks = useMemo(() => {
        return [...new Set(earnings.map(e => e.week))].sort().reverse();
    }, [earnings]);

    return (
        <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-secondary tracking-tight">Estadísticas y Ganancias</h1>
                    <p className="text-slate-500 mt-2 text-lg">Control de ingresos por emprendedor</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="btn btn-primary px-5 py-2.5 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all active:scale-95 flex items-center gap-2 rounded-xl font-semibold"
                >
                    <Plus size={20} /> Registrar Ganancia
                </button>
            </div>

            {/* Stats Overview Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 flex items-center gap-5 border-l-4 border-l-green-500 hover:shadow-lg transition-all">
                    <div className="p-4 rounded-2xl bg-green-50 text-green-600 shadow-inner">
                        <DollarSign size={32} />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Total Registrado</div>
                        <div className="text-3xl font-bold text-secondary mt-1">${totalEarnings.toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* Add Earning Form */}
            {isAdding && (
                <div className="card p-6 bg-slate-50 border border-slate-200 animate-fade-in">
                    <h3 className="font-bold text-lg text-secondary mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-primary-500" /> Nuevo Registro
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="col-span-1 md:col-span-2 lg:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Emprendedor</label>
                            <select
                                className="input"
                                value={formData.entrepreneur_id}
                                onChange={e => setFormData({ ...formData, entrepreneur_id: parseInt(e.target.value) })}
                                required
                            >
                                <option value="">Seleccionar...</option>
                                {availableEntrepreneurs.map(e => (
                                    <option key={e.id} value={e.id}>{e.nombre_emprendimiento}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Monto ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex gap-2">
                            <button type="submit" className="btn btn-primary flex-1 justify-center">Guardar</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-ghost">Cancelar</button>
                        </div>
                        <div className="col-span-full">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Notas (Opcional)</label>
                            <input
                                className="input"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Detalles adicionales..."
                            />
                        </div>
                    </form>
                </div>
            )}

            {/* Filters & Table */}
            <div className="card bg-white shadow-xl shadow-slate-200/50 border-0 ring-1 ring-slate-100 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-4">
                    <div className="flex-1 min-w-[250px] relative group">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search size={20} /></span>
                        <input
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none transition-all"
                            placeholder="Buscar emprendedor..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative min-w-[200px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Filter size={18} /></span>
                        <select
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary-500 outline-none appearance-none cursor-pointer"
                            value={filterWeek}
                            onChange={e => setFilterWeek(e.target.value)}
                        >
                            <option value="">Todas las Semanas</option>
                            {uniqueWeeks.map(w => <option key={w} value={w}>{w}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Emprendedor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Semana</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Monto</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Notas</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredEarnings.length > 0 ? (
                                filteredEarnings.map((e) => {
                                    const emp = entrepreneurs.find(emp => emp.id === e.entrepreneur_id);
                                    return (
                                        <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={14} className="text-slate-400" />
                                                    {e.date}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-secondary">{emp?.nombre_emprendimiento || 'Desconocido'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    {e.week}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-green-600">
                                                ${e.amount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                                                {e.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('¿Eliminar este registro?')) deleteEarning(e.id);
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron registros
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getWeekNumberString(d) {
    const week = getWeekNumber(d);
    const year = d.getFullYear();
    return `${year}-W${week.toString().padStart(2, '0')}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}
