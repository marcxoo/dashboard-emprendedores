import { useState, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Send, Mail, MessageCircle, Search, Filter, Copy, ExternalLink, ChevronDown, Check, User, Sparkles, FileText, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
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

    // ALLOWED EMAILS LIST - STRICT FILTER
    const ALLOWED_EMAILS = [
        "margaritaavila324@gmail.com", "mv4739358@gmail.com", "n4077078@gmail.com", "Erikablp@hotmail.com", "pincaye576@gmail.com",
        "morenonagely@gmail.com", "vmartillom2@gmail.com", "jcortezo2@unemi.edu.ec", "cristiperez30@yahoo.com", "tatycoello1990@hotmail.com",
        "arielsaavedra202021@gmail.com", "andyinga083@gmail.com", "churritosangie@hotmail.com", "btorresv7@unemi.edu.ec",
        "maria.sanchez.98@hotmail.com", "pdrovalencia3@gmail.com", "jachris25595@gmail.com", "divinaec905@gmail.com",
        "juanitareyes911@gmail.com", "ana1970guerrero@gmail.com", "geomaradiaz02@gmail.com", "marjoriesalguero16@gmail.com",
        "elopeza@hotmail.com", "Jennifferescobarnvas@gmail.com", "mariodavidnavassiza@gmail.com", "nagely.salinas@uees.edu.ec",
        "amora1993@gmil.com", "cristinapaez2311@outlook.es", "camachobertha830@gmail.com", "ortizpachecoelizabethmayra@gmail.com",
        "cedomenicka@gmail.com", "magdalena_pardo@hotmail.es", "marcosbriones0722@gmail.com", "petilu.pp@gmail.com",
        "danielaac183@gmail.com", "florameliarivera@gmail.com", "aaltamiranoc4@unemi.educ.ec", "mariaelenalassa1@gmail.com",
        "jimenezelena533@gmail.com", "tucunangohelen@gmail.com", "mari.cruz15@hotmail.com", "teresamariduena1808@gmail.com",
        "yuquilemaivanna@gmail.com", "silveramelina65@gmail.com", "elizabethrocio-cepeda@hotmail.com",
        "analaravaldiviezo@gmail.com", "beyou.joyeriaaccesorios@gmail.com", "leslypinela2003@gmail.com", "naranjo03allison@gmail.com",
        "karen.michelleparedes@gmail.com", "haroldgranja@hotmail.com", "drosadoa@unemi.edu.ec", "gematapia2002@gmail.com",
        "jenniferjerez22@gmail.com", "jgop_isl@hotmail.com", "edisonwillianlemag@gmail.com", "vivianaleonvl1@gmail.com",
        "avillamarr2@unemi.edu.ec", "kg0996468518@gmail.com", "rociosantoscrisostomo@gmail.com"
    ].map(e => e.toLowerCase().trim());

    // Filter Logs: Show all bulk_email logs (removes test whatsapp spam)
    const validInvitationLogs = useMemo(() => {
        const filtered = invitationLogs.filter(log => {
            // Only show bulk_email channel (excludes whatsapp test spam)
            return log.channel === 'bulk_email';
        });
        // Deduplicate: Keep one log per entrepreneur
        const uniqueMap = new Map();
        // Sort by date descending
        const sorted = filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        sorted.forEach(log => {
            const key = log.entrepreneur_id;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, log);
            }
        });

        return Array.from(uniqueMap.values());

    }, [invitationLogs, entrepreneurs]);

    // State for Manual Confirmation
    const [confirmingEntrepreneur, setConfirmingEntrepreneur] = useState(null);

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
                    e.correo?.toLowerCase().includes(term)
                );
            }
            if (filterWithRuc && !e.ruc) return false;

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
        const name = entrepreneur?.persona_contacto || "Emprendedor";

        // Survey Link
        let surveyLink = "";
        if (attachedSurveyId) {
            surveyLink = `${window.location.origin}/forms/${attachedSurveyId}`;
        }

        if (messageTemplate === 'taller_rentabilidad') {
            subject = "[INVITACION]: Taller Práctico de Costos y Fijación del Precio Ideal";
            body = `Hola Emprendedor/a 👋,\n\nEsperamos que te encuentres excelente.\n\nTe escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al taller: RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal\n\nDirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.\n\n📝 Detalles del Taller:\n📅 Fecha: Martes, 20 de Enero 2026\n⏰ Hora: 10:00 - 13:00\n📍 Lugar: UNEMI - Bloque H, Aula 106\n👩‍🏫 Capacitadora: Msc. Dolores Mieles\n🧠 Modalidad: Presencial\n⚠️ Nota: Este es un taller práctico que se realiza en aula con computadoras. Se requiere manejo básico de herramientas digitales.\n\n🚨 Cupos limitados, no te quedes fuera y asegura tu participación.\n\n${surveyLink ? `👉 Regístrate aquí: ${surveyLink}\n\n` : ''}¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!\n\nSaludos,\nEquipo Emprendimiento UNEMI`;
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
            entrepreneur_name: confirmingEntrepreneur.nombre_emprendimiento,
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

        // CONFIRMATION STEP
        if (!window.confirm(`¿Estás seguro de generar el enlace y REGISTRAR el envío para ${recipients.length} emprendedores?`)) {
            return;
        }

        let subject = "";
        let body = "";
        let surveyLink = "";
        if (attachedSurveyId) surveyLink = `${window.location.origin}/forms/${attachedSurveyId}`;

        if (messageTemplate === 'taller_rentabilidad') {
            subject = "RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal";
            body = `Hola Emprendedor/a 👋,\n\nEsperamos que te encuentres excelente.\n\nTe escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al taller: RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal\n\nDirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.\n\n📝 Detalles del Taller:\n📅 Fecha: Martes, 20 de Enero 2026\n⏰ Hora: 10:00 - 13:00\n📍 Lugar: UNEMI - Bloque H, Aula 106\n👩‍🏫 Capacitadora: Msc. Dolores Mieles\n🧠 Modalidad: Presencial\n⚠️ Nota: Este es un taller práctico que se realiza en aula con computadoras. Se requiere manejo básico de herramientas digitales.\n\n🚨 Cupos limitados, no te quedes fuera y asegura tu participación.\n\n${surveyLink ? `👉 Regístrate aquí: ${surveyLink}\n\n` : ''}¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!\n\nSaludos,\nEquipo Emprendimiento UNEMI`;
        } else {
            subject = customSubject || "Invitación UNEMI Emprende";
            body = customBody || `Hola Emprendedor/a,\n\nTe invitamos a participar en...`;
            if (surveyLink) body += `\n\nLink de registro: ${surveyLink}`;
        }

        // HTML Body for Clipboard
        const htmlBody = `
            <div style="font-family: sans-serif; color: #000;">
                <p>Hola Emprendedor/a 👋,</p>
                <p>Esperamos que te encuentres excelente.</p>
                ${(messageTemplate === 'taller_rentabilidad' || messageTemplate === 'recordatorio_taller') ? `
                <p>Te escribimos desde la Coordinación de Emprendimiento de UNEMI para invitarte al taller: <strong>RENTABILIDAD GARANTIZADA: Taller Práctico de Costos y Fijación del Precio Ideal</strong></p>
                ${messageTemplate === 'recordatorio_taller' ? '<p>🚀 <strong>¡RECORDATORIO: MANAÑA ES EL GRAN DÍA!</strong> 🚀</p>' : ''}
                <p>Dirigido a emprendedores que buscan calcular costos y fijar precios rentables y sostenibles.</p>
                <p>📝 <strong>Detalles del Taller:</strong><br>
                📅 <strong>Fecha:</strong> Martes, 20 de Enero 2026<br>
                ⏰ <strong>Hora:</strong> 10:00 - 13:00<br>
                📍 <strong>Lugar:</strong> UNEMI - Bloque H, Aula 106<br>
                👩‍🏫 <strong>Capacitadora:</strong> Msc. Dolores Mieles<br>
                🧠 <strong>Modalidad:</strong> Presencial<br>
                ⚠️ <strong>Nota:</strong> Este es un taller práctico que se realiza en aula con computadoras. Se requiere manejo básico de herramientas digitales.</p>
                <p>🚨 <strong>Cupos limitados, no te quedes fuera y asegura tu participación.</strong></p>
                ` : `<p>${body.replace(/\n/g, '<br>')}</p>`}
                ${surveyLink ? `<p>👉 <strong>Regístrate aquí:</strong> <a href="${surveyLink}">${surveyLink}</a></p>` : ''}
                <p>¡No te pierdas esta oportunidad de llevar tu emprendimiento al siguiente nivel!</p>
                <p>Saludos,<br>Equipo Emprendimiento UNEMI</p>
            </div>
        `;

        const to = "emprendimiento_innovacion@unemi.edu.ec";
        // ONLY include BCC in URL if list is small (< 30) to avoid URL limit errors
        const useUrlBcc = emails.length < 30;
        const bccParam = useUrlBcc ? emails.join(',') : '';

        // Open window immediately
        const win = window.open('about:blank', '_blank');

        try {
            const blobHtml = new Blob([htmlBody], { type: "text/html" });
            const blobText = new Blob([body], { type: "text/plain" });
            const data = [new ClipboardItem({ ["text/html"]: blobHtml, ["text/plain"]: blobText })];
            await navigator.clipboard.write(data);

            if (useUrlBcc) {
                addToast(`Copiado al portapapeles. Se abrirá Gmail.`, "success");
            } else {
                addToast(`⚠️ Lista grande (${emails.length}): Correos copiados al portapapeles. PEGA en CCO/BCC.`, "warning");

                // Copy EMAILS to clipboard is tricky if we already copied body (only 1 clipboard).
                // We prioritize the BODY because emails are easier to export/copy usually?
                // NO, users fail at extracting emails. Bodies are static.
                // Change strategy: Copy EMAILS to clipboard if list is big. Copy BODY if list is small?
                // Standard behavior: Copy Body (HTML). User has to paste emails manually?
                // Let's force verify.

                // Actually, let's copy EMAILS to clipboard for large lists. User can Copy/Paste body from the preview on screen if needed? 
                // No, body is complex HTML.

                // Compromise: We already copied body.
                // We will alert user to handle emails.
            }

        } catch (err) {
            console.error("Error copy", err);
            addToast("Error al copiar. Hazlo manualmente.", "error");
        }

        // If list is large, we can't put it in URL. 
        // We really should copy EMAILS instead of BODY for large lists, because getting 240 emails is harder than writing "Hola".
        if (!useUrlBcc) {
            const emailString = emails.join(', ');
            try {
                await navigator.clipboard.writeText(emailString);
                addToast("CORREOS copiados al portapapeles (Lista Grande).", "success");
                alert("Al ser muchos destinatarios, he copiado los CORREOS al portapapeles.\n\n1. PEGA los correos en CCO (BCC).\n2. El mensaje deberás redactarlo o copiarlo desde la vista previa.");
            } catch (e) { console.error(e); }
        }

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&bcc=${encodeURIComponent(bccParam)}&su=${encodeURIComponent(subject)}`;

        if (win) {
            win.location.href = gmailUrl;
        } else {
            window.open(gmailUrl, '_blank');
        }

        // Log Invitations
        recipients.forEach(e => {
            addInvitationLog({
                entrepreneur_id: e.id,
                entrepreneur_name: e.nombre_emprendimiento,
                channel: 'bulk_email',
                template: messageTemplate,
                status: 'initiated'
            });
        });

        setSelectedEntrepreneurs(new Set());
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

    // BACKFILL REMOVED

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
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
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 shadow-2xl transition-transform duration-300 ease-out
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
                                <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-20"></div>
                                <span className="relative w-2.5 h-2.5 block rounded-full bg-orange-500"></span>
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Sistema Operativo</span>
                        </div>
                    </div>

                    {/* Stats Bar (New) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                <Mail size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Emails Enviados</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {validInvitationLogs.filter(l => l.channel === 'bulk_email').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-500 flex items-center justify-center">
                                <MessageCircle size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">WhatsApp</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {validInvitationLogs.filter(l => l.channel === 'whatsapp').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
                                <Check size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Impactados</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {new Set(validInvitationLogs.map(l => l.entrepreneur_id)).size}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Base Total</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white">
                                    {entrepreneurs.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

                        {/* LEFT COLUMN: Configuration (Sticky) */}
                        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-8">
                            {/* 1. Configuration Card - SOFT UI */}
                            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
                                {/* Decorational Background */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/5 to-orange-600/5 rounded-full blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors duration-500"></div>

                                <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-8 flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm text-lg text-orange-600">1</div>
                                    Configuración
                                </h2>

                                <div className="space-y-8">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Plantilla de Mensaje</Label>
                                        <div className="relative group">
                                            <select
                                                value={messageTemplate}
                                                onChange={(e) => setMessageTemplate(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-full appearance-none outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <option value="taller_rentabilidad">🌱 Taller Rentabilidad Garantizada</option>
                                                <option value="recordatorio_taller">🚀 Recordatorio: ¡Mañana!</option>
                                                <option value="custom">✍️ Mensaje Personalizado</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:translate-y-[-10%] transition-transform">
                                                <ChevronDown className="text-slate-400" size={20} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-4">Adjuntar Formulario</Label>
                                        <div className="relative group">
                                            <select
                                                value={attachedSurveyId}
                                                onChange={(e) => setAttachedSurveyId(e.target.value)}
                                                className="w-full px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-full appearance-none outline-none focus:ring-4 focus:ring-orange-500/10 transition-all font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <option value="">-- Sin formulario extra --</option>
                                                {customSurveys.map(s => (
                                                    <option key={s.id} value={s.id}>📝 {s.title}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-orange-500 transition-colors bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
                                                <Sparkles size={16} />
                                            </div>
                                        </div>
                                    </div>

                                    {messageTemplate === 'custom' && (
                                        <div className="space-y-4 animate-in slide-in-from-top-4 fade-in duration-300 p-6 bg-slate-50 dark:bg-slate-800/30 rounded-[2rem]">
                                            <input
                                                type="text"
                                                placeholder="Asunto del correo..."
                                                value={customSubject}
                                                onChange={e => setCustomSubject(e.target.value)}
                                                className="w-full px-6 py-3 bg-white dark:bg-slate-900 rounded-full text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-bold placeholder:font-medium shadow-sm"
                                            />
                                            <textarea
                                                placeholder="Hola [Nombre], te escribo para..."
                                                value={customBody}
                                                onChange={e => setCustomBody(e.target.value)}
                                                rows={4}
                                                className="w-full px-6 py-4 bg-white dark:bg-slate-900 rounded-[1.5rem] text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-orange-500/20 transition-all font-medium resize-none placeholder:font-medium shadow-sm"
                                            />
                                            <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wide">Se adjuntará el link automáticamente si seleccionaste uno.</p>
                                        </div>
                                    )}

                                    {/* Mock Email Preview - Soft UI */}
                                    <div className="mt-8 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none bg-white dark:bg-slate-900">
                                        <div className="bg-slate-50/80 dark:bg-slate-800/50 px-6 py-4 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vista Previa</div>
                                        </div>
                                        <div className="p-8 space-y-4 bg-white dark:bg-slate-900 relative">
                                            <div className="space-y-3 pb-6 border-b border-slate-50 dark:border-white/5">
                                                <div className="flex items-center gap-3 text-xs">
                                                    <span className="text-slate-300 font-bold w-12 text-right">Para</span>
                                                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                        <User size={12} className="text-slate-400" />
                                                        <span className="text-slate-600 dark:text-slate-300 font-bold">Emprendedor Ejemplo</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3 text-xs">
                                                    <span className="text-slate-300 font-bold w-12 text-right mt-0.5">Asunto</span>
                                                    <span className="text-slate-800 dark:text-white font-bold flex-1 leading-snug">{getMessageContent({}).subject}</span>
                                                </div>
                                            </div>

                                            <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed py-2 h-64 overflow-y-auto scrollbar-thin font-medium">
                                                {getMessageContent({ persona_contacto: "[Nombre]" }).body}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Selection & Table - SOFT UI */}
                        <div className="xl:col-span-8 space-y-8">
                            {/* 2. Selection Header - Floating Pill Bar */}
                            <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-4">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-black shadow-sm text-lg text-orange-600">2</div>
                                    Destinatarios
                                    <span className="ml-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-xs rounded-full font-black min-w-[2rem] text-center">
                                        {filteredEntrepreneurs.length}
                                    </span>
                                </h2>

                                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto justify-end">
                                    {/* Floating Search Pill */}
                                    <div className="relative flex-1 sm:min-w-[200px] lg:min-w-[220px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} strokeWidth={2.5} />
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                            className="pl-14 pr-6 py-4 w-full bg-white dark:bg-slate-900 rounded-full text-sm font-bold text-slate-800 dark:text-slate-200 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                                        />
                                    </div>

                                    {/* Status Filter Pill */}
                                    <div className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
                                        <select
                                            value={invitationStatus}
                                            onChange={e => setInvitationStatus(e.target.value)}
                                            className="pl-6 pr-12 py-4 w-full bg-white dark:bg-slate-900 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="all">Todos</option>
                                            <option value="not_invited">Sin Invitación</option>
                                            <option value="invited">Ya Invitados</option>
                                        </select>
                                        <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>

                                    {/* Floating Filter Pill */}
                                    <div className="relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
                                        <select
                                            value={selectedCategory}
                                            onChange={e => setSelectedCategory(e.target.value)}
                                            className="pl-6 pr-12 py-4 w-full bg-white dark:bg-slate-900 rounded-full text-sm font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-4 focus:ring-orange-500/5 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">Todas las categorías</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <Filter className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                    </div>

                                    {/* RUC Filter Toggle */}
                                    <button
                                        onClick={() => setFilterWithRuc(!filterWithRuc)}
                                        className={`px-5 py-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.04)] whitespace-nowrap shrink-0 ${filterWithRuc
                                            ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500/20'
                                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <FileText size={18} strokeWidth={2.5} />
                                        <span>Con RUC</span>
                                        {filterWithRuc && <Check size={16} strokeWidth={3} className="ml-1" />}
                                    </button>
                                </div>
                            </div>

                            {/* Select All - Clean & Minimal */}
                            <div className="flex items-center justify-between px-6">
                                <div className="flex items-center gap-3 cursor-pointer group select-none" onClick={handleSelectAll}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${filteredEntrepreneurs.length > 0 && selectedEntrepreneurs.size === filteredEntrepreneurs.length
                                        ? 'bg-orange-500 border-orange-500'
                                        : 'border-slate-300 group-hover:border-orange-400'
                                        }`}>
                                        {filteredEntrepreneurs.length > 0 && selectedEntrepreneurs.size === filteredEntrepreneurs.length && <Check size={14} className="text-white" strokeWidth={3} />}
                                    </div>
                                    <Label className="cursor-pointer font-bold text-slate-500 group-hover:text-orange-600 transition-colors">
                                        Seleccionar Todos
                                    </Label>
                                </div>

                                {selectedEntrepreneurs.size > 0 && (
                                    <span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-bold animate-in fade-in slide-in-from-right-4 shadow-lg shadow-orange-500/30">
                                        {selectedEntrepreneurs.size} seleccionados
                                    </span>
                                )}
                            </div>

                            {/* List Results - Cards */}
                            <div className="grid grid-cols-1 gap-4 pb-32 px-2">
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
                                            className={`group relative p-4 rounded-[2rem] transition-all duration-300 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 cursor-pointer select-none
                                            ${isSelected
                                                    ? 'bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(249,115,22,0.15)] scale-[1.01] z-10'
                                                    : 'bg-white dark:bg-slate-900 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1'
                                                }`}
                                        >
                                            {/* Selection Checkbox - Circular */}
                                            <div className="pl-2" onClick={(ev) => { ev.stopPropagation(); toggleSelection(e.id); }}>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-orange-500 border-orange-500' : 'border-slate-200 dark:border-slate-700 group-hover:border-orange-400'
                                                    }`}>
                                                    {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                </div>
                                            </div>

                                            {/* Avatar / Initials */}
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shrink-0 transition-colors shadow-sm
                                                ${isSelected
                                                    ? 'bg-orange-100 text-orange-600'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-700'
                                                }
                                            `}>
                                                {e.nombre_emprendimiento?.charAt(0) || 'E'}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 text-center sm:text-left min-w-0">
                                                <h3 className={`font-bold text-lg leading-tight mb-1 truncate ${isSelected ? 'text-orange-700 dark:text-orange-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {e.nombre_emprendimiento}
                                                </h3>
                                                {e.actividad_economica && (
                                                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                                                        {e.actividad_economica}
                                                    </p>
                                                )}

                                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} /> {e.persona_contacto}
                                                    </span>
                                                    <span className="hidden sm:inline text-slate-200 dark:text-slate-700">•</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                        {e.categoria_principal}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0" onClick={(ev) => ev.stopPropagation()}>
                                                <button
                                                    onClick={() => handleWhatsAppClick(e)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-orange-500/30"
                                                    title="WhatsApp"
                                                >
                                                    <MessageCircle size={18} strokeWidth={2.5} />
                                                </button>
                                                <button
                                                    onClick={() => handleEmailClick(e)}
                                                    className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center shadow-sm hover:shadow-blue-500/30"
                                                    title="Email"
                                                >
                                                    <Mail size={18} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                {filteredEntrepreneurs.length === 0 && (
                                    <div className="py-20 text-center">
                                        <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                            <Search size={40} />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Sin resultados</h3>
                                        <p className="text-slate-400">Intenta con otro término.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

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
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white rounded-[1.5rem] font-bold transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
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
