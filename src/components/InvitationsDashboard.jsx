import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Send, Mail, MessageCircle, Search, Filter, Copy, ExternalLink, ChevronDown, Check, User, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 z-50 flex items-center px-4 justify-between shadow-md border-b border-slate-200 dark:border-slate-700">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
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
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 backdrop-blur-3xl bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-white/5 shadow-2xl transition-transform duration-300 ease-in-out
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
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider">Dashboard</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-3 overflow-y-auto custom-scrollbar">
                    <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl shadow-green-600/20 border border-white/10 transition-all hover:shadow-green-600/30 group">
                        <div className="p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                            <Send size={20} />
                        </div>
                        <div className="text-left">
                            <span className="block font-bold">Enviar Mensajes</span>
                            <span className="text-xs text-green-100 opacity-80">Gestión de campañas</span>
                        </div>
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20">
                    <div className="flex flex-col gap-3">
                        <button onClick={() => navigate('/portal')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white hover:shadow-md dark:hover:bg-white/5 transition-all text-sm font-semibold border border-transparent hover:border-slate-200 dark:hover:border-white/10">
                            <LogOut className="rotate-180" size={18} />
                            Portal Principal
                        </button>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 hover:shadow-md dark:hover:bg-red-500/10 transition-all text-sm font-semibold border border-transparent hover:border-red-100">
                            <LogOut size={18} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 bg-slate-50 dark:bg-slate-950 transition-all duration-300">
                <div className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-8 pb-32">

                    {/* Header Desktop */}
                    <div className="hidden lg:flex items-end justify-between mb-2">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Panel de Envíos</h1>
                            <p className="text-slate-500 dark:text-slate-400">Gestiona y envía invitaciones a tu base de emprendedores.</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-full shadow-sm border border-slate-200 dark:border-slate-800">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Sistema Operativo</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Configuration (Sticky) */}
                        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                            {/* 1. Configuration Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-3xl -z-10 group-hover:bg-green-500/10 transition-colors"></div>

                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-sm">1</div>
                                    Configuración
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Plantilla de Mensaje</label>
                                        <div className="relative group">
                                            <select
                                                value={messageTemplate}
                                                onChange={(e) => setMessageTemplate(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                                            >
                                                <option value="taller_rentabilidad">Taller Rentabilidad Garantizada</option>
                                                <option value="custom">Mensaje Personalizado</option>
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-y-[-40%] transition-transform">
                                                <ChevronDown className="text-slate-400" size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Adjuntar Formulario</label>
                                        <div className="relative group">
                                            <select
                                                value={attachedSurveyId}
                                                onChange={(e) => setAttachedSurveyId(e.target.value)}
                                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                                            >
                                                <option value="">-- Sin formulario extra --</option>
                                                {customSurveys.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-green-500 transition-colors">
                                                <Sparkles size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {messageTemplate === 'custom' && (
                                        <div className="space-y-4 animate-fade-in p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                                            <input
                                                type="text"
                                                placeholder="Asunto del correo..."
                                                value={customSubject}
                                                onChange={e => setCustomSubject(e.target.value)}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 transition-all font-medium"
                                            />
                                            <textarea
                                                placeholder="Escribe tu mensaje aquí..."
                                                value={customBody}
                                                onChange={e => setCustomBody(e.target.value)}
                                                rows={4}
                                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 transition-all font-medium resize-none"
                                            />
                                            <p className="text-xs text-slate-500 text-center">Se adjuntará el link si seleccionaste uno.</p>
                                        </div>
                                    )}

                                    {/* Mock Email Preview */}
                                    <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-lg">
                                        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                            <div className="flex gap-1.5">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                            <div className="ml-4 text-xs font-medium text-slate-500">Vista Previa</div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 p-6 space-y-4">
                                            <div className="flex gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 font-medium w-16 text-right">To:</span>
                                                <span className="text-slate-800 dark:text-slate-200 font-medium bg-slate-100 dark:bg-slate-800 px-2 rounded-md">Emprendedor</span>
                                            </div>
                                            <div className="flex gap-2 text-sm border-b border-slate-100 dark:border-slate-800 pb-2">
                                                <span className="text-slate-400 font-medium w-16 text-right">Subject:</span>
                                                <span className="text-slate-900 dark:text-white font-semibold truncate">{getMessageContent({}).subject}</span>
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pt-2 opacity-90 h-64 overflow-y-auto custom-scrollbar">
                                                {getMessageContent({ persona_contacto: "[Nombre]" }).body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Selection & Table */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* 2. Selection Section */}
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[600px] flex flex-col">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 shadow-sm">2</div>
                                        Destinatarios
                                        <span className="ml-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-bold border border-green-200 dark:border-green-800">
                                            {filteredEntrepreneurs.length}
                                        </span>
                                    </h2>
                                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                        <div className="relative flex-1 md:flex-none">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre..."
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2.5 w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                                            />
                                        </div>
                                        <select
                                            value={selectedCategory}
                                            onChange={e => setSelectedCategory(e.target.value)}
                                            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all font-medium"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="flex-1 overflow-hidden flex flex-col -mx-4 lg:-mx-4">
                                    <div className="overflow-x-auto custom-scrollbar flex-1 pb-20 px-4 lg:px-4">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                                                <tr className="border-b border-slate-100 dark:border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                                                    <th className="p-4 w-10">
                                                        <div className="relative flex items-center justify-center">
                                                            <input type="checkbox"
                                                                checked={selectedEntrepreneurs.size === filteredEntrepreneurs.length && filteredEntrepreneurs.length > 0}
                                                                onChange={handleSelectAll}
                                                                className="peer w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 checked:bg-green-500 checked:border-green-500 transition-all appearance-none cursor-pointer"
                                                            />
                                                            <Check size={14} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                                        </div>
                                                    </th>
                                                    <th className="p-4">Emprendedor</th>
                                                    <th className="p-4">Contacto</th>
                                                    <th className="p-4 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {filteredEntrepreneurs.slice(0, 50).map(e => (
                                                    <tr key={e.id} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${selectedEntrepreneurs.has(e.id) ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                                                        <td className="p-4">
                                                            <div className="relative flex items-center justify-center">
                                                                <input type="checkbox"
                                                                    checked={selectedEntrepreneurs.has(e.id)}
                                                                    onChange={() => toggleSelection(e.id)}
                                                                    className="peer w-5 h-5 rounded-md border-2 border-slate-300 dark:border-slate-600 checked:bg-green-500 checked:border-green-500 transition-all appearance-none cursor-pointer"
                                                                />
                                                                <Check size={14} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{e.nombre_emprendimiento}</div>
                                                            <div className="text-xs text-slate-500 inline-flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                                                                {e.categoria_principal}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{e.persona_contacto}</div>
                                                            <div className="text-xs text-slate-500 flex flex-col gap-0.5 mt-0.5">
                                                                <span className="opacity-90">{e.telefono}</span>
                                                                <span className="opacity-70">{e.correo}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => handleWhatsAppClick(e)}
                                                                    className="p-2.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-500 hover:text-white dark:hover:bg-green-500 transition-all hover:scale-110 shadow-sm"
                                                                    title="Enviar WhatsApp"
                                                                >
                                                                    <MessageCircle size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEmailClick(e)}
                                                                    className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 transition-all hover:scale-110 shadow-sm"
                                                                    title="Enviar Correo"
                                                                >
                                                                    <Mail size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredEntrepreneurs.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} className="p-12 text-center text-slate-500">
                                                            <div className="flex flex-col items-center gap-3">
                                                                <Search size={40} className="text-slate-300" strokeWidth={1.5} />
                                                                <p>No se encontraron resultados.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {filteredEntrepreneurs.length > 50 && (
                                            <div className="p-6 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-white/5">
                                                Mostrando los primeros 50 de {filteredEntrepreneurs.length} resultados. Usa el buscador para ver más.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Bulk Action Bar */}
                {selectedEntrepreneurs.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up-fade">
                        <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-2 py-2 pr-3 rounded-2xl shadow-2xl shadow-slate-900/40 dark:shadow-black/20 flex items-center gap-4 border border-white/10 dark:border-slate-200">
                            <div className="bg-white/10 dark:bg-black/5 px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <Check size={16} />
                                {selectedEntrepreneurs.size}
                            </div>
                            <div className="text-sm font-medium mr-2 hidden sm:block">Emp. Seleccionados</div>
                            <div className="h-8 w-[1px] bg-white/20 dark:bg-black/10"></div>
                            <button
                                onClick={handleBulkEmail}
                                className="flex items-center gap-2 px-6 py-2.5 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-500/30 active:scale-95 text-sm"
                            >
                                <Mail size={18} />
                                <span>Enviar BCC</span>
                            </button>
                            <button
                                onClick={() => setSelectedEntrepreneurs(new Set())}
                                className="p-2 hover:bg-white/10 dark:hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const LinkIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);
