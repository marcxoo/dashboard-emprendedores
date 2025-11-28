import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

export default function EntrepreneurDetail({ entrepreneur, onClose, onEdit, onDelete }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (entrepreneur) {
            setIsVisible(true);
        }
    }, [entrepreneur]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    const handleDelete = () => {
        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${entrepreneur.nombre_emprendimiento}? Esta acción no se puede deshacer.`)) {
            if (onDelete) onDelete(entrepreneur.id);
            handleClose();
        }
    };

    if (!entrepreneur) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            ></div>

            {/* Slide-over Panel */}
            <div
                className={`relative w-full max-w-md bg-white h-full shadow-2xl transform transition-transform duration-300 ease-out pointer-events-auto ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="h-full flex flex-col overflow-y-auto">
                    {/* Header */}
                    <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{entrepreneur.nombre_emprendimiento}</h2>
                            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                                {entrepreneur.categoria_principal}
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {/* Contact Info */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Información de Contacto</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">👤</div>
                                    <div>
                                        <div className="text-sm text-slate-500">Persona de Contacto</div>
                                        <div className="font-medium text-slate-900">{entrepreneur.persona_contacto}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">📞</div>
                                    <div>
                                        <div className="text-sm text-slate-500">Teléfono</div>
                                        <div className="font-medium text-slate-900">{entrepreneur.telefono}</div>
                                    </div>
                                </div>

                            </div>
                        </section>

                        {/* Business Details */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Detalles del Negocio</h3>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="mb-4">
                                    <div className="text-sm text-slate-500 mb-1">Actividad Económica</div>
                                    <div className="font-medium text-slate-900">{entrepreneur.actividad_economica}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">RUC</div>
                                        <div className="font-mono text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                                            {entrepreneur.ruc || 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-slate-500 mb-1">ID</div>
                                        <div className="font-mono text-sm font-medium text-slate-700">#{entrepreneur.id}</div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Status */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Estado y Participación</h3>
                            <div className="flex gap-4">
                                <div className="flex-1 p-4 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{entrepreneur.veces_en_stand}</div>
                                    <div className="text-xs text-slate-500 font-medium">Participaciones</div>
                                </div>

                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                        <button
                            className="btn w-full btn-primary py-3 shadow-lg shadow-primary-500/20"
                            onClick={() => {
                                handleClose();
                                if (onEdit) onEdit(entrepreneur);
                            }}
                        >
                            Editar Información
                        </button>
                        <button
                            className="btn w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 transition-colors"
                            onClick={handleDelete}
                        >
                            Eliminar Emprendedor
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
