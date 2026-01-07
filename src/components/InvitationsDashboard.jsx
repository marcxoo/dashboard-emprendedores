import { useState, useMemo, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Send, Mail, MessageCircle, Search, Filter, Copy, ExternalLink, ChevronDown, Check, User, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import EntrepreneurDetail from './EntrepreneurDetail';

export default function InvitationsDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { entrepreneurs, customSurveys, addInvitationLog } = useData();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // State for Filter/Selection
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedEntrepreneurs, setSelectedEntrepreneurs] = useState(new Set());

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

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const categories = useMemo(() => [...new Set(entrepreneurs.map(e => e.categoria_principal))].sort(), [entrepreneurs]);

    const filteredEntrepreneurs = useMemo(() => {
        return entrepreneurs.filter(e => {
            if (selectedCategory && e.categoria_principal !== selectedCategory) return false;
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                return (
                    e.nombre_emprendimiento?.toLowerCase().includes(term) ||
                    e.persona_contacto?.toLowerCase().includes(term) ||
                    e.correo?.toLowerCase().includes(term)
                );
            }
            return true;
        });
    }, [entrepreneurs, selectedCategory, searchTerm]);

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
        const name = entrepreneur?.persona_contacto || "Emprendedor";

        // Survey Link
        let surveyLink = "";
        if (attachedSurveyId) {
            surveyLink = `${window.location.origin}/forms/${attachedSurveyId}`;
        }

        if (messageTemplate === 'taller_rentabilidad') {
            subject = "[INVITACION]: Taller Práctico de Costos y Fijación del Precio Ideal";
            body = `Hola ${name} 👋,\n\nEsperamos que te encuentres excelente.\n\nTe escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al curso:\n\n✨ *RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal* ✨\n\nDirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.\n\n📝 *Detalles del Evento:*\n📅 *Fecha:* 20 de Enero\n⏰ *Hora:* 10:00 - 13:00\n📍 *Lugar:* UNEMI - Bloque H, Aula 106\n👩‍🏫 *Capacitadora:* Msc. Dolores Mieles\n🧠 *Modalidad:* Presencial\n\n${surveyLink ? `👉 *Regístrate aquí:* ${surveyLink}\n\n` : ''}¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!\n\nSaludos,\nEquipo Emprende UNEMI`;
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

        // Log Invitation
        addInvitationLog({
            entrepreneur_id: entrepreneur.id,
            entrepreneur_name: entrepreneur.nombre_emprendimiento,
            channel: 'whatsapp',
            template: messageTemplate,
            status: 'initiated'
        });
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

        // Generic Content for Bulk
        let subject = "";
        let body = "";

        let surveyLink = "";
        if (attachedSurveyId) {
            surveyLink = `${window.location.origin}/forms/${attachedSurveyId}`;
        }

        if (messageTemplate === 'taller_rentabilidad') {
            subject = "[INVITACION]: Taller Práctico de Costos y Fijación del Precio Ideal";
            body = `Hola Emprendedor/a 👋,\n\nEsperamos que te encuentres excelente.\n\nTe escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al curso:\n\n✨ *RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal* ✨\n\nDirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.\n\n📝 *Detalles del Evento:*\n📅 *Fecha:* 20 de Enero\n⏰ *Hora:* 10:00 - 13:00\n📍 *Lugar:* UNEMI - Bloque H, Aula 106\n👩‍🏫 *Capacitadora:* Msc. Dolores Mieles\n🧠 *Modalidad:* Presencial\n\n${surveyLink ? `👉 *Regístrate aquí:* ${surveyLink}\n\n` : ''}¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!\n\nSaludos,\nEquipo Emprende UNEMI`;
        } else {
            subject = customSubject || "Invitación UNEMI Emprende";
            body = customBody || `Hola Emprendedor/a,\n\nTe invitamos a participar en...`;
            if (surveyLink) body += `\n\nLink de registro: ${surveyLink}`;
        }

        // HTML Body for Clipboard (Generic)
        const htmlBody = `
            <div style="font-family: sans-serif; color: #000;">
                <p>Hola Emprendedor/a 👋,</p>
                <p>Esperamos que te encuentres excelente.</p>
                ${messageTemplate === 'taller_rentabilidad' ? `
                <p>Te escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al curso:</p>
                <p>✨ <strong>RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal</strong> ✨</p>
                <p>Dirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.</p>
                <p>📝 <strong>Detalles del Evento:</strong><br>
                📅 <strong>Fecha:</strong> 20 de Enero<br>
                ⏰ <strong>Hora:</strong> 10:00 - 13:00<br>
                📍 <strong>Lugar:</strong> UNEMI - Bloque H, Aula 106<br>
                👩‍🏫 <strong>Capacitadora:</strong> Msc. Dolores Mieles<br>
                🧠 <strong>Modalidad:</strong> Presencial</p>
                ` : `<p>${body.replace(/\n/g, '<br>')}</p>`}
                ${surveyLink ? `<p>👉 <strong>Regístrate aquí:</strong> <a href="${surveyLink}">${surveyLink}</a></p>` : ''}
                <p>¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!</p>
                <p>Saludos,<br>Equipo Emprende UNEMI</p>
            </div>
        `;

        const to = "emprendimiento_innovacion@unemi.edu.ec";
        const bcc = emails.join(',');

        // Open window immediately to avoid popup blocker (blank first)
        const win = window.open('about:blank', '_blank');

        try {
            const blobHtml = new Blob([htmlBody], { type: "text/html" });
            const blobText = new Blob([body], { type: "text/plain" });
            const data = [new ClipboardItem({
                ["text/html"]: blobHtml,
                ["text/plain"]: blobText
            })];
            await navigator.clipboard.write(data);
            addToast(`Copiado al portapapeles. Se abrirá Gmail (BCC: ${emails.length}).`, "success");
        } catch (err) {
            console.error("Error copying to clipboard:", err);
            addToast("Error al copiar al portapapeles.", "error");
        }

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}`;

        if (win) {
            win.location.href = gmailUrl;
        } else {
            // Fallback if blocker caught it (unlikely with synchronous open)
            window.open(gmailUrl, '_blank');
        }

        // Log Bulk Invitations
        recipients.forEach(e => {
            addInvitationLog({
                entrepreneur_id: e.id,
                entrepreneur_name: e.nombre_emprendimiento,
                channel: 'bulk_email',
                template: messageTemplate,
                status: 'initiated'
            });
        });
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
            entrepreneur_name: entrepreneur.nombre_emprendimiento,
            channel: 'email',
            template: messageTemplate,
            status: 'initiated'
        });
    };

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50 flex items-center px-4 justify-between border-b border-slate-200 dark:border-white/5">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
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
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 shadow-2xl transition-transform duration-300 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-16 lg:pt-0 flex flex-col
            `}>
                <div className="hidden lg:block p-8 border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 ring-4 ring-green-50 dark:ring-green-900/20">
                            <Send size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl leading-tight text-slate-900 dark:text-white tracking-tight">Invitaciones</h1>
                            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">Dashboard</p>
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

                    <div className="px-4 py-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-center text-sm font-medium">
                        Más módulos pronto...
                    </div>
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/portal')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white hover:shadow-md dark:hover:bg-white/5 transition-all text-sm font-bold group">
                            <LogOut className="rotate-180 text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors" size={18} />
                            Portal Principal
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 hover:shadow-md dark:hover:bg-red-500/10 transition-all text-sm font-bold group">
                            <LogOut size={18} className="text-red-400 group-hover:text-red-500 transition-colors" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-20 lg:pt-8 bg-slate-50 dark:bg-slate-950 transition-all duration-300">
                <div className="p-4 lg:p-10 max-w-[1600px] mx-auto space-y-8 pb-32">

                    {/* Header Desktop */}
                    <div className="hidden lg:flex items-end justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Panel de Envíos</h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Gestiona y envía invitaciones a tu base de emprendedores.</p>
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                                <span className="relative w-2.5 h-2.5 block rounded-full bg-green-500"></span>
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Sistema Operativo</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Configuration (Sticky) */}
                        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-8">
                            {/* 1. Configuration Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                {/* Decorational Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors duration-500"></div>

                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black border border-slate-200 dark:border-slate-700 shadow-sm text-lg">1</div>
                                    Configuración
                                </h2>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Plantilla de Mensaje</Label>
                                        <div className="relative group">
                                            <select
                                                value={messageTemplate}
                                                onChange={(e) => setMessageTemplate(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                                            >
                                                <option value="taller_rentabilidad">🌱 Taller Rentabilidad Garantizada</option>
                                                <option value="custom">✍️ Mensaje Personalizado</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-y-[-10%] transition-transform">
                                                <ChevronDown className="text-slate-400" size={20} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Adjuntar Formulario</Label>
                                        <div className="relative group">
                                            <select
                                                value={attachedSurveyId}
                                                onChange={(e) => setAttachedSurveyId(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                                            >
                                                <option value="">-- Sin formulario extra --</option>
                                                {customSurveys.map(s => (
                                                    <option key={s.id} value={s.id}>📝 {s.title}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-green-500 transition-colors bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                                                <Sparkles size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {messageTemplate === 'custom' && (
                                        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300 p-5 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-200 dark:border-slate-700/50 border-dashed">
                                            <input
                                                type="text"
                                                placeholder="Asunto del correo..."
                                                value={customSubject}
                                                onChange={e => setCustomSubject(e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 transition-all font-bold placeholder:font-medium"
                                            />
                                            <textarea
                                                placeholder="Hola [Nombre], te escribo para..."
                                                value={customBody}
                                                onChange={e => setCustomBody(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 transition-all font-medium resize-none placeholder:font-medium"
                                            />
                                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wide">Se adjuntará el link automáticamente si seleccionaste uno.</p>
                                        </div>
                                    )}

                                    {/* Mock Email Preview */}
                                    <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
                                        <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista Previa</div>
                                        </div>
                                        <div className="p-6 space-y-4 bg-white dark:bg-slate-900 relative">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                                <Mail size={100} />
                                            </div>

                                            <div className="space-y-2 pb-4 border-b border-slate-50 dark:border-white/5">
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-slate-400 font-bold w-12 text-right">Para:</span>
                                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                        <User size={12} className="text-slate-500" />
                                                        <span className="text-slate-700 dark:text-slate-300 font-bold">Emprendedor Ejemplo</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-xs">
                                                    <span className="text-slate-400 font-bold w-12 text-right mt-0.5">Asunto:</span>
                                                    <span className="text-slate-900 dark:text-white font-bold flex-1 leading-snug">{getMessageContent({}).subject}</span>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed py-2 h-64 overflow-y-auto scrollbar-thin font-medium">
                                                {getMessageContent({ persona_contacto: "[Nombre]" }).body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Selection & Table */}
                        <div className="xl:col-span-8 space-y-6">
                            {/* 2. Selection Section */}
                            <div className="flex flex-col h-full">
                                {/* Header / Controls */}
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/50 dark:shadow-none mb-6">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                                            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black border border-slate-200 dark:border-slate-700 shadow-sm text-lg">2</div>
                                            Destinatarios
                                            <span className="ml-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-xl font-black border border-green-100 dark:border-green-500/20 min-w-[2rem] text-center">
                                                {filteredEntrepreneurs.length}
                                            </span>
                                        </h2>

                                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                            <div className="relative flex-1 md:min-w-[280px]">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} strokeWidth={2.5} />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar por nombre, correo..."
                                                    value={searchTerm}
                                                    onChange={e => setSearchTerm(e.target.value)}
                                                    className="pl-11 pr-4 py-3 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
                                                />
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={selectedCategory}
                                                    onChange={e => setSelectedCategory(e.target.value)}
                                                    className="pl-4 pr-10 py-3 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="">Todas las categorías</option>
                                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Select All Toggle */}
                                    <div className="mt-6 flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-xl transition-colors cursor-pointer select-none" onClick={handleSelectAll}>
                                            <Checkbox
                                                checked={filteredEntrepreneurs.length > 0 && selectedEntrepreneurs.size === filteredEntrepreneurs.length}
                                                onCheckedChange={handleSelectAll}
                                                id="select-all"
                                                className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 w-6 h-6 rounded-lg border-2 border-slate-300 dark:border-slate-600"
                                            />
                                            <Label htmlFor="select-all" className="cursor-pointer font-bold text-slate-600 dark:text-slate-300">
                                                Seleccionar Todos ({filteredEntrepreneurs.length})
                                            </Label>
                                        </div>

                                        {selectedEntrepreneurs.size > 0 && (
                                            <span className="text-sm font-medium text-slate-400 animate-in fade-in slide-in-from-left-2">
                                                • {selectedEntrepreneurs.size} seleccionados
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* List Results */}
                                <div className="space-y-3 pb-32">
                                    {filteredEntrepreneurs.slice(0, 50).map((e, index) => {
                                        const isSelected = selectedEntrepreneurs.has(e.id);
                                        return (
                                            <div
                                                key={e.id}
                                                onTouchStart={() => handleTouchStart(e)}
                                                onTouchEnd={handleTouchEnd}
                                                onMouseDown={() => handleTouchStart(e)}
                                                onMouseUp={handleTouchEnd}
                                                onMouseLeave={handleTouchEnd}
                                                className={`group relative bg-white dark:bg-slate-900 p-4 rounded-3xl border transition-all duration-300 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 cursor-pointer select-none
                                                ${isSelected
                                                        ? 'border-green-500/50 shadow-lg shadow-green-500/10 dark:shadow-none bg-green-50/10 dark:bg-green-900/10'
                                                        : 'border-slate-100 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-200 dark:hover:border-white/10'
                                                    }`}
                                            >
                                                {/* Selection Checkbox */}
                                                <div className="pl-2" onClick={(ev) => ev.stopPropagation()}>
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelection(e.id)}
                                                        className="w-6 h-6 rounded-lg data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 border-2 border-slate-200 dark:border-slate-700"
                                                    />
                                                </div>

                                                {/* Avatar / Initials */}
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 transition-colors
                                                    ${isSelected
                                                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                                                    }
                                                `}>
                                                    {e.nombre_emprendimiento?.charAt(0) || 'E'}
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 text-center sm:text-left min-w-0">
                                                    <h3 className={`font-bold text-lg leading-tight mb-1 truncate ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {e.nombre_emprendimiento}
                                                    </h3>
                                                    {e.actividad_economica && (
                                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2 mb-2 leading-relaxed opacity-90">
                                                            {e.actividad_economica}
                                                        </p>
                                                    )}
                                                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1">
                                                            <User size={12} /> {e.persona_contacto}
                                                        </span>
                                                        <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                                                        <span className="bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg text-slate-600 dark:text-slate-300">
                                                            {e.categoria_principal}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0" onClick={(ev) => ev.stopPropagation()}>
                                                    <button
                                                        onClick={() => handleWhatsAppClick(e)}
                                                        className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-green-600 dark:text-green-400 rounded-2xl hover:bg-green-500 hover:text-white dark:hover:bg-green-500 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all hover:scale-110 active:scale-95 group/btn"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle size={20} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmailClick(e)}
                                                        className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all hover:scale-110 active:scale-95"
                                                        title="Email"
                                                    >
                                                        <Mail size={20} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {filteredEntrepreneurs.length === 0 && (
                                        <div className="py-20 text-center">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                                                <Search size={32} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No se encontraron resultados</h3>
                                            <p className="text-slate-500 dark:text-slate-400">Intenta ajustar tu búsqueda.</p>
                                        </div>
                                    )}

                                    {filteredEntrepreneurs.length > 50 && (
                                        <div className="py-8 text-center">
                                            <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 rounded-full text-xs font-bold text-slate-500 dark:text-slate-400">
                                                Mostrando los primeros 50 de {filteredEntrepreneurs.length} resultados
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Entrepreneur Detail Modal */}
                <EntrepreneurDetail
                    entrepreneur={selectedDetailEntrepreneur}
                    onClose={() => setSelectedDetailEntrepreneur(null)}
                />

                {/* Floating Bulk Action Bar */}
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${selectedEntrepreneurs.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-[200%] opacity-0'}`}>
                    <div className="bg-slate-900/90 dark:bg-white/95 backdrop-blur-xl text-white dark:text-slate-900 pl-2 pr-2 py-2 rounded-[2rem] shadow-2xl shadow-slate-900/50 dark:shadow-black/20 flex items-center gap-4 border border-white/10 dark:border-slate-200">
                        <div className="bg-slate-800 dark:bg-slate-100 px-4 py-2.5 rounded-[1.5rem] text-sm font-black flex items-center gap-2 min-w-[3.5rem] justify-center text-white dark:text-slate-900">
                            {selectedEntrepreneurs.size}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Seleccionados</span>
                            <span className="text-sm font-black leading-none">Acciones en lote</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 dark:bg-slate-200 mx-2"></div>
                        <button
                            onClick={handleBulkEmail}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-[1.5rem] font-bold transition-all shadow-lg shadow-green-600/30 hover:shadow-green-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                        >
                            <Mail size={18} strokeWidth={2.5} />
                            <span>Enviar BCC</span>
                        </button>
                        <button
                            onClick={() => setSelectedEntrepreneurs(new Set())}
                            className="p-3 hover:bg-white/10 dark:hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-red-500"
                            title="Cancelar selección"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
