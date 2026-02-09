import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Send from 'lucide-react/dist/esm/icons/send';
import Mail from 'lucide-react/dist/esm/icons/mail';
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import Search from 'lucide-react/dist/esm/icons/search';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Copy from 'lucide-react/dist/esm/icons/copy';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import Check from 'lucide-react/dist/esm/icons/check';
import User from 'lucide-react/dist/esm/icons/user';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Clock from 'lucide-react/dist/esm/icons/clock';
import { useToast } from '../context/ToastContext';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ShineBorder } from './ui/ShineBorder';
import EntrepreneurDetail from './EntrepreneurDetail';

export default function InvitationsDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { entrepreneurs, customSurveys, addInvitationLog, addInvitationLogBatch, invitationLogs } = useData();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // State for Filter/Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [invitationStatus, setInvitationStatus] = useState('all'); // 'all', 'invited', 'not_invited'
    const [filterWithRuc, setFilterWithRuc] = useState(() => {
        const saved = localStorage.getItem('invitations_filterWithRuc');
        return saved ? JSON.parse(saved) : false;
    });
    const [selectedEntrepreneurs, setSelectedEntrepreneurs] = useState(() => {
        const saved = localStorage.getItem('invitations_selectedEntrepreneurs');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('invitations_filterWithRuc', JSON.stringify(filterWithRuc));
    }, [filterWithRuc]);

    useEffect(() => {
        localStorage.setItem('invitations_selectedEntrepreneurs', JSON.stringify([...selectedEntrepreneurs]));
    }, [selectedEntrepreneurs]);

    // State for Details Modal
    const [selectedDetailEntrepreneur, setSelectedDetailEntrepreneur] = useState(null);
    const longPressTimer = useRef(null);

    const handleTouchStart = (entrepreneur) => {
        longPressTimer.current = setTimeout(() => {
            setSelectedDetailEntrepreneur(entrepreneur);
        }, 500); // 500ms for long press
    };

    const handleTouchEnd = () => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    };

    // State for Message Configuration
    const [messageTemplate, setMessageTemplate] = useState('taller_rentabilidad');
    const [customSubject, setCustomSubject] = useState('');
    const [customBody, setCustomBody] = useState('');
    const [attachedSurveyId, setAttachedSurveyId] = useState('');
    const [showHistory, setShowHistory] = useState(false);

    // Filter Logs: Show all bulk_email logs (removes test whatsapp spam)
    const validInvitationLogs = useMemo(() => {
        const filtered = invitationLogs.filter(log => {
            // Only show bulk_email channel (excludes whatsapp test spam)
            return log.channel === 'bulk_email' || log.channel === 'whatsapp' || log.channel === 'email';
        });
        // Deduplicate: Keep one log per entrepreneur (optional, maybe we want history)
        // For history view we want ALL, but let's keep it simple for now or showing latest
        return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [invitationLogs]);

    // State for Manual Confirmation
    const [confirmingEntrepreneur, setConfirmingEntrepreneur] = useState(null);
    const [isSending, setIsSending] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const categories = useMemo(() => {
        if (!Array.isArray(entrepreneurs)) return [];
        return [...new Set(entrepreneurs.map(e => e.categoria_principal))].sort();
    }, [entrepreneurs]);

    const filteredEntrepreneurs = useMemo(() => {
        if (!Array.isArray(entrepreneurs)) return [];
        return entrepreneurs.filter(e => {
            if (selectedCategory && e.categoria_principal !== selectedCategory) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    e.nombre_emprendimiento?.toLowerCase().includes(term) ||
                    e.persona_contacto?.toLowerCase().includes(term) ||
                    e.nombres?.toLowerCase().includes(term) ||
                    e.apellidos?.toLowerCase().includes(term) ||
                    e.correo?.toLowerCase().includes(term)
                );
            }
            if (filterWithRuc && !e.ruc) return false; // Revert to checking 'ruc' field as per original code

            // Invitation Status Filter - CONTEXT AWARE
            if (invitationStatus !== 'all') {
                // Determine which templates count as "Invited" for the current context
                let relevantTemplates = [messageTemplate];

                // Special Case: "Reminder" context looks for the ORIGINAL invitation
                if (messageTemplate === 'recordatorio_taller') {
                    relevantTemplates = ['taller_rentabilidad'];
                }

                // USE VALID LOGS HERE
                const hasBeenInvited = validInvitationLogs.some(log =>
                    log.entrepreneur_id === e.id &&
                    relevantTemplates.includes(log.template)
                );

                if (invitationStatus === 'invited' && !hasBeenInvited) return false;
                if (invitationStatus === 'not_invited' && hasBeenInvited) return false;
            }

            return true;
        });
    }, [entrepreneurs, selectedCategory, searchTerm, filterWithRuc, invitationStatus, validInvitationLogs, messageTemplate]);

    const handleSelectAll = () => {
        if (selectedEntrepreneurs.size === filteredEntrepreneurs.length) {
            setSelectedEntrepreneurs(new Set());
        } else {
            setSelectedEntrepreneurs(new Set(filteredEntrepreneurs.map(e => e.id)));
        }
    };

    const toggleSelection = (id) => {
        const newSet = new Set(selectedEntrepreneurs);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedEntrepreneurs(newSet);
    };

    // Template Logic
    const getMessageContent = (entrepreneur) => {
        let subject = "";
        let body = "";
        const name = entrepreneur?.persona_contacto || entrepreneur?.nombres || "Emprendedor";

        // Survey Link
        let surveyLink = "";
        if (attachedSurveyId) {
            surveyLink = `${window.location.origin}/forms/${attachedSurveyId}`;
        }

        if (messageTemplate === 'taller_rentabilidad') {
            subject = "[INVITACION]: Taller Práctico de Costos y Fijación del Precio Ideal";
            body = `Hola ${name} 👋,\n\nEsperamos que te encuentres excelente.\n\nTe escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al taller: RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal\n\nDirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.\n\n📝 Detalles del Taller:\n📅 Fecha: Martes, 20 de Enero 2026\n⏰ Hora: 10:00 - 13:00\n📍 Lugar: UNEMI - Bloque H, Aula 106\n👩‍🏫 Capacitadora: Msc. Dolores Mieles\n🧠 Modalidad: Presencial\n⚠️ Nota: Este es un taller práctico que se realiza en aula con computadoras. Se requiere manejo básico de herramientas digitales.\n\n🚨 Cupos limitados, no te quedes fuera y asegura tu participación.\n\n${surveyLink ? `👉 Regístrate aquí: ${surveyLink}\n\n` : ''}¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!\n\nSaludos,\nEquipo Emprendimiento UNEMI`;
        } else if (messageTemplate === 'recordatorio_taller') {
            subject = "🚀 RECORDATORIO: Taller de Costos - Mañana";
            body = `Hola ${name},\n\nTe recordamos que mañana es el Taller de Costos y Rentabilidad en UNEMI.\n\n📍 Bloque H, Aula 106\n⏰ 10:00 AM\n\n¡Te esperamos!`;
        } else {
            subject = customSubject || "Invitación UNEMI Emprende";
            body = customBody || `Hola ${name},\n\nTe invitamos a participar en...`;
            if (surveyLink) body += `\n\nLink de registro: ${surveyLink}`;
        }

        return { subject, body };
    };

    const handleWhatsAppClick = (entrepreneur) => {
        if (!entrepreneur.telefono) {
            addToast("Este emprendedor no tiene número de teléfono registrado.", "error");
            return;
        }

        const { body } = getMessageContent(entrepreneur);

        let phone = entrepreneur.telefono.replace(/\s+/g, '').replace(/-/g, '');
        if (phone.startsWith('09')) {
            phone = '593' + phone.substring(1);
        }

        const encodedBody = encodeURIComponent(body);
        const url = `https://wa.me/${phone}?text=${encodedBody}`;
        window.open(url, '_blank');

        // Ask for confirmation instead of auto-logging
        setConfirmingEntrepreneur(entrepreneur);
    };

    const confirmWhatsAppSent = async () => {
        if (!confirmingEntrepreneur) return;

        await addInvitationLog({
            entrepreneur_id: confirmingEntrepreneur.id,
            entrepreneur_name: confirmingEntrepreneur.nombre_emprendimiento || `${confirmingEntrepreneur.nombres} ${confirmingEntrepreneur.apellidos}`,
            channel: 'whatsapp',
            template: messageTemplate,
            status: 'sent'
        });

        addToast(`Invitación registrada para ${confirmingEntrepreneur.nombre_emprendimiento}`, 'success');
        setConfirmingEntrepreneur(null);
    };

    const handleBulkEmail = async () => {
        if (selectedEntrepreneurs.size === 0) {
            addToast("Por favor selecciona al menos un emprendedor.", "error");
            return;
        }

        const recipients = entrepreneurs.filter(e => selectedEntrepreneurs.has(e.id));
        const emails = recipients.map(e => e.correo).filter(email => email && email.includes('@'));

        if (emails.length === 0) {
            addToast("Ninguno de los emprendedores seleccionados tiene un correo válido.", "error");
            return;
        }

        // Check how many have valid emails
        const invalidCount = recipients.length - emails.length;
        const warningMsg = invalidCount > 0
            ? `\n\n⚠️ ${invalidCount} emprendedores no tienen correo válido y serán excluidos.`
            : '';

        // STEP 1: Initial confirmation
        if (!window.confirm(`¿Preparar envío para ${emails.length} emprendedores?${warningMsg}\n\nSe copiarán los correos al portapapeles y se abrirá Gmail.`)) {
            return;
        }

        const { subject } = getMessageContent({}); // Get subject from template

        // STEP 2: Copy ALL emails to clipboard (regardless of list size)
        const emailString = emails.join(', ');
        try {
            await navigator.clipboard.writeText(emailString);
            addToast(`✅ ${emails.length} correos copiados al portapapeles${invalidCount > 0 ? ` (${invalidCount} sin correo)` : ''}`, "success");
        } catch (e) {
            console.error("Clipboard error:", e);
            addToast("Error al copiar. Hazlo manualmente.", "error");
        }

        // STEP 3: Open Gmail (with subject only, no BCC - user will paste)
        const to = "emprendimiento_innovacion@unemi.edu.ec";
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}`;

        setIsSending(true);
        window.open(gmailUrl, '_blank');

        // STEP 4: Show instructions and ask for confirmation AFTER sending
        // Small delay to let the window open
        setTimeout(async () => {
            const didSend = window.confirm(
                `📧 INSTRUCCIONES DE ENVÍO:\n\n` +
                `1. En Gmail, haz clic en "CCO" (BCC)\n` +
                `2. Pega los correos (ya están en tu portapapeles) con Ctrl+V\n` +
                `3. Redacta o pega el mensaje\n` +
                `4. Envía el correo\n\n` +
                `⚠️ ¿CONFIRMAS QUE ENVIASTE EL CORREO?\n` +
                `Presiona "Aceptar" para registrar el envío en el historial.\n` +
                `Presiona "Cancelar" si no lo enviaste.`
            );

            // STEP 5: Only log if user confirms they sent
            if (didSend) {
                // Batch log
                const logs = recipients.map(e => ({
                    entrepreneur_id: e.id,
                    entrepreneur_name: e.nombre_emprendimiento || `${e.nombres} ${e.apellidos}`,
                    channel: 'bulk_email',
                    template: messageTemplate,
                    status: 'sent',
                    created_at: new Date().toISOString()
                }));

                // Assuming addInvitationLogBatch exists, otherwise loop
                if (addInvitationLogBatch) {
                    await addInvitationLogBatch(logs);
                } else {
                    for (const log of logs) await addInvitationLog(log);
                }

                addToast(`✅ Registradas ${recipients.length} invitaciones`, "success");
                setSelectedEntrepreneurs(new Set());
            } else {
                addToast("Envío cancelado. No se registraron invitaciones.", "warning");
            }
            setIsSending(false);
        }, 1000);
    };

    const handleEmailClick = (entrepreneur) => {
        if (!entrepreneur.correo) {
            addToast("Este emprendedor no tiene correo registrado.", "error");
            return;
        }

        const { subject, body } = getMessageContent(entrepreneur);
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(entrepreneur.correo)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailUrl, '_blank');

        // Log Invitation
        addInvitationLog({
            entrepreneur_id: entrepreneur.id,
            entrepreneur_name: entrepreneur.nombre_emprendimiento || `${entrepreneur.nombres} ${entrepreneur.apellidos}`,
            channel: 'email',
            template: messageTemplate,
            status: 'initiated'
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 flex items-center px-4 justify-between border-b border-slate-200 dark:border-white/5">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Send size={16} />
                    </div>
                    <span className="text-slate-800 dark:text-white">Invitaciones</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200 dark:border-white/5 shadow-2xl transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-16 lg:pt-0 flex flex-col
            `}>
                <div className="hidden lg:block p-8 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 ring-4 ring-orange-50 dark:ring-orange-900/20">
                            <Send size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl leading-tight text-slate-900 dark:text-white tracking-tight">Invitaciones</h1>
                            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-thin">
                    <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="p-2 bg-white/20 dark:bg-black/10 rounded-xl group-hover:bg-white/30 transition-colors">
                            <Send size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold">Enviar Mensajes</span>
                            <span className="text-xs opacity-70 font-medium">Gestión de campañas</span>
                        </div>
                    </button>

                    <button onClick={() => setShowHistory(true)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] group">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 group-hover:text-orange-500">
                            <Clock size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Historial</span>
                            <span className="text-xs opacity-70 font-medium">Ver envíos recientes</span>
                        </div>
                    </button>

                    <button onClick={() => navigate('/portal')} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all group mt-auto">
                        <div className="p-2 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
                            <LogOut size={20} />
                        </div>
                        <span className="font-bold">Volver al Portal</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-4 lg:p-8 pt-20 lg:pt-8 overflow-y-auto h-screen scrollbar-thin scroll-smooth">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Compact Stats Bar - Command Center Style */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                                <Mail size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Emails</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                    {validInvitationLogs.filter(l => l.channel === 'bulk_email').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                            <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
                                <MessageCircle size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WhatsApp</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                    {validInvitationLogs.filter(l => l.channel === 'whatsapp').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl text-orange-600 dark:text-orange-400">
                                <Check size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Impactados</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                    {new Set(validInvitationLogs.map(l => l.entrepreneur_id)).size}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:scale-[1.02] transition-transform">
                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                                <User size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Base</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                                    {entrepreneurs.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: Configuration (Sticky) */}
                        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-8 h-fit">
                            {/* 1. Configuration Panel - CLEAN & FOCUSED */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-sm border border-slate-200 dark:border-white/5 relative overflow-hidden">
                                <h2 className="text-xl font-black text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 font-black text-sm">1</div>
                                    Configuración
                                </h2>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Mensaje</Label>
                                        <div className="relative group">
                                            <select
                                                value={messageTemplate}
                                                onChange={(e) => setMessageTemplate(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5"
                                            >
                                                <option value="taller_rentabilidad">🌱 Taller Rentabilidad</option>
                                                <option value="recordatorio_taller">🚀 Recordatorio: ¡Mañana!</option>
                                                <option value="custom">✍️ Personalizado</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-y-[10%] transition-transform">
                                                <ChevronDown className="text-slate-400" size={16} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Adjunto (Opcional)</Label>
                                        <div className="relative group">
                                            <select
                                                value={attachedSurveyId}
                                                onChange={(e) => setAttachedSurveyId(e.target.value)}
                                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl appearance-none outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-sm text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5"
                                            >
                                                <option value="">-- Ninguno --</option>
                                                {customSurveys.map(s => (
                                                    <option key={s.id} value={s.id}>📝 {s.title}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors">
                                                <Sparkles size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {messageTemplate === 'custom' && (
                                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                            <input
                                                type="text"
                                                placeholder="Asunto..."
                                                value={customSubject}
                                                onChange={e => setCustomSubject(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 border border-slate-200 dark:border-white/5 font-bold"
                                            />
                                            <textarea
                                                placeholder="Contenido del mensaje..."
                                                value={customBody}
                                                onChange={e => setCustomBody(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 border border-slate-200 dark:border-white/5 font-medium resize-none shadow-sm"
                                            />
                                        </div>
                                    )}

                                    {/* Clean Email Preview */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista Previa</div>
                                        </div>
                                        <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-h-[300px] overflow-y-auto scrollbar-thin">
                                            <p className="mb-2 font-bold text-slate-800 dark:text-white">{getMessageContent({}).subject}</p>
                                            <div className="opacity-80 whitespace-pre-wrap">
                                                {getMessageContent({ persona_contacto: "[Nombre]" }).body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Audience - Split View */}
                        <div className="xl:col-span-8 flex flex-col h-full min-h-[500px]">
                            {/* 2. Unified Filter Toolbar - COMMAND CENTER UI */}
                            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-2 shadow-sm mb-6 flex flex-col sm:flex-row gap-2 sticky top-[100px] z-20">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Buscar emprendedor..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-transparent font-bold text-sm text-slate-700 dark:text-slate-200 outline-none placeholder:text-slate-400"
                                    />
                                </div>

                                {/* Divider */}
                                <div className="hidden sm:block w-px bg-slate-200 dark:bg-white/10 my-1"></div>

                                {/* Category */}
                                <div className="relative min-w-[160px]">
                                    <select
                                        value={selectedCategory}
                                        onChange={e => setSelectedCategory(e.target.value)}
                                        className="w-full pl-3 pr-8 py-2.5 bg-transparent font-bold text-sm text-slate-700 dark:text-slate-200 outline-none appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} strokeWidth={3} />
                                </div>

                                {/* Filter Separator / Tools */}
                                <div className="flex items-center gap-2 pl-2">
                                    <div className="h-full w-px bg-slate-200 dark:bg-white/10 mx-1"></div>

                                    {/* Status Toggle (Simple) */}
                                    <button
                                        onClick={() => setInvitationStatus(invitationStatus === 'all' ? 'not_invited' : 'all')}
                                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${invitationStatus !== 'all' ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                        title={invitationStatus === 'all' ? "Filtrar por pendientes" : "Mostrar todos"}
                                    >
                                        <Filter size={16} strokeWidth={2.5} />
                                        <span>{invitationStatus === 'all' ? 'Filtrar' : 'Pendientes'}</span>
                                    </button>

                                    {/* RUC Toggle */}
                                    <button
                                        onClick={() => setFilterWithRuc(!filterWithRuc)}
                                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${filterWithRuc ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                        title="Con RUC"
                                    >
                                        <FileText size={16} strokeWidth={2.5} />
                                        <span>Con RUC</span>
                                    </button>

                                    {/* Select All */}
                                    <button
                                        onClick={handleSelectAll}
                                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${selectedEntrepreneurs.size > 0 && selectedEntrepreneurs.size === filteredEntrepreneurs.length ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                        title="Seleccionar Todos"
                                    >
                                        <Check size={16} strokeWidth={2.5} />
                                        <span className="hidden sm:inline">Todos</span>
                                    </button>
                                </div>
                            </div>

                            {/* Selection Action Bar (Appears when items selected) */}
                            {selectedEntrepreneurs.size > 0 && (
                                <div className="animate-in slide-in-from-top-2 fade-in duration-200 mb-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl p-4 flex items-center justify-between shadow-lg ring-1 ring-black/5">
                                    <div className="flex items-center gap-4">
                                        <div className="font-black text-lg pl-2">
                                            {selectedEntrepreneurs.size} <span className="text-sm font-bold opacity-70 uppercase tracking-wide">Seleccionados</span>
                                        </div>
                                        <button onClick={() => setSelectedEntrepreneurs(new Set())} className="text-xs font-bold underline opacity-60 hover:opacity-100">
                                            Borrar selección
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleBulkEmail}
                                            disabled={isSending}
                                            className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Mail size={16} strokeWidth={3} />
                                            <span>Enviar Email</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* List Results - Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 pb-24">
                                {filteredEntrepreneurs.length === 0 && (
                                    <div className="py-20 text-center col-span-full">
                                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                            <Search size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">No encontramos emprendedores</h3>
                                        <p className="text-slate-500 font-medium">Intenta ajustar los filtros o buscar con otro término.</p>
                                    </div>
                                )}
                                {filteredEntrepreneurs.slice(0, 50).map(entrepreneur => {
                                    const isSelected = selectedEntrepreneurs.has(entrepreneur.id);
                                    const hasEmail = entrepreneur.correo;
                                    const hasWhatsapp = entrepreneur.telefono;

                                    return (
                                        <div
                                            key={entrepreneur.id}
                                            onClick={() => toggleSelection(entrepreneur.id)}
                                            onTouchStart={() => handleTouchStart(entrepreneur)}
                                            onTouchEnd={handleTouchEnd}
                                            onMouseDown={() => handleTouchStart(entrepreneur)}
                                            onMouseUp={handleTouchEnd}
                                            onMouseLeave={handleTouchEnd}
                                            className={`group relative p-3 rounded-2xl transition-all duration-200 flex items-start gap-3 cursor-pointer select-none border
                                            ${isSelected
                                                    ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-500/30 shadow-none'
                                                    : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5 hover:border-orange-200 dark:hover:border-orange-500/20 hover:shadow-sm'
                                                }`}
                                        >
                                            {/* Selection Dot */}
                                            <div className={`mt-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-orange-300'}`}>
                                                {isSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-orange-900 dark:text-orange-100' : 'text-slate-800 dark:text-slate-200'}`}>
                                                        {entrepreneur.nombre_emprendimiento || "Sin nombre"}
                                                    </h3>
                                                    {entrepreneur.ruc_activo && <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-[9px] font-black text-blue-600 dark:text-blue-300 uppercase">RUC</span>}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-2">
                                                    {entrepreneur.nombres} {entrepreneur.apellidos}
                                                </p>

                                                <div className="flex items-center gap-2">
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${hasEmail ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-red-50 text-red-400 opacity-50'}`}>
                                                        <Mail size={10} /> {hasEmail ? 'Email' : 'No Email'}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${hasWhatsapp ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-red-50 text-red-400 opacity-50'}`}>
                                                        <MessageCircle size={10} /> {hasWhatsapp ? 'W.App' : 'No #'}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Quick Actions (Hover) */}
                                            <div className="hidden group-hover:flex absolute right-2 top-2 gap-1 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-100 dark:border-white/5 shadow-lg animate-in fade-in zoom-in duration-200">
                                                <button onClick={(e) => { e.stopPropagation(); handleWhatsAppClick(entrepreneur); }} className="p-1.5 hover:bg-green-50 text-slate-400 hover:text-green-600 rounded-md transition-colors"><MessageCircle size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); handleEmailClick(entrepreneur); }} className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-md transition-colors"><Mail size={14} /></button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowHistory(false)}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl max-h-[85vh] flex flex-col animate-in scale-in-95 fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                                <Clock size={28} className="text-orange-500" />
                                Historial de Envíos
                            </h2>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-red-500">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto scrollbar-thin p-0">
                            {(validInvitationLogs && validInvitationLogs.length > 0) ? (
                                <div className="divide-y divide-slate-100 dark:divide-white/5">
                                    {validInvitationLogs.map(log => {
                                        // Find recipient details
                                        const recipient = entrepreneurs.find(e => e.id === log.entrepreneur_id);

                                        return (
                                            <div key={log.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <div className="flex items-start justify-between gap-4 mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">
                                                            {log.entrepreneur_name}
                                                        </h4>
                                                        {recipient && (
                                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                                                {log.channel === 'whatsapp' && recipient.telefono ? (
                                                                    <span className="flex items-center gap-1"><MessageCircle size={10} /> {recipient.telefono}</span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1"><Mail size={10} /> {recipient.correo}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-2 uppercase tracking-wider">
                                                            <span className={`flex items-center gap-1 ${log.channel === 'whatsapp' ? 'text-green-500' : 'text-blue-500'}`}>
                                                                {log.channel === 'whatsapp' ? <MessageCircle size={12} /> : <Mail size={12} />}
                                                                {log.channel === 'whatsapp' ? 'WhatsApp' : log.channel === 'bulk_email' ? 'Email Masivo' : 'Email'}
                                                            </span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                        {log.status === 'initiated' ? 'Enviado' : log.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm bg-slate-50 dark:bg-black/20 p-3 rounded-xl text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-white/5 flex items-center gap-2">
                                                    <span className="font-bold text-slate-400 text-xs uppercase">Plantilla:</span>
                                                    {log.template === 'taller_rentabilidad' ? 'Taller Rentabilidad' : log.template === 'recordatorio_taller' ? 'Recordatorio Taller 🚀' : 'Mensaje Personalizado'}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Clock size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-white">Sin historial</h3>
                                    <p className="text-slate-400 text-sm">Aún no se han registrado envíos recientes.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Entrepreneur Detail Modal */}
            <EntrepreneurDetail
                entrepreneur={selectedDetailEntrepreneur}
                onClose={() => setSelectedDetailEntrepreneur(null)}
            />

            {/* WhatsApp Confirmation Modal */}
            {confirmingEntrepreneur && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-white/5">
                        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 flex items-center justify-center mb-6 mx-auto">
                            <MessageCircle size={32} />
                        </div>
                        <h3 className="text-xl font-black text-center text-slate-800 dark:text-white mb-2">
                            ¿Enviaste el mensaje a {confirmingEntrepreneur.nombre_emprendimiento}?
                        </h3>
                        <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium mb-8">
                            Confirma solo si completaste el envío en WhatsApp para registrarlo en el historial.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmingEntrepreneur(null)}
                                className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                No, cancelar
                            </button>
                            <button
                                onClick={confirmWhatsAppSent}
                                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 transition-colors shadow-lg shadow-green-500/30"
                            >
                                Sí, registrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
