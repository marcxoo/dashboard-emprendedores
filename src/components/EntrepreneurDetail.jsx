import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import X from 'lucide-react/dist/esm/icons/x';
import User from 'lucide-react/dist/esm/icons/user';
import Phone from 'lucide-react/dist/esm/icons/phone';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Edit from 'lucide-react/dist/esm/icons/pencil';
import Building2 from 'lucide-react/dist/esm/icons/building-2';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Globe from 'lucide-react/dist/esm/icons/globe';
import LinkIcon from 'lucide-react/dist/esm/icons/link';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';

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

    const handleDelete = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        console.log('handleDelete triggered');

        if (window.confirm(`¿Estás seguro de que deseas eliminar a ${entrepreneur.nombre_emprendimiento}? Esta acción no se puede deshacer.`)) {
            if (onDelete) onDelete(entrepreneur.id);
            handleClose();
        }
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isVisible) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isVisible, handleClose]);

    if (!entrepreneur && !isVisible) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Slide-over Panel */}
            <div
                className={`relative w-full max-w-lg backdrop-blur-3xl bg-slate-50/90 dark:bg-slate-900/95 h-full shadow-2xl border-l border-white/40 dark:border-slate-700/50 transform transition-transform duration-300 ease-out pointer-events-auto flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header (Premium Gradient) */}
                <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 dark:from-slate-800 dark:to-slate-900 text-white shrink-0 shadow-lg z-20 overflow-hidden">
                    {/* Dark Mode Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-y-32 translate-x-32 hidden dark:block pointer-events-none"></div>

                    <div className="absolute top-0 right-0 p-4 relative z-10">
                        <button
                            onClick={handleClose}
                            className="p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-8 pb-10 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-primary-600/20 backdrop-blur-md border border-white/30 dark:border-primary-500/30 flex items-center justify-center shadow-inner text-white dark:text-primary-500 overflow-hidden">
                                {entrepreneur.logo_url ? (
                                    <img src={entrepreneur.logo_url} alt={entrepreneur.nombre_emprendimiento} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold tracking-tight">
                                        {entrepreneur.nombre_emprendimiento.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{entrepreneur.nombre_emprendimiento}</h2>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 dark:bg-primary-500/10 text-white dark:text-primary-300 border border-white/20 dark:border-primary-500/20 backdrop-blur-sm">
                                        {entrepreneur.categoria_principal}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${entrepreneur.semaforizacion === 'Estudiante / Graduado UNEMI'
                                        ? 'bg-blue-500/30 text-blue-50 border-blue-400/50'
                                        : 'bg-slate-800/30 text-slate-200 border-slate-600/50'
                                        }`}>
                                        {entrepreneur.semaforizacion || 'Externo'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <div className="space-y-6 pb-10">

                        {/* Status Stats */}
                        <div className="flex gap-4">
                            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center group hover:border-primary-200 dark:hover:border-primary-700 transition-colors">
                                <span className="text-3xl font-bold text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300">{entrepreneur.veces_en_stand}</span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Participaciones</span>
                            </div>
                            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{entrepreneur.ultima_semana_participacion || '-'}</span>
                                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">Última Vez</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 size={14} className="text-slate-400 dark:text-slate-500" /> Actividad Económica
                            </h3>
                            <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                {entrepreneur.actividad_economica || 'Sin descripción detallada.'}
                            </div>
                        </div>

                        {/* Contact Group */}
                        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
                            {/* Decorative Background Icon */}
                            <User className="absolute -right-4 -bottom-4 text-slate-50 dark:text-slate-700/30 w-32 h-32 -rotate-12" strokeWidth={1} />

                            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2 relative z-10">
                                <User size={14} className="text-slate-400 dark:text-slate-500" /> Información de Contacto
                            </h3>

                            <div className="space-y-4 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-600">
                                        <User size={18} strokeWidth={1.5} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Persona de Contacto</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{entrepreneur.persona_contacto}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0 border border-green-100 dark:border-green-800">
                                            <Phone size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Teléfono</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{entrepreneur.telefono}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-800">
                                            <MapPin size={18} strokeWidth={1.5} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Ciudad</p>
                                            <p className="text-sm font-bold text-slate-800 dark:text-white">{entrepreneur.ciudad || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 border border-orange-100 dark:border-orange-800">
                                        <Mail size={18} strokeWidth={1.5} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Correo Electrónico</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white break-all">{entrepreneur.correo || 'No registrado'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Red Social</h3>
                                <div className="flex-1 flex items-center">
                                    {socialInfo ? (
                                        <a
                                            href={socialInfo.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors group"
                                        >
                                            {socialInfo.type === 'instagram' && <Instagram size={24} className="text-pink-600 dark:text-pink-500" strokeWidth={1.5} />}
                                            {socialInfo.type === 'tiktok' && (
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-black dark:text-white">
                                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                                </svg>
                                            )}
                                            {socialInfo.type === 'facebook' && <Facebook size={24} className="text-blue-600 dark:text-blue-500" strokeWidth={1.5} />}
                                            {socialInfo.type === 'web' && <Globe size={24} className="text-slate-500 dark:text-slate-400" strokeWidth={1.5} />}

                                            <div className="overflow-hidden min-w-0">
                                                <p className="text-sm font-bold text-slate-700 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                                                    {socialInfo.label}
                                                </p>
                                            </div>
                                        </a>
                                    ) : (
                                        <div className="w-full text-slate-400 text-sm italic text-center py-2">
                                            No registrada
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-full">
                                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Identificación</h3>
                                <div className="flex-1 flex flex-col justify-center gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400 dark:text-slate-500">RUC</span>
                                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300">{entrepreneur.ruc || 'N/A'}</span>
                                    </div>
                                    <div className="h-px bg-slate-100 dark:bg-slate-700"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">ID S.</span>
                                        <span className="text-xs font-mono text-slate-500">#{entrepreneur.id}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shrink-0 flex flex-col gap-3">
                    <button
                        className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:bg-black dark:hover:bg-slate-100 hover:shadow-slate-900/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                        onClick={() => {
                            handleClose();
                            if (onEdit) onEdit(entrepreneur);
                        }}
                    >
                        <Edit size={18} strokeWidth={1.5} /> Editar Información Completa
                    </button>
                    {onDelete && (
                        <button
                            type="button"
                            className="w-full py-3.5 rounded-xl bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 font-bold border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800 hover:text-red-700 dark:hover:text-red-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                            onClick={handleDelete}
                        >
                            <Trash2 size={18} strokeWidth={1.5} /> Eliminar Emprendedor
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
