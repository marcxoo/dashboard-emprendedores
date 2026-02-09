import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import Share2 from 'lucide-react/dist/esm/icons/share-2';
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Users from 'lucide-react/dist/esm/icons/users';
import Briefcase from 'lucide-react/dist/esm/icons/briefcase';
import Plus from 'lucide-react/dist/esm/icons/plus';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Search from 'lucide-react/dist/esm/icons/search';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Edit from 'lucide-react/dist/esm/icons/pencil';
import X from 'lucide-react/dist/esm/icons/x';
import Check from 'lucide-react/dist/esm/icons/check';
import Filter from 'lucide-react/dist/esm/icons/filter';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Store from 'lucide-react/dist/esm/icons/store';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Database from 'lucide-react/dist/esm/icons/database';
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import Download from 'lucide-react/dist/esm/icons/download';
import ArrowUpDown from 'lucide-react/dist/esm/icons/arrow-up-down';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';
import ArrowDown from 'lucide-react/dist/esm/icons/arrow-down';
import UserPlus from 'lucide-react/dist/esm/icons/user-plus';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Tag from 'lucide-react/dist/esm/icons/tag';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import List from 'lucide-react/dist/esm/icons/list';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Globe from 'lucide-react/dist/esm/icons/globe';
import FileSpreadsheet from 'lucide-react/dist/esm/icons/file-spreadsheet';
import { useData } from '../context/DataContext';
import { EntrepreneurModal } from './EntrepreneursList';
import { ShineBorder } from './ui/ShineBorder';
import { CategoryDetailsModal } from './CategoryDetailsModal';
// XLSX is lazy-loaded when needed for exports
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';

// Helper to convert fair name to URL slug
function toSlug(name) {
    return (name || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function FairsDashboard() {
    return (
        <Routes>
            <Route index element={<FairsOverviewPage />} />
            <Route path=":fairSlug/*" element={<FairDetailsPage />} />
        </Routes>
    );
}

// Wrapper that renders FairsOverview inside the page layout
function FairsOverviewPage() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
                <FairsOverview onSelect={(fair) => navigate(`/ferias/${toSlug(fair.name)}`)} />
            </div>
        </div>
    );
}

