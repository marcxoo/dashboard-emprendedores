import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MessageSquare, TrendingUp, DollarSign, Star, Calendar, Filter } from 'lucide-react';
import { getDateRangeFromWeek } from '../utils/dateUtils';

export default function SurveysDashboard() {
    const { assignments, isLoaded } = useData();

    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('all');
    const [selectedWeek, setSelectedWeek] = useState('all');

    // Helper to parse week string
    const parseWeekInfo = (weekStr) => {
        if (!weekStr) return { year: null, month: null };
        try {
            // Get year directly from string (YYYY-Wxx)
            const year = weekStr.split('-')[0];

            // Get month from date range
            const dateRange = getDateRangeFromWeek(weekStr); // Returns DD/MM/YYYY
            const month = dateRange.split('/')[1]; // Get MM

            return { year, month };
        } catch (e) {
            return { year: null, month: null };
        }
    };

    // Derived lists for dropdowns
    const { years, months, weeks } = useMemo(() => {
        if (!assignments) return { years: [], months: [], weeks: [] };

        const uniqueYears = new Set();
        const uniqueMonths = new Set();
        const uniqueWeeks = new Set();

        assignments.forEach(a => {
            const { year, month } = parseWeekInfo(a.semana);
            if (year) uniqueYears.add(year);

            // Logic for available months/weeks based on selection
            const yearMatch = selectedYear === 'all' || year === selectedYear;
            const monthMatch = selectedMonth === 'all' || month === selectedMonth;

            if (yearMatch) {
                if (month) uniqueMonths.add(month);
            }

            if (yearMatch && monthMatch) {
                uniqueWeeks.add(a.semana);
            }
        });

        return {
            years: Array.from(uniqueYears).sort().reverse(),
            months: Array.from(uniqueMonths).sort(),
            weeks: Array.from(uniqueWeeks).sort((a, b) => b.localeCompare(a))
        };
    }, [assignments, selectedYear, selectedMonth]);

    const stats = useMemo(() => {
        if (!assignments) return null;

        let filteredAssignments = assignments;

        // Apply filters
        if (selectedYear !== 'all') {
            filteredAssignments = filteredAssignments.filter(a => parseWeekInfo(a.semana).year === selectedYear);
        }
        if (selectedMonth !== 'all') {
            filteredAssignments = filteredAssignments.filter(a => parseWeekInfo(a.semana).month === selectedMonth);
        }
        if (selectedWeek !== 'all') {
            filteredAssignments = filteredAssignments.filter(a => a.semana === selectedWeek);
        }

        const surveys = filteredAssignments
            .filter(a => a.comentarios && a.comentarios.startsWith('[SURVEY]'))
            .map(a => {
                try {
                    const jsonStr = a.comentarios.replace('[SURVEY]', '');
                    return JSON.parse(jsonStr);
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);

        const total = surveys.length;
        if (total === 0) return null;

        // Experience Stats
        const expCounts = { 'Muy bien': 0, 'Bien': 0, 'Regular': 0, 'Mal': 0 };
        surveys.forEach(s => {
            if (expCounts[s.experience] !== undefined) expCounts[s.experience]++;
        });
        const expData = Object.entries(expCounts).map(([name, value]) => ({ name, value }));

        // Impact Stats
        const impactCounts = { 'Mucho': 0, 'Algo': 0, 'Poco': 0, 'Nada': 0 };
        surveys.forEach(s => {
            if (impactCounts[s.impact] !== undefined) impactCounts[s.impact]++;
        });
        const impactData = Object.entries(impactCounts).map(([name, value]) => ({ name, value }));

        // Sales Stats
        const totalSales = surveys.reduce((sum, s) => sum + (parseInt(s.sales) || 0), 0);
        const avgSales = Math.round(totalSales / total);

        return { total, expData, impactData, totalSales, avgSales };
    }, [assignments, selectedYear, selectedMonth, selectedWeek]);

    if (!isLoaded) return <div className="p-8 text-center text-slate-500">Cargando datos...</div>;

    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

    const monthNames = {
        '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
        '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
        '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header & Filter */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Resultados de Encuestas</h2>
                    <p className="text-slate-500">Análisis de satisfacción y ventas</p>
                </div>

                <div className="flex flex-wrap gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    {/* Year Filter */}
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => {
                                setSelectedYear(e.target.value);
                                setSelectedMonth('all'); // Reset child filters
                                setSelectedWeek('all');
                            }}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer shadow-sm appearance-none hover:border-primary-200 transition-colors min-w-[100px]"
                        >
                            <option value="all">Año</option>
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Month Filter */}
                    <div className="relative">
                        <select
                            value={selectedMonth}
                            onChange={(e) => {
                                setSelectedMonth(e.target.value);
                                setSelectedWeek('all'); // Reset child filter
                            }}
                            className={`pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer shadow-sm appearance-none hover:border-primary-200 transition-colors min-w-[120px] ${selectedYear === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={selectedYear === 'all'}
                        >
                            <option value="all">Mes</option>
                            {months.map(month => (
                                <option key={month} value={month}>{monthNames[month] || month}</option>
                            ))}
                        </select>
                        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Week Filter */}
                    <div className="relative">
                        <select
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-100 cursor-pointer shadow-sm appearance-none hover:border-primary-200 transition-colors min-w-[160px]"
                        >
                            <option value="all">Todas las semanas</option>
                            {weeks.map(week => (
                                <option key={week} value={week}>Semana {week}</option>
                            ))}
                        </select>
                        <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedWeek !== 'all') && (
                        <button
                            onClick={() => {
                                setSelectedYear('all');
                                setSelectedMonth('all');
                                setSelectedWeek('all');
                            }}
                            className="px-3 py-2 text-sm text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
                        >
                            Borrar filtros
                        </button>
                    )}
                </div>
            </div>

            {!stats ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100 shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No hay datos para esta selección</h3>
                    <p className="text-slate-500 max-w-sm mt-2">No se encontraron encuestas respondidas en el período seleccionado.</p>
                </div>
            ) : (
                <>
                    {/* Header Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{stats.total}</div>
                                <div className="text-sm font-medium text-slate-500">Respuestas Totales</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">${stats.totalSales.toLocaleString()}</div>
                                <div className="text-sm font-medium text-slate-500">Ventas Reportadas</div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">~${stats.avgSales.toLocaleString()}</div>
                                <div className="text-sm font-medium text-slate-500">Promedio Ventas / Stand</div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Experience Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Star className="text-yellow-500" size={20} /> Experiencia en Stand
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.expData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {stats.expData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Impact Chart */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-blue-500" size={20} /> Impacto en Ventas
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.impactData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#F8FAFC' }} />
                                        <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
