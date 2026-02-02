import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Tag, User, DollarSign, TrendingUp } from 'lucide-react';

export function CategoryDetailsModal({ category, onClose, fairEntrepreneurs, sales, color }) {
    // 1. Filter Entrepreneurs in this Category
    const categoryData = useMemo(() => {
        if (!category) return null;

        // Find all entrepreneurs in this category
        const entrepreneursInCategory = fairEntrepreneurs.filter(
            e => (e.category || 'Sin Categoría').trim() === category
        );

        // Deduplicate using a Map (key: entrepreneur ID)
        const uniqueEntrepreneurs = new Map();

        entrepreneursInCategory.forEach(ent => {
            // In case IDs are not strings or there are slight mismatches
            const id = String(ent.id);
            if (!uniqueEntrepreneurs.has(id)) {
                // Calculate revenue for this unique entrepreneur
                const entSales = sales.filter(s => String(s.entrepreneur_id) === id);
                const totalRevenue = entSales.reduce((sum, s) => sum + Number(s.amount), 0);

                uniqueEntrepreneurs.set(id, {
                    ...ent,
                    revenue: totalRevenue,
                    salesCount: entSales.length
                });
            }
        });

        // Convert Map to Array and Filter (Removing 0 revenue)
        const stats = Array.from(uniqueEntrepreneurs.values())
            .filter(e => e.revenue > 0) // <--- Only show those with sales
            .sort((a, b) => b.revenue - a.revenue);

        const totalRevenue = stats.reduce((sum, s) => sum + s.revenue, 0);

        const totalSalesCount = stats.reduce((sum, s) => sum + s.salesCount, 0);
        const trueAvgTicket = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

        return {
            entrepreneurs: stats,
            totalRevenue,
            totalSalesCount,
            avgTicket: trueAvgTicket
        };
    }, [category, fairEntrepreneurs, sales]);

    if (!categoryData) return null;

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content - Full screen on mobile */}
            <div className="relative bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[85vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-in">

                {/* Header - Compact on mobile */}
                <div className="flex-none px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm" style={{ backgroundColor: color || '#64748b' }}>
                            <Tag className="text-white" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                {category}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm hidden sm:block">
                                Detalle de rendimiento por categoría
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 sm:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 active:scale-95"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Stats Row - Horizontal scroll on mobile */}
                <div className="flex-none overflow-x-auto">
                    <div className="flex sm:grid sm:grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-8 border-b border-slate-100 dark:border-slate-800 min-w-max sm:min-w-0">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 min-w-[110px] sm:min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-0.5 sm:mb-1">Total Ventas</p>
                            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                                ${categoryData.totalRevenue.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 min-w-[110px] sm:min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-0.5 sm:mb-1">Emprendedores</p>
                            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                                {categoryData.entrepreneurs.length}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-slate-700 min-w-[110px] sm:min-w-0">
                            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-0.5 sm:mb-1">Ticket Promedio</p>
                            <p className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
                                ${categoryData.avgTicket.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 uppercase tracking-wider">
                        Ranking de Emprendedores
                    </h3>

                    <div className="space-y-2 sm:space-y-3">
                        {categoryData.entrepreneurs.map((ent, index) => (
                            <div key={ent.id} className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800/50 transition-all flex items-center gap-3 sm:gap-4 active:scale-[0.99]">
                                {/* Rank */}
                                <div className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                    #{index + 1}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                                        {ent.business_name || ent.name}
                                    </h4>
                                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        <span className="flex items-center gap-1 truncate">
                                            <User size={10} className="sm:w-3 sm:h-3 flex-shrink-0" />
                                            <span className="truncate">{ent.name}</span>
                                        </span>
                                        {ent.ciudad && (
                                            <span className="hidden sm:inline bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase flex-shrink-0">
                                                {ent.ciudad}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Revenue Bar (Visual relative to max) - Hidden on mobile */}
                                <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden hidden lg:block">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${categoryData.totalRevenue > 0 ? (ent.revenue / categoryData.totalRevenue) * 100 : 0}%`,
                                            backgroundColor: color || '#3b82f6'
                                        }}
                                    />
                                </div>

                                {/* Value */}
                                <div className="text-right pl-2 sm:pl-4 border-l border-slate-100 dark:border-slate-700 flex-shrink-0">
                                    <p className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                                        ${ent.revenue.toLocaleString()}
                                    </p>
                                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400">
                                        {categoryData.totalRevenue > 0 ? ((ent.revenue / categoryData.totalRevenue) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
