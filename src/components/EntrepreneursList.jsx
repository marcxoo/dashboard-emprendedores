import { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import EntrepreneurDetail from './EntrepreneurDetail';
import { getDateRangeFromWeek } from '../utils/dateUtils';

export default function EntrepreneursList() {
    const { entrepreneurs, addEntrepreneur, updateEntrepreneur, deleteEntrepreneur } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntrepreneur, setEditingEntrepreneur] = useState(null);

    const [filterCategory, setFilterCategory] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const categories = useMemo(() => [...new Set(entrepreneurs.map(e => e.categoria_principal))].sort(), [entrepreneurs]);

    const filteredData = useMemo(() => {
        let data = entrepreneurs.filter(e => {
            if (filterCategory && e.categoria_principal !== filterCategory) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    e.nombre_emprendimiento.toLowerCase().includes(term) ||
                    e.persona_contacto.toLowerCase().includes(term) ||
                    (e.telefono && e.telefono.toLowerCase().includes(term)) ||
                    (e.correo && e.correo.toLowerCase().includes(term))
                );
            }
            return true;
        });

        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    }, [entrepreneurs, filterCategory, searchTerm, sortConfig]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative">
            {/* Detail Slide-over */}
            <EntrepreneurDetail
                entrepreneur={selectedEntrepreneur}
                onClose={() => setSelectedEntrepreneur(null)}
                onDelete={(id) => {
                    deleteEntrepreneur(id);
                    setSelectedEntrepreneur(null);
                }}
                onEdit={(entrepreneur) => {
                    setSelectedEntrepreneur(null);
                    setEditingEntrepreneur(entrepreneur);
                    setIsModalOpen(true);
                }}
            />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Emprendedores</h1>
                    <p className="text-slate-500 mt-2 text-lg">Gestión y listado general ({filteredData.length} registros)</p>
                </div>
                <button
                    onClick={() => {
                        setEditingEntrepreneur(null);
                        setIsModalOpen(true);
                    }}
                    className="btn btn-primary px-4 py-2 shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all active:scale-95 flex items-center gap-2"
                >
                    <span className="text-xl">+</span> Agregar Emprendedor
                </button>
            </div>

            <div className="card bg-white shadow-xl shadow-slate-200/50 border-0 ring-1 ring-slate-100">
                {/* Filters */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 min-w-[250px] relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            className="input pl-10 py-2.5 border-slate-200 focus:border-primary-500 focus:ring-primary-500/20 shadow-sm"
                            placeholder="Buscar por nombre o contacto..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <select
                        className="input w-auto py-2.5 border-slate-200 focus:border-primary-500 focus:ring-primary-500/20 shadow-sm cursor-pointer"
                        value={filterCategory}
                        onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* Table (Desktop) */}
                <div className="hidden md:block table-container">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th onClick={() => requestSort('id')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center gap-1">ID <span className="text-slate-300 group-hover:text-slate-500">{getSortIcon('id')}</span></div>
                                </th>
                                <th onClick={() => requestSort('nombre_emprendimiento')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center gap-1">Emprendimiento <span className="text-slate-300 group-hover:text-slate-500">{getSortIcon('nombre_emprendimiento')}</span></div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                                <th onClick={() => requestSort('categoria_principal')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center gap-1">Categoría <span className="text-slate-300 group-hover:text-slate-500">{getSortIcon('categoria_principal')}</span></div>
                                </th>
                                <th onClick={() => requestSort('veces_en_stand')} className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group">
                                    <div className="flex items-center justify-center gap-1">Part. <span className="text-slate-300 group-hover:text-slate-500">{getSortIcon('veces_en_stand')}</span></div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Última Part.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.map((e, idx) => (
                                <tr
                                    key={e.id}
                                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                                    onClick={() => setSelectedEntrepreneur(e)}
                                >
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400">#{e.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 text-base">{e.nombre_emprendimiento}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{e.actividad_economica}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-700">{e.persona_contacto}</div>
                                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                            <span>📞</span> {e.telefono}
                                        </div>
                                        {e.correo && (
                                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 overflow-hidden text-ellipsis" title={e.correo}>
                                                <span>✉️</span> {e.correo}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                            {e.categoria_principal}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-700 text-sm">
                                            {e.veces_en_stand}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">{getDateRangeFromWeek(e.ultima_semana_participacion)}</span>
                                            <span className="text-xs text-slate-400">{e.ultima_semana_participacion || '-'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Cards (Mobile) */}
                <div className="md:hidden divide-y divide-slate-100">
                    {paginatedData.map((e) => (
                        <div
                            key={e.id}
                            className="p-4 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                            onClick={() => setSelectedEntrepreneur(e)}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-bold text-slate-900 text-lg">{e.nombre_emprendimiento}</div>
                                    <div className="text-sm text-slate-500">{e.actividad_economica}</div>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                    {e.categoria_principal}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2 mt-3">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>👤</span>
                                    <span className="font-medium">{e.persona_contacto}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <span>📞</span>
                                    <span>{e.telefono}</span>
                                </div>
                                {e.correo && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span>✉️</span>
                                        <span className="truncate">{e.correo}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">Participaciones:</span>
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 text-xs">
                                        {e.veces_en_stand}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-400">
                                    Última: {e.ultima_semana_participacion || '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="text-sm text-slate-500 font-medium">
                        Mostrando <span className="font-bold text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className="font-bold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-bold text-slate-900">{filteredData.length}</span> resultados
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-outline py-2 px-4 text-sm hover:bg-white hover:border-slate-300 shadow-sm disabled:opacity-50 disabled:shadow-none"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Anterior
                        </button>
                        <div className="flex items-center px-4 font-bold text-slate-700 bg-white rounded-md border border-slate-200 shadow-sm">
                            {currentPage} / {totalPages}
                        </div>
                        <button
                            className="btn btn-outline py-2 px-4 text-sm hover:bg-white hover:border-slate-300 shadow-sm disabled:opacity-50 disabled:shadow-none"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </div>

            <EntrepreneurModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(data) => {
                    if (editingEntrepreneur) {
                        updateEntrepreneur(editingEntrepreneur.id, data);
                    } else {
                        addEntrepreneur(data);
                    }
                }}
                categories={categories}
                initialData={editingEntrepreneur}
            />
        </div>
    );
}

import { createPortal } from 'react-dom';

function EntrepreneurModal({ isOpen, onClose, onSave, categories, initialData }) {
    const [formData, setFormData] = useState({
        nombre_emprendimiento: '',
        persona_contacto: '',
        telefono: '',
        correo: '',
        categoria_principal: '',
        actividad_economica: ''
    });
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                nombre_emprendimiento: initialData.nombre_emprendimiento || '',
                persona_contacto: initialData.persona_contacto || '',
                telefono: initialData.telefono || '',
                correo: initialData.correo || '',
                categoria_principal: initialData.categoria_principal || '',
                actividad_economica: initialData.actividad_economica || ''
            });
            setIsCustomCategory(!categories.includes(initialData.categoria_principal) && initialData.categoria_principal !== '');
        } else {
            setFormData({
                nombre_emprendimiento: '',
                persona_contacto: '',
                telefono: '',
                correo: '',
                categoria_principal: '',
                actividad_economica: ''
            });
            setIsCustomCategory(false);
        }
    }, [initialData, isOpen, categories]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.nombre_emprendimiento || !formData.persona_contacto || !formData.categoria_principal) {
            alert('Por favor complete los campos obligatorios: Nombre, Contacto y Categoría.');
            return;
        }

        try {
            onSave(formData);
            alert(initialData ? 'Emprendedor actualizado exitosamente' : 'Emprendedor guardado exitosamente');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar: ' + error.message);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex-none bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/30">
                            {initialData ? <span className="text-xl">✏️</span> : <span className="text-xl">✨</span>}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">
                                {initialData ? 'Editar Emprendedor' : 'Nuevo Emprendedor'}
                            </h3>
                            <p className="text-sm text-primary-100 font-medium">
                                {initialData ? 'Actualiza la información registrada' : 'Completa los datos para el registro'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full transition-all flex items-center justify-center backdrop-blur-sm"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
                    <form id="entrepreneur-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nombre del Emprendimiento <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">🏢</span>
                                    <input
                                        className="input w-full pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                        value={formData.nombre_emprendimiento}
                                        onChange={e => setFormData({ ...formData, nombre_emprendimiento: e.target.value })}
                                        placeholder="Ej. Delicias Caseras"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Persona de Contacto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">👤</span>
                                    <input
                                        className="input w-full pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                        value={formData.persona_contacto}
                                        onChange={e => setFormData({ ...formData, persona_contacto: e.target.value })}
                                        placeholder="Ej. Juan Pérez"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Categoría <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">🏷️</span>
                                    <select
                                        className="input w-full pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm appearance-none"
                                        value={isCustomCategory ? 'NEW' : formData.categoria_principal}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val === 'NEW') {
                                                setIsCustomCategory(true);
                                                setFormData({ ...formData, categoria_principal: '' });
                                            } else {
                                                setIsCustomCategory(false);
                                                setFormData({ ...formData, categoria_principal: val });
                                            }
                                        }}
                                        required
                                    >
                                        <option value="">Seleccionar categoría...</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        <option value="NEW">➕ NUEVA CATEGORÍA...</option>
                                    </select>
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                                </div>

                                {/* Custom Category Input */}
                                {isCustomCategory && (
                                    <div className="mt-2 animate-fade-in">
                                        <input
                                            className="input w-full py-2 px-4 bg-slate-50 border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                            placeholder="Escribe el nombre de la nueva categoría..."
                                            value={formData.categoria_principal}
                                            onChange={e => setFormData({ ...formData, categoria_principal: e.target.value.toUpperCase() })}
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Teléfono</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">📞</span>
                                    <input
                                        className="input w-full pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                        value={formData.telefono}
                                        onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                        placeholder="Ej. 0991234567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">✉️</span>
                                    <input
                                        className="input w-full pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                        type="email"
                                        value={formData.correo}
                                        onChange={e => setFormData({ ...formData, correo: e.target.value })}
                                        placeholder="ejemplo@correo.com"
                                    />
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Actividad Económica / Detalles</label>
                                <div className="relative group">
                                    <span className="absolute left-3 top-3 text-slate-400 group-focus-within:text-primary-500 transition-colors">📝</span>
                                    <textarea
                                        className="input w-full min-h-[100px] pl-10 py-3 bg-white border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all shadow-sm"
                                        value={formData.actividad_economica}
                                        onChange={e => setFormData({ ...formData, actividad_economica: e.target.value })}
                                        placeholder="Descripción breve de los productos o servicios..."
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
                <div className="flex-none px-6 py-4 border-t border-slate-200 bg-white flex justify-end gap-3 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="entrepreneur-form"
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-lg shadow-primary-600/30 hover:shadow-primary-600/50 hover:scale-[1.02] transition-all active:scale-95 flex items-center gap-2"
                    >
                        <span>{initialData ? '💾 Guardar Cambios' : '✨ Crear Emprendedor'}</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