// Wrapper that reads fairSlug from URL params and renders FairDetails
function FairDetailsPage() {
    const { fairSlug } = useParams();
    const { fairs } = useData();
    const navigate = useNavigate();
    const selectedFair = fairs.find(f => toSlug(f.name) === fairSlug);

    if (!selectedFair) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Feria no encontrada</p>
                    <button onClick={() => navigate('/ferias')} className="mt-4 text-primary-600 hover:underline">Volver a Ferias</button>
                </div>
            </div>
        );
    }

    return <FairDetails fair={selectedFair} onBack={() => navigate('/ferias')} />;
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
        <div className="space-y-6 sm:space-y-10">
            {/* Hero Header - Mobile Optimized */}
            <div className="relative rounded-2xl sm:rounded-[2.5rem] bg-[#0b2e43] p-5 sm:p-8 md:p-12 overflow-hidden shadow-2xl isolate border border-white/5">
                {/* Dynamic Background Effects */}
                <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#ff7900] opacity-15 blur-[80px] sm:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-[#0ea5e9] opacity-10 blur-[60px] sm:blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

                <div className="relative z-10 flex flex-col gap-5 sm:gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-8">
                        <div className="max-w-2xl">
                            <button
                                onClick={() => navigate('/portal')}
                                className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 sm:mb-6 transition-colors font-medium group"
                            >
                                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <span className="text-xs sm:text-sm tracking-wide">Volver al Portal</span>
                            </button>

                            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-2 sm:mb-4">
                                Gestión de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff7900] to-[#fb923c]">Ferias</span>
                            </h1>
                            <p className="text-sm sm:text-lg text-slate-300 font-medium leading-relaxed max-w-lg hidden sm:block">
                                Administra tus eventos, designa emprendedores y lleva el control financiero con precisión.
                            </p>
                        </div>

                        {/* Desktop Button */}
                        <button
                            onClick={() => setIsEditing(true)}
                            className="hidden sm:flex group bg-white text-[#0b2e43] pl-2 pr-8 py-2 rounded-full font-bold items-center gap-4 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 active:scale-95"
                        >
                            <div className="bg-[#ff7900] w-12 h-12 rounded-full flex items-center justify-center text-white group-hover:rotate-90 transition-transform duration-500 shadow-lg">
                                <Plus size={26} strokeWidth={3} />
                            </div>
                            <span className="text-lg tracking-tight">Nueva Feria</span>
                        </button>
                    </div>

                    {/* Mobile Full-width Button */}
                    <button
                        onClick={() => setIsEditing(true)}
                        className="sm:hidden w-full bg-gradient-to-r from-[#ff7900] to-[#fb923c] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] transition-transform"
                    >
                        <Plus size={22} strokeWidth={3} />
                        <span className="text-base">Nueva Feria</span>
                    </button>
                </div>
            </div>

            {/* List Grid - Mobile optimized gap */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {(fairs || []).map(fair => {
                    const stats = getFairStats(fair.id);
                    const isFinished = isPast(fair.date);

                    return (
                        <div key={fair.id} onClick={() => onSelect(fair)} className="group relative cursor-pointer h-full active:scale-[0.98] transition-transform">
                            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-xl sm:rounded-[2rem] opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-[1.9rem] p-4 sm:p-6 border border-slate-200 dark:border-slate-800 relative h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1">

                                {/* Status Badge */}
                                <div className="flex justify-between items-start mb-4 sm:mb-6">
                                    <div className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isFinished
                                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                                        }`}>
                                        <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isFinished ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'}`}></div>
                                        {isFinished ? 'Finalizada' : 'Activa'}
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setCurrentFair(fair); setIsEditing(true); }}
                                        className="p-2.5 sm:p-2 -mr-1 sm:-mr-2 -mt-1 sm:-mt-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>

                                {/* Icon & Title */}
                                <div className="mb-4 sm:mb-6">
                                    <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 ${isFinished ? 'bg-slate-400 dark:bg-slate-700' : 'bg-gradient-to-br from-primary-500 to-primary-600'
                                        }`}>
                                        <Store size={24} className="sm:w-8 sm:h-8" />
                                    </div>
                                    <h3 className="font-bold text-lg sm:text-2xl text-slate-900 dark:text-white leading-tight mb-1.5 sm:mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                        {fair.name}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <MapPin size={14} className="sm:w-4 sm:h-4 text-secondary-500 shrink-0" />
                                        <span className="truncate">{fair.location || 'Ubicación pendiente'}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-3 sm:mb-4"></div>

                                {/* Footer Stats */}
                                <div className="mt-auto grid grid-cols-2 gap-2 sm:gap-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1">FECHA</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {fair.end_date && fair.end_date !== fair.date
                                                ? `${new Date(fair.date + 'T12:00:00').getDate()}-${new Date(fair.end_date + 'T12:00:00').getDate()} ${new Date(fair.date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short' })}`
                                                : new Date(fair.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                                            }
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-0.5 sm:mb-1">EMPRENDEDORES</p>
                                        <div className="flex items-center gap-1.5">
                                            <Users size={12} className="sm:w-3.5 sm:h-3.5 text-primary-500" />
                                            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{stats.count}</p>
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
    const navigate = useNavigate();
    const location = useLocation();

    // Derive activeTab from URL: /ferias/:id/analiticas -> 'analiticas'
    const activeTab = useMemo(() => {
        const segments = location.pathname.split('/').filter(Boolean);
        // segments: ['ferias', ':fairId', 'analiticas']
        return segments[2] || 'analiticas';
    }, [location.pathname]);

    const handleTabChange = (tab) => {
        navigate(`/ferias/${toSlug(fair.name)}/${tab}`);
    };

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
                            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl gap-1 overflow-x-auto">
                                <button
                                    onClick={() => handleTabChange('analiticas')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${activeTab === 'analiticas'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <LayoutDashboard size={18} /> Resumen
                                </button>
                                <button
                                    onClick={() => handleTabChange('participantes')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${activeTab === 'participantes'
                                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                                        }`}
                                >
                                    <Users size={18} /> Participantes
                                </button>
                                <button
                                    onClick={() => handleTabChange('ventas')}
                                    className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all duration-200 whitespace-nowrap ${activeTab === 'ventas'
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
                {activeTab === 'analiticas' ? <FairAnalytics fair={fair} /> : null}
                {activeTab === 'participantes' ? <FairParticipants fairId={fair.id} /> : null}
                {activeTab === 'ventas' ? <FairSalesTracker fairId={fair.id} /> : null}
            </div>
        </div>
    )
}

function FairAnalytics({ fair }) {
    const { fairSales, fairAssignments, fairEntrepreneurs, entrepreneurs } = useData();
    const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

    // -- Data Processing --

    // 1. Sales Data
    const currentSales = (fairSales || []).filter(s => s.fair_id === fair.id);
    const totalRevenue = currentSales.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalSalesCount = currentSales.length;
    const averageTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    // 2. Participants Data
    const currentAssignments = (fairAssignments || []).filter(a => a.fair_id === fair.id && a.status === 'confirmed');
    const participantsCount = currentAssignments.length;

    // -- Color Palette & Consistency Logic --
    const categoryColorMap = useMemo(() => {
        const uniqueCategories = new Set();
        (fairEntrepreneurs || []).forEach(e => {
            if (e.category) uniqueCategories.add(e.category.trim());
        });

        const map = new Map();
        // Premium Palette: Blue, Purple, Emerald, Amber, Red, Pink, Cyan, Lime, Indigo, Orange
        const palette = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16', '#6366f1', '#f97316'];

        Array.from(uniqueCategories).sort().forEach((cat, index) => {
            map.set(cat, palette[index % palette.length]);
        });

        // Default fallbacks
        map.set('Sin Categoría', '#94a3b8');
        map.set('Otros', '#64748b');

        return map;
    }, [fairEntrepreneurs]);

    const getColor = (cat) => categoryColorMap.get((cat || '').trim()) || '#94a3b8';

    // 3. Top Entrepreneurs Logic (Updated with Colors)
    const salesByEntrepreneur = useMemo(() => {
        const map = new Map();

        currentSales.forEach(sale => {
            const current = map.get(sale.entrepreneur_id) || 0;
            map.set(sale.entrepreneur_id, current + Number(sale.amount));
        });

        const result = [];
        map.forEach((amount, id) => {
            const ent = fairEntrepreneurs.find(e => e.id === id);
            if (ent) {
                const category = ent.category || 'Sin Categoría';
                result.push({
                    name: ent.business_name || ent.name,
                    amount,
                    id,
                    category,
                    fill: getColor(category)
                });
            }
        });

        return result.sort((a, b) => b.amount - a.amount).slice(0, 5); // Top 5
    }, [currentSales, fairEntrepreneurs, categoryColorMap]);

    // 4. Sales by Category Logic (Updated with Colors)
    const salesByCategory = useMemo(() => {
        const catMap = new Map();

        currentSales.forEach(sale => {
            const ent = fairEntrepreneurs.find(e => e.id === sale.entrepreneur_id);
            const category = ent?.category || 'Sin Categoría';
            const current = catMap.get(category) || 0;
            catMap.set(category, current + Number(sale.amount));
        });

        const sorted = Array.from(catMap.entries())
            .map(([name, value]) => ({
                name,
                value,
                fill: getColor(name)
            }))
            .sort((a, b) => b.value - a.value);

        // Group smaller categories if we have too many
        if (sorted.length > 6) {
            const top = sorted.slice(0, 5);
            const others = sorted.slice(5);
            const othersValue = others.reduce((acc, curr) => acc + curr.value, 0);

            if (othersValue > 0) {
                top.push({ name: 'Otros', value: othersValue, fill: '#64748b' });
            }
            return top;
        }

        return sorted;
    }, [currentSales, fairEntrepreneurs, categoryColorMap]);

    // 5. Daily Sales Trend
    // Aggregate by date
    const dailyTrend = useMemo(() => {
        const dateMap = new Map();

        currentSales.forEach(sale => {
            const date = sale.sale_date; // YYYY-MM-DD
            if (date) {
                const current = dateMap.get(date) || 0;
                dateMap.set(date, current + Number(sale.amount));
            }
        });

        // Sort by date
        return Array.from(dateMap.entries())
            .map(([date, amount]) => ({
                date,
                formattedDate: new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                amount
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [currentSales]);


    // 6. Detailed Category Performance
    const categoryPerformance = useMemo(() => {
        const stats = new Map();

        currentSales.forEach(sale => {
            const ent = fairEntrepreneurs.find(e => e.id === sale.entrepreneur_id);
            const category = ent?.category || 'Sin Categoría';

            if (!stats.has(category)) {
                stats.set(category, { name: category, revenue: 0, count: 0 });
            }

            const catStat = stats.get(category);
            catStat.revenue += Number(sale.amount);
            catStat.count += 1;
        });

        return Array.from(stats.values())
            .map(stat => ({
                ...stat,
                avgTicket: stat.count > 0 ? stat.revenue / stat.count : 0,
                percentage: totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0,
                fill: getColor(stat.name)
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [currentSales, fairEntrepreneurs, totalRevenue, categoryColorMap]);

    // 7. Entrepreneur Performance (Full List for Table)
    const entrepreneurPerformance = useMemo(() => {
        const stats = new Map();

        currentSales.forEach(sale => {
            const entId = sale.entrepreneur_id;
            if (!stats.has(entId)) {
                const ent = fairEntrepreneurs.find(e => e.id === entId);
                const category = ent?.category || 'N/A';
                stats.set(entId, {
                    id: entId,
                    name: ent?.business_name || ent?.name || 'Desconocido',
                    category: category,
                    fill: getColor(category),
                    revenue: 0,
                    count: 0
                });
            }

            const entStat = stats.get(entId);
            entStat.revenue += Number(sale.amount);
            entStat.count += 1;
        });

        return Array.from(stats.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10); // Show top 10 in the detailed list
    }, [currentSales, fairEntrepreneurs, categoryColorMap]);

    // 8. City Performance Logic
    // 8. City Performance Logic
    const cityPerformance = useMemo(() => {
        const stats = new Map();

        currentSales.forEach(sale => {
            const ent = fairEntrepreneurs.find(e => e.id === sale.entrepreneur_id);

            // Try to find city in the fair entrepreneur record, or fallback to main list
            let city = (ent?.ciudad || '').trim().toUpperCase(); // Normalize to uppercase

            if (!city && ent) {
                const mainEnt = entrepreneurs.find(me =>
                    (me.nombre_emprendimiento && me.nombre_emprendimiento === ent.business_name) ||
                    (me.persona_contacto && me.persona_contacto === ent.name)
                );
                if (mainEnt) city = (mainEnt.ciudad || '').trim().toUpperCase(); // Normalize
            }

            if (!city) city = 'NO REGISTRADA';

            if (!stats.has(city)) {
                stats.set(city, { name: city, revenue: 0, count: 0 });
            }

            const cityStat = stats.get(city);
            cityStat.revenue += Number(sale.amount);
            cityStat.count += 1;
        });

        return Array.from(stats.values())
            .map(stat => ({
                ...stat,
                percentage: totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [currentSales, fairEntrepreneurs, totalRevenue, entrepreneurs]);

    // Handle Export for Report
    const handleDownloadReport = async () => {
        // Lazy-load XLSX only when needed
        const XLSX = await import('xlsx');
        // Create workbook
        const wb = XLSX.utils.book_new();

        // ===== Sheet 1: RESUMEN GENERAL =====
        const summaryData = [
            ['REPORTE COMPLETO DE FERIA'],
            [],
            ['INFORMACIÓN DE LA FERIA'],
            ['Nombre', fair.name],
            ['Ubicación', fair.location || 'No especificada'],
            ['Fecha Inicio', fair.date ? new Date(fair.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'],
            ['Fecha Fin', fair.end_date ? new Date(fair.end_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'],
            ['Estado', fair.end_date && new Date(fair.end_date) < new Date() ? 'Finalizada' : 'Activa'],
            [],
            ['INDICADORES CLAVE'],
            ['Recaudación Total', `$${totalRevenue.toLocaleString()}`],
            ['Total Participantes', participantsCount],
            ['Registros de Venta', totalSalesCount],
            ['Ticket Promedio', `$${averageTicket.toFixed(2)}`],
            [],
            ['Fecha de generación', new Date().toLocaleString('es-ES')]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 25 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');

        // ===== Sheet 2: CATEGORÍAS =====
        const categoryData = [
            ['RENDIMIENTO POR CATEGORÍA'],
            [],
            ['Categoría', 'Ingresos ($)', '% del Total', 'Transacciones', 'Ticket Promedio ($)'],
            ...categoryPerformance.map(e => [
                e.name,
                e.revenue,
                `${e.percentage.toFixed(1)}%`,
                e.count,
                Number(e.avgTicket.toFixed(2))
            ])
        ];
        const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
        wsCategories['!cols'] = [
            { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(wb, wsCategories, 'Categorías');

        // ===== Sheet 3: CIUDADES =====
        const cityData = [
            ['RENDIMIENTO POR CIUDAD'],
            [],
            ['Ciudad', 'Ingresos ($)', '% del Total', 'N° Ventas'],
            ...cityPerformance.map(e => [
                e.name,
                e.revenue,
                `${e.percentage.toFixed(1)}%`,
                e.count
            ])
        ];
        const wsCities = XLSX.utils.aoa_to_sheet(cityData);
        wsCities['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, wsCities, 'Ciudades');

        // ===== Sheet 4: TOP EMPRENDEDORES =====
        const entrepreneurData = [
            ['TOP EMPRENDEDORES POR VENTAS'],
            [],
            ['#', 'Emprendimiento', 'Propietario', 'Categoría', 'Ciudad', 'Teléfono', 'Ventas ($)', 'N° Registros'],
            ...entrepreneurPerformance.map((e, i) => {
                const ent = fairEntrepreneurs.find(fe => fe.id === e.id);
                return [
                    i + 1,
                    e.name,
                    ent?.name || 'N/A',
                    e.category,
                    ent?.ciudad || 'N/A',
                    ent?.phone || 'N/A',
                    e.revenue,
                    e.count
                ];
            })
        ];
        const wsTopEntrepreneurs = XLSX.utils.aoa_to_sheet(entrepreneurData);
        wsTopEntrepreneurs['!cols'] = [
            { wch: 4 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(wb, wsTopEntrepreneurs, 'Top Emprendedores');

        // ===== Sheet 5: LISTA COMPLETA DE PARTICIPANTES =====
        const allParticipants = fairEntrepreneurs.filter(p => p.status === 'confirmed');
        const participantsData = [
            ['LISTA COMPLETA DE PARTICIPANTES CONFIRMADOS'],
            [],
            ['#', 'Emprendimiento', 'Propietario', 'Categoría', 'Ciudad', 'Teléfono', 'Email', 'Instagram', 'Descripción'],
            ...allParticipants.map((p, i) => [
                i + 1,
                p.business_name || p.name,
                p.name,
                p.category || 'Sin categoría',
                p.ciudad || 'N/A',
                p.phone || 'N/A',
                p.email || 'N/A',
                p.instagram || 'N/A',
                p.activity || 'N/A'
            ])
        ];
        const wsParticipants = XLSX.utils.aoa_to_sheet(participantsData);
        wsParticipants['!cols'] = [
            { wch: 4 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 40 }
        ];
        XLSX.utils.book_append_sheet(wb, wsParticipants, 'Participantes');

        // ===== Sheet 6: REGISTRO DE VENTAS =====
        const salesData = [
            ['REGISTRO COMPLETO DE VENTAS'],
            [],
            ['Fecha', 'Emprendimiento', 'Propietario', 'Categoría', 'Monto ($)'],
            ...currentSales.map(sale => {
                const ent = fairEntrepreneurs.find(e => e.id === sale.entrepreneur_id);
                return [
                    sale.date ? new Date(sale.date).toLocaleDateString('es-ES') : 'N/A',
                    ent?.business_name || ent?.name || 'Desconocido',
                    ent?.name || 'N/A',
                    ent?.category || 'Sin categoría',
                    Number(sale.amount)
                ];
            }).sort((a, b) => new Date(b[0]) - new Date(a[0]))
        ];
        const wsSales = XLSX.utils.aoa_to_sheet(salesData);
        wsSales['!cols'] = [
            { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(wb, wsSales, 'Ventas');

        // Download
        const fileName = `Reporte_Completo_${fair.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };


    // -- Charts Colors --
    // Vibrant, distinct colors for the dark/light theme
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

    return (
        <div className="space-y-5 sm:space-y-8 animate-fade-in">
            {/* KPI Cards Row - 2 columns on mobile */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                <KPICard
                    title="Recaudación Total"
                    value={`$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(totalRevenue)}`}
                    icon={DollarSign}
                    trend="Actualizado"
                    trendUp={true}
                    color="primary"
                />
                <KPICard
                    title="Participantes Confirmados"
                    value={participantsCount}
                    icon={Users}
                    color="secondary"
                />
                <KPICard
                    title="Registros de Venta"
                    value={totalSalesCount}
                    icon={FileText}
                    color="emerald"
                />
                <KPICard
                    title="Ticket Promedio"
                    value={`$${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(averageTicket)}`}
                    icon={TrendingUp}
                    color="amber"
                />
            </div>

            {/* Main Charts Row - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
                {/* Top Entrepreneurs Bar Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-[300px] sm:h-[400px] flex flex-col">
                    <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2">
                        <Users size={18} className="sm:w-5 sm:h-5 text-primary-500" />
                        Top 5 Emprendedores
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByEntrepreneur} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={140}
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                    interval={0}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                    formatter={(value, name, props) => {
                                        return [`$${value.toFixed(2)}`, `Ventas (${props.payload.category})`];
                                    }}
                                />
                                <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}>
                                    {salesByEntrepreneur.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sales By Category - Mobile Optimized */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[280px] sm:h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Tag size={16} className="sm:w-5 sm:h-5 text-fuchsia-500" />
                            Ventas por Categoría
                        </h3>
                        {/* Total badge on mobile */}
                        <div className="sm:hidden bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full">
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                                TOTAL {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(totalRevenue)}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-0 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        {/* Chart Side - Hidden on mobile */}
                        <div className="hidden md:block h-full relative">
                            {salesByCategory.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={salesByCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            cornerRadius={6}
                                        >
                                            {salesByCategory.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={entry.fill}
                                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => setSelectedCategoryDetails(entry)}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                            formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                    <p>No hay datos</p>
                                </div>
                            )}
                            {/* Centered Total Label */}
                            {salesByCategory.length > 0 && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <span className="text-xs text-slate-400 font-bold uppercase block">Total</span>
                                        <span className="text-lg font-black text-slate-800 dark:text-white">
                                            {new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(totalRevenue)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Category List - Full width on mobile */}
                        <div className="h-full overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                            <div className="space-y-2 sm:space-y-3">
                                {salesByCategory.map((cat, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedCategoryDetails(cat)}
                                        className="flex items-center justify-between p-2.5 sm:p-2 rounded-xl sm:rounded-lg bg-slate-50 dark:bg-slate-700/30 sm:bg-transparent sm:dark:bg-transparent hover:bg-slate-100 sm:hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                            <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.fill }}></span>
                                            <div>
                                                <p className="text-xs sm:text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{cat.name}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">
                                                    {((cat.value / totalRevenue) * 100).toFixed(1)}% del total
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-sm sm:text-xs font-bold text-slate-900 dark:text-white">
                                            ${new Intl.NumberFormat('en-US', { compactDisplay: "short" }).format(cat.value)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Category Details Modal */}
                {selectedCategoryDetails && (
                    <CategoryDetailsModal
                        category={selectedCategoryDetails.name}
                        color={selectedCategoryDetails.fill}
                        sales={currentSales} // Pass raw sales to calculate aggregation in modal
                        fairEntrepreneurs={fairEntrepreneurs}
                        onClose={() => setSelectedCategoryDetails(null)}
                    />
                )}
            </div>

            {/* City Performance & Trend Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* City Bar Chart - NEW */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <MapPin size={20} className="text-orange-500" />
                        Ventas por Ciudad
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        {cityPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cityPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey="name"
                                        width={100}
                                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                        interval={0}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                        formatter={(value) => [`$${value.toFixed(2)}`, 'Recaudado']}
                                    />
                                    <Bar dataKey="revenue" fill="#f97316" radius={[0, 6, 6, 0]} barSize={24}>
                                        {cityPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                <p>No hay datos de ciudades</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Daily Trend Area Chart */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-emerald-500" />
                        Tendencia de Ventas
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="formattedDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <CartesianGrid vertical={false} stroke="#f1f5f9" strokeDasharray="3 3" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`$${value.toFixed(2)}`, 'Ventas']}
                                    labelStyle={{ color: '#64748b', fontWeight: 'bold' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                    animationDuration={2000}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Report Section - Mobile Optimized */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div>
                        <h3 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileText size={18} className="sm:w-6 sm:h-6 text-primary-500" />
                            Detalle de Rendimiento
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">Desglose completo con ciudades para reportes de gestión</p>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-bold text-xs sm:text-sm transition-colors active:scale-[0.98] w-full sm:w-auto justify-center"
                    >
                        <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                        Descargar Reporte Excel
                    </button>
                </div>

                <div className="p-4 sm:p-8">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-10">
                        {/* 1. Category Breakdown */}
                        <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 border-l-4 border-fuchsia-500 pl-3">
                                Rendimiento por Categoría
                            </h4>

                            {/* Mobile Card View */}
                            <div className="sm:hidden space-y-2">
                                {categoryPerformance.map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }}></span>
                                            <span className="font-medium text-xs text-slate-700 dark:text-slate-200">{cat.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">${cat.revenue.toLocaleString()}</span>
                                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                                {cat.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="pb-3 pl-2">Categoría</th>
                                            <th className="pb-3 text-right">Ingresos</th>
                                            <th className="pb-3 text-center">% Global</th>
                                            <th className="pb-3 text-right pr-2">Ticket Prom.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {categoryPerformance.map((cat, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 pl-2 font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.fill }}></span>
                                                    {cat.name}
                                                </td>
                                                <td className="py-3 text-right font-bold text-slate-900 dark:text-white">${cat.revenue.toLocaleString()}</td>
                                                <td className="py-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                                        {cat.percentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right pr-2 text-slate-500 dark:text-slate-400">${cat.avgTicket.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* City Breakdown */}
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 sm:mb-6 mt-6 sm:mt-10 flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                                Rendimiento por Ciudad
                            </h4>

                            {/* Mobile Card View for Cities */}
                            <div className="sm:hidden space-y-2">
                                {cityPerformance.map((city, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                                        <span className="font-medium text-xs text-slate-700 dark:text-slate-200">{city.name}</span>
                                        <div className="text-right">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">${city.revenue.toLocaleString()}</span>
                                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                                                {city.percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table for Cities */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="pb-3 pl-2">Ciudad</th>
                                            <th className="pb-3 text-right">Ingresos</th>
                                            <th className="pb-3 text-center">% Global</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {cityPerformance.map((city, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 pl-2 font-medium text-slate-700 dark:text-slate-200">{city.name}</td>
                                                <td className="py-3 text-right font-bold text-slate-900 dark:text-white">${city.revenue.toLocaleString()}</td>
                                                <td className="py-3 text-center">
                                                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-bold">
                                                        {city.percentage.toFixed(1)}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                        {/* 2. Top Entrepreneurs List */}
                        <div>
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                                Mejores Emprendimientos (Top 10)
                            </h4>

                            {/* Mobile Card View for Entrepreneurs */}
                            <div className="sm:hidden space-y-2">
                                {entrepreneurPerformance.map((ent, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <span className="font-bold text-slate-300 dark:text-slate-500 text-xs w-5">#{i + 1}</span>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-xs text-slate-700 dark:text-slate-200 truncate">{ent.name}</p>
                                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ent.fill }}></span>
                                                    {ent.category}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 ml-2">${ent.revenue.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table for Entrepreneurs */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                                        <tr>
                                            <th className="pb-3 pl-2">Emprendimiento</th>
                                            <th className="pb-3">Categoría</th>
                                            <th className="pb-3 text-right">Total Ventas</th>
                                            <th className="pb-3 text-right pr-2"># Reg</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                        {entrepreneurPerformance.map((ent, i) => (
                                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="py-3 pl-2 max-w-[150px] truncate font-medium text-slate-700 dark:text-slate-200" title={ent.name}>
                                                    <span className="mr-2 font-bold text-slate-300 dark:text-slate-600">#{i + 1}</span>
                                                    {ent.name}
                                                </td>
                                                <td className="py-3 text-xs text-slate-500 dark:text-slate-400 uppercase">
                                                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: ent.fill }}></span>
                                                    {ent.category}
                                                </td>
                                                <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">${ent.revenue.toLocaleString()}</td>
                                                <td className="py-3 text-right pr-2 text-slate-500 dark:text-slate-400">{ent.count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, trendUp, color }) {
    const colors = {
        primary: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
        secondary: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${colors[color] || colors.primary} flex items-center justify-center`}>
                    <Icon size={18} className="sm:w-6 sm:h-6" />
                </div>
                {trend && (
                    <span className={`text-[8px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-0.5 sm:space-y-1">
                <p className="text-slate-500 dark:text-slate-400 text-[9px] sm:text-xs uppercase tracking-wider font-bold leading-tight">{title}</p>
                <h3 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white truncate">{value}</h3>
            </div>
        </div>
    );
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
                (e.business_name && e.business_name.toLowerCase().includes(term)) ||
                (e.category && e.category.toLowerCase().includes(term))
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
                            placeholder="Buscar participante, categoría..."
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

                    // Fallback to find description/city from main list if missing
                    let displayActivity = e.activity;
                    let displayCity = e.ciudad;

                    if ((!displayActivity || !displayCity) && entrepreneurs) {
                        const match = entrepreneurs.find(ent =>
                            (ent.nombre_emprendimiento && ent.nombre_emprendimiento === e.business_name) ||
                            (ent.persona_contacto && ent.persona_contacto === e.name)
                        );
                        if (match) {
                            if (!displayActivity) displayActivity = match.actividad_economica;
                            if (!displayCity) displayCity = match.ciudad;
                        }
                    }

                    // Create object with details for modal
                    const participantWithDetails = { ...e, activity: displayActivity, ciudad: displayCity };

                    return (
                        <div key={e.id} className={`group bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 relative ${isConfirmed
                            ? 'border-emerald-500/30 shadow-sm shadow-emerald-500/5'
                            : 'border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-500/30 hover:shadow-md'
                            }`}>
                            {/* Card Content - Clickable Region */}
                            <div className="flex items-start justify-between cursor-pointer" onClick={() => setSelectedParticipant(participantWithDetails)}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-base shadow-sm transition-colors shrink-0 overflow-hidden ${isConfirmed
                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/20 group-hover:text-primary-600 dark:group-hover:text-primary-400'
                                        }`}>
                                        {(() => {
                                            const mainEnt = entrepreneurs?.find(ent =>
                                                (ent.nombre_emprendimiento && ent.nombre_emprendimiento === e.business_name) ||
                                                (ent.persona_contacto && ent.persona_contacto === e.name)
                                            );
                                            const logoUrl = e.logo_url || mainEnt?.logo_url;

                                            if (logoUrl) {
                                                return <img src={logoUrl} alt={e.business_name || e.name} className="w-full h-full object-cover" />;
                                            }
                                            return isConfirmed ? <Check size={18} strokeWidth={3} /> : (e.business_name?.charAt(0) || e.name.charAt(0));
                                        })()}
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
                            ciudad: emp.ciudad || '', // Include city
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

    // Currency Formatter - adds thousand separators
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

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

    // Excel Export Function
    const handleExportExcel = async () => {
        // Lazy-load XLSX only when needed
        const XLSX = await import('xlsx');
        // Prepare data for export with formatted currency
        const exportData = filteredAndSortedParticipants.map(p => ({
            'Emprendedor': p.displayName || '',
            'Propietario': p.name || '',
            'Categoría': p.category || 'Sin categoría',
            'Venta del Día': `$${formatCurrency(p.dailyRevenue)}`,
            'Acumulado Total': `$${formatCurrency(p.totalRevenue)}`
        }));

        // Add totals row
        exportData.push({
            'Emprendedor': 'TOTAL',
            'Propietario': '',
            'Categoría': '',
            'Venta del Día': `$${formatCurrency(dailyRevenue)}`,
            'Acumulado Total': `$${formatCurrency(totalRevenue)}`
        });

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        ws['!cols'] = [
            { wch: 30 }, // Emprendedor
            { wch: 25 }, // Propietario
            { wch: 20 }, // Categoría
            { wch: 18 }, // Venta del Día
            { wch: 18 }  // Acumulado Total
        ];

        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

        // Generate filename with fair name and date
        const fairName = fair?.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'feria';
        const fileName = `ventas_${fairName}_${selectedDate}.xlsx`;

        // Download file
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20 col-span-1 sm:col-span-2">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-primary-100 font-bold text-xs uppercase tracking-wider mb-1">Recaudación Total</p>
                            <h3 className="text-4xl font-extrabold tracking-tight">${formatCurrency(totalRevenue)}</h3>
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
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">${formatCurrency(dailyRevenue)}</h3>
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

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-72">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none text-sm transition-all font-medium text-slate-900 dark:text-white"
                                    placeholder={viewMode === 'participants' ? "Buscar participante..." : "Buscar para registrar venta..."}
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
                                title="Exportar a Excel"
                            >
                                <FileSpreadsheet size={18} />
                                <span className="hidden sm:inline">Exportar Excel</span>
                            </button>
                        </div>
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
                                                            ${formatCurrency(participant.dailyRevenue)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-sm italic">Pendiente</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                                                    ${formatCurrency(participant.totalRevenue)}
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
                                    {participant.hasDaySale ? <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div> : null}

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
                                                    ${formatCurrency(participant.dailyRevenue)}
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
                                                ${formatCurrency(participant.totalRevenue)}
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
                                const rawValue = e.target.amount.value.replace(/,/g, '');
                                const val = parseFloat(rawValue);
                                if (!isNaN(val) && val > 0) {
                                    addFairSale({
                                        fair_id: fairId,
                                        entrepreneur_id: selectedEntId,
                                        sale_date: selectedDate,
                                        amount: val
                                    });
                                    setIsModalOpen(false);
                                }
                            }}>
                                <div className="mb-8 text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <span className="text-4xl font-bold text-slate-300 dark:text-slate-600 mr-2 absolute -left-6 top-2">$</span>
                                        <input
                                            name="amount"
                                            type="text"
                                            inputMode="decimal"
                                            autoFocus
                                            className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-primary-500 outline-none text-6xl font-extrabold text-slate-900 dark:text-white text-center pb-2 transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                            placeholder="0.00"
                                            required
                                            onChange={(e) => {
                                                // Remove non-numeric characters except dots
                                                let value = e.target.value.replace(/[^0-9.]/g, '');

                                                // Handle decimal point
                                                const parts = value.split('.');
                                                if (parts.length > 2) {
                                                    value = parts[0] + '.' + parts.slice(1).join('');
                                                }

                                                // Format with thousand separators
                                                if (parts.length === 2) {
                                                    // Has decimal
                                                    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                    const decPart = parts[1].slice(0, 2); // Max 2 decimal places
                                                    e.target.value = intPart + '.' + decPart;
                                                } else {
                                                    // No decimal
                                                    e.target.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                                                }
                                            }}
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
                                            {isSelected ? <Check size={14} strokeWidth={4} /> : null}
                                        </div>

                                        {/* Content */}
                                        <div className="flex items-center gap-4 mb-1">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                                {e.logo_url ? (
                                                    <img src={e.logo_url} alt={e.nombre_emprendimiento} className="w-full h-full object-cover" />
                                                ) : (
                                                    (e.nombre_emprendimiento || e.name || '?').charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-bold truncate text-base ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                                        {e.nombre_emprendimiento || e.name || 'Sin Nombre'}
                                                    </span>
                                                    {hasRuc && (
                                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wide">
                                                            RUC
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
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
        </div >,
        document.body
    );
}


function ParticipantDetailsModal({ participant: initialParticipant, onClose, fairId }) {
    const {
        fairAssignments,
        updateFairAssignmentStatus,
        updateEntrepreneur, // For updating main entrepreneurs table
        entrepreneurs, // Main entrepreneurs list to find matching record
        fairEntrepreneurs // Use fair entrepreneurs list for live updates
    } = useData();

    // Local state for editing city
    const [isAddingCity, setIsAddingCity] = useState(false);
    const [newCityValue, setNewCityValue] = useState('');
    const [displayCity, setDisplayCity] = useState(initialParticipant.ciudad || '');

    // Ref to track local updates and prevent race-condition rebounds
    const lastUpdateRef = useRef(0);

    // Merge passed participant with latest global data from fairEntrepreneurs
    const participant = useMemo(() => {
        const freshData = fairEntrepreneurs?.find(e => String(e.id) === String(initialParticipant.id));
        return { ...initialParticipant, ...freshData };
    }, [initialParticipant, fairEntrepreneurs]);

    // Find matching main entrepreneur
    const mainEntrepreneur = useMemo(() => {
        if (!entrepreneurs) return null;
        return entrepreneurs.find(ent =>
            (ent.nombre_emprendimiento && ent.nombre_emprendimiento === participant.business_name) ||
            (ent.persona_contacto && ent.persona_contacto === participant.name)
        );
    }, [entrepreneurs, participant.business_name, participant.name]);

    useEffect(() => {
        // If we recently updated locally (within 5 seconds), ignore external reverts
        if (Date.now() - lastUpdateRef.current < 5000) return;

        // Check both fair entrepreneur and main entrepreneur for city
        const cityFromFair = participant.ciudad;
        const cityFromMain = mainEntrepreneur?.ciudad;
        const effectiveCity = cityFromFair || cityFromMain || '';

        if (effectiveCity && effectiveCity !== displayCity) {
            setDisplayCity(effectiveCity);
        }
    }, [participant.ciudad, mainEntrepreneur?.ciudad]);

    const handleSaveCity = async () => {
        if (!newCityValue.trim()) return;
        const formattedCity = newCityValue.trim().toUpperCase();

        // Optimistic update
        setDisplayCity(formattedCity);
        setIsAddingCity(false);
        lastUpdateRef.current = Date.now(); // Mark as locally updated

        try {
            // Update in MAIN entrepreneurs table (which has the ciudad field working)
            if (mainEntrepreneur) {
                console.log('DEBUG: Updating main entrepreneur ID:', mainEntrepreneur.id, 'with ciudad:', formattedCity);
                await updateEntrepreneur(mainEntrepreneur.id, { ciudad: formattedCity });
            } else {
                console.warn('No matching main entrepreneur found for:', participant.business_name, participant.name);
            }
        } catch (error) {
            console.error("Failed to save city:", error);
        }
    };

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
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-[2.5rem] w-full sm:max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-in overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[85vh]">

                {/* Close Button - Mobile friendly */}
                <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-10">
                    <button onClick={onClose} className="p-2.5 sm:p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 rounded-full transition-colors active:scale-95">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 sm:p-8 pb-0 pt-12 sm:pt-12 flex-1 overflow-y-auto">
                    {/* Centered Big Avatar - Smaller on mobile */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 sm:w-32 h-20 sm:h-32 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 dark:border-slate-700 flex items-center justify-center text-3xl sm:text-5xl font-bold text-slate-300 dark:text-slate-600 mb-4 sm:mb-6 overflow-hidden">
                            {(() => {
                                const logoUrl = participant.logo_url || mainEntrepreneur?.logo_url;
                                if (logoUrl) {
                                    return <img src={logoUrl} alt={participant.business_name || participant.name} className="w-full h-full object-cover" />;
                                }
                                return participant.business_name?.charAt(0) || participant.name.charAt(0);
                            })()}
                        </div>

                        <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-1.5 sm:mb-2 px-2">
                            {participant.business_name || participant.name}
                        </h2>

                        <div className="flex items-center gap-2 mb-3 sm:mb-4 justify-center text-slate-500 dark:text-slate-400 font-medium text-sm sm:text-base">
                            <Users size={14} className="sm:w-4 sm:h-4 text-primary-500" />
                            <span>{participant.name}</span>
                        </div>

                        <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border mb-6 sm:mb-8 flex items-center gap-2 ${isConfirmed
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                            : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                            }`}>
                            <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isConfirmed ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                            {isConfirmed ? 'ASISTENCIA CONFIRMADA' : 'PENDIENTE DE CONFIRMACIÓN'}
                        </div>
                    </div>

                    {/* Info Sections - Mobile optimized */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                        <h4 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 sm:mb-4">Información de Contacto</h4>

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

                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700">
                                <MapPin size={18} />
                            </div>
                            <div className="text-left w-full">
                                <div className="text-xs text-slate-400 font-medium mb-0.5">Ciudad</div>

                                {displayCity ? (
                                    <div className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">{displayCity}</div>
                                ) : isAddingCity ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <input
                                            autoFocus
                                            className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                                            placeholder="Ingresa la ciudad..."
                                            value={newCityValue}
                                            onChange={e => setNewCityValue(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleSaveCity();
                                            }}
                                        />
                                        <button
                                            onClick={handleSaveCity}
                                            className="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setIsAddingCity(false)}
                                            className="p-1.5 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsAddingCity(true)}
                                        className="text-sm font-bold text-primary-500 hover:text-primary-600 underline decoration-dashed underline-offset-4 flex items-center gap-1"
                                    >
                                        + Agregar Ciudad
                                    </button>
                                )}
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
