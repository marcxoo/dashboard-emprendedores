import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Trash2, Edit, Building2, Instagram, Facebook, Globe, Link as LinkIcon } from 'lucide-react';

// Helper to parse social media
const getSocialMediaInfo = (input) => {
    if (!input) return null;

    let url = input;
    let type = 'web';
    let label = input;

    // Normalize input to be a URL if possible
    if (!input.startsWith('http') && !input.startsWith('www')) {
        // Clean input of @ for URL construction
        const cleanInput = input.replace(/^@/, '');

        if (input.startsWith('@') || !input.includes('.')) {
            // Assume Instagram if starts with @ or just text
            url = `https://instagram.com/${cleanInput}`;
            type = 'instagram';
            label = `@${cleanInput}`;
        } else {
            // Has dots, assume website
            url = `https://${input}`;
        }
    }

    // Detect type from URL and clean up
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram.com')) {
        type = 'instagram';
        // Extract handle if possible
        const match = lowerUrl.match(/instagram\.com\/([^/?]+)/);
        if (match) {
            // Remove @ from handle if present in URL (fix for existing bad data)
            const handle = match[1].replace(/^@/, '');
            label = `@${handle}`;
            // Fix URL if it has @
            if (match[1].startsWith('@')) {
                url = url.replace(`/${match[1]}`, `/${handle}`);
            }
        }
    } else if (lowerUrl.includes('tiktok.com')) {
        type = 'tiktok';
        const match = lowerUrl.match(/tiktok\.com\/@?([^/?]+)/);
        if (match) {
            const handle = match[1].replace(/^@/, '');
            label = `@${handle}`;
        }
    } else if (lowerUrl.includes('facebook.com')) {
        type = 'facebook';
    }

    return { type, url, label };
};

export default function EntrepreneurDetail({ entrepreneur, onClose, onEdit, onDelete }) {
    const [isVisible, setIsVisible] = useState(false);

    // ... (rest of the component)

    const socialInfo = getSocialMediaInfo(entrepreneur?.red_social);




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
                            <h2 className="text-2xl font-bold text-secondary">{entrepreneur.nombre_emprendimiento}</h2>
                            <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-100">
                                {entrepreneur.categoria_principal}
                            </span>
                            <span className={`inline-block mt-2 ml-2 px-3 py-1 rounded-full text-sm font-medium border ${entrepreneur.semaforizacion === 'Estudiante / Graduado UNEMI'
                                ? 'bg-blue-50 text-blue-700 border-blue-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {entrepreneur.semaforizacion || 'Externo'}
                            </span>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-8">
                        {/* Contact Info */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Información de Contacto</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><User size={18} /></div>
                                    <div>
                                        <div className="text-sm text-slate-500">Persona de Contacto</div>
                                        <div className="font-medium text-secondary">{entrepreneur.persona_contacto}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Phone size={18} /></div>
                                    <div>
                                        <div className="text-sm text-slate-500">Teléfono</div>
                                        <div className="font-medium text-secondary">{entrepreneur.telefono}</div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Building2 size={18} /></div>
                                    <div>
                                        <div className="text-sm text-slate-500">Ciudad</div>
                                        <div className="font-medium text-secondary">{entrepreneur.ciudad || 'No registrada'}</div>
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
                                    <div className="font-medium text-secondary">{entrepreneur.actividad_economica}</div>
                                </div>
                                <div className="mb-4">
                                    <div className="text-sm text-slate-500 mb-1">Red Social</div>
                                    {socialInfo ? (
                                        <a
                                            href={socialInfo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 font-medium text-secondary hover:text-primary-600 transition-colors group"
                                        >
                                            {socialInfo.type === 'instagram' && <Instagram size={18} className="text-pink-600" />}
                                            {socialInfo.type === 'tiktok' && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-black">
                                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                                </svg>
                                            )}
                                            {socialInfo.type === 'facebook' && <Facebook size={18} className="text-blue-600" />}
                                            {socialInfo.type === 'web' && <Globe size={18} className="text-slate-400" />}

                                            <span className="group-hover:underline">{socialInfo.label}</span>
                                            <LinkIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                                        </a>
                                    ) : (
                                        <div className="font-medium text-slate-400 italic">No registrada</div>
                                    )}
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
                                    <div className="text-3xl font-bold text-secondary mb-1">{entrepreneur.veces_en_stand}</div>
                                    <div className="text-xs text-slate-500 font-medium">Participaciones</div>
                                </div>

                            </div>
                        </section>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
                        <button
                            className="btn w-full btn-primary py-3 shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                            onClick={() => {
                                handleClose();
                                if (onEdit) onEdit(entrepreneur);
                            }}
                        >
                            <Edit size={18} /> Editar Información
                        </button>
                        {onDelete && (
                            <button
                                className="btn w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 transition-colors flex items-center justify-center gap-2"
                                onClick={handleDelete}
                            >
                                <Trash2 size={18} /> Eliminar Emprendedor
                            </button>
                        )}
                    </div>
                </div>
            </div >
        </div >,
        document.body
    );
}
