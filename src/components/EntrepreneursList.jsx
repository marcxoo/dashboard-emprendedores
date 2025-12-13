import { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import EntrepreneurDetail from './EntrepreneurDetail';
import { getDateRangeFromWeek } from '../utils/dateUtils';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Phone, Mail, User, Users, Edit, Sparkles, X, Building2, Tag, ChevronDown, FileText, Save, Plus, MessageCircle, Clock, Calendar, CheckCircle, XCircle, List, History, Trash2, Store, Eye, Globe, Instagram, Facebook, Video } from 'lucide-react';
import { createPortal } from 'react-dom';

const MobileEntrepreneurCard = ({
    e,
    onSelect,
    onContact,
    onFollowUp,
    onEmail,
    onOffer,
    onHistory
}) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className="glass-panel p-6 flex flex-col gap-5 active:scale-[0.99] transition-transform bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            onClick={() => onSelect(e)}
        >
            <div className="flex justify-between items-start">
                <div className="flex gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xl shrink-0 mt-0.5 border border-slate-100 dark:border-slate-600">
                        {e.nombre_emprendimiento.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex flex-col">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-snug break-words">{e.nombre_emprendimiento}</h3>
                        <p className="text-slate-500 dark:text-slate-300 text-sm mt-0.5 truncate">{e.persona_contacto}</p>
                        <div>
                            <span className="inline-flex mt-3 px-3 py-1 rounded-lg text-xs font-bold bg-slate-50 dark:bg-orange-900/20 text-slate-600 dark:text-orange-200 border border-slate-200 dark:border-orange-900/30 tracking-wide">
                                {e.categoria_principal}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Activity Snippet - Expandable */}
            {e.actividad_economica && (
                <div
                    onClick={(ev) => {
                        ev.stopPropagation();
                        setExpanded(!expanded);
                    }}
                    className="text-[15px] text-slate-600 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 leading-relaxed transition-all cursor-pointer active:bg-slate-100 dark:active:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-500"
                >
                    <p className={expanded ? '' : 'line-clamp-3'}>
                        {e.actividad_economica}
                    </p>
                    {!expanded && e.actividad_economica.length > 80 && (
                        <div className="text-primary-600 dark:text-primary-400 font-bold text-sm mt-2 flex items-center gap-1">
                            Ver más <span className="text-xs">↓</span>
                        </div>
                    )}
                </div>
            )
            }

            <div className="grid grid-cols-2 gap-3.5" onClick={ev => ev.stopPropagation()}>
                <button
                    onClick={(ev) => onContact(e.telefono, ev)}
                    className="col-span-1 flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-green-50/50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 text-green-700 dark:text-green-300 font-bold text-xs hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors h-full min-h-[76px]"
                >
                    <MessageCircle size={22} strokeWidth={1.5} className="shrink-0 text-green-600 dark:text-green-400" />
                    <span className="break-all text-center leading-tight">{e.telefono}</span>
                </button>

                <button
                    onClick={() => onFollowUp(e)}
                    className="col-span-1 flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-bold text-xs hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors h-full min-h-[76px]"
                >
                    <Eye size={22} strokeWidth={1.5} className="shrink-0 text-orange-500 dark:text-orange-400" />
                    <span className="text-center leading-tight">Seguimiento</span>
                </button>

                {e.correo && (
                    <button
                        onClick={(ev) => onEmail(e.correo, ev)}
                        className="col-span-1 flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold text-[11px] hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors h-full min-h-[76px]"
                    >
                        <Mail size={22} strokeWidth={1.5} className="shrink-0 text-blue-500 dark:text-blue-400" />
                        <div className="flex flex-col items-center justify-center w-full leading-tight">
                            <span className="break-all">{e.correo.split('@')[0]}</span>
                            <span className="break-all">@{e.correo.split('@')[1]}</span>
                        </div>
                    </button>
                )}

                {e.correo && (
                    <button
                        onClick={(ev) => onOffer(e, ev)}
                        className={`col-span-1 flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors h-full min-h-[76px] ${!e.correo ? 'col-span-2' : ''}`}
                    >
                        <Store size={22} strokeWidth={1.5} className="shrink-0 text-purple-500 dark:text-purple-400" />
                        <span className="text-center leading-tight">Ofertar Stand</span>
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-slate-100 mt-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <History size={15} strokeWidth={1.5} className="text-slate-300" />
                        <span>Part: <b className="text-slate-700 text-sm">{e.veces_en_stand}</b></span>
                    </div>
                </div>

                <button
                    onClick={(ev) => {
                        ev.stopPropagation();
                        onHistory(e);
                    }}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors font-bold px-3 py-1.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200"
                >
                    <List size={16} strokeWidth={1.5} /> Ver Historial
                </button>
            </div>
        </div >
    );
};

export default function EntrepreneursList() {
    const { entrepreneurs, assignments, currentWeek, currentBlock, addEntrepreneur, updateEntrepreneur, deleteEntrepreneur } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntrepreneur, setEditingEntrepreneur] = useState(null);
    const [contactSelection, setContactSelection] = useState(null);

    // Follow-up Modals State
    const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedEntrepreneurForFollowUp, setSelectedEntrepreneurForFollowUp] = useState(null);

    const [filterCategory, setFilterCategory] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'nombre_emprendimiento', direction: 'asc' });
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
        if (sortConfig.key !== key) return <ArrowUpDown size={14} />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
    };

    const handleContactClick = (phone, e) => {
        e.stopPropagation();
        if (!phone) return;
        setContactSelection(phone);
    };

    const handleEmail = (email, e) => {
        e.stopPropagation();
        if (!email) return;
        window.location.href = `mailto:${email}`;
    };

    const handleStandOfferEmail = async (entrepreneur, e) => {
        e.stopPropagation();
        const email = entrepreneur.correo;
        if (!email) return;

        const name = entrepreneur.nombre_emprendimiento || entrepreneur.persona_contacto || 'Emprendedor';
        const eventDates = "lunes 08 y martes 09 de diciembre";
        const deadline = "28 de noviembre a las 13:00pm";

        const subject = "Invitación PROGRAMA UNEMI EMPRENDE CONTIGO";

        // Plain text for URL (fallback)
        const plainBody = `Estimado/a Emprendedor/a ${name},

Es un placer para nosotros contactarte en nombre de Coordinación de Emprendimiento de la Universidad Estatal de Milagro. Le hemos contactado debido a que se encuentra en nuestros registros de Red de Emprendedores UNEMI, hemos querido contactar con usted pero no hemos tenido respuesta.

Por ello, nos complace extenderle una invitación formal y exclusiva por este medio para participar del PROGRAMA UNEMI EMPRENDE CONTIGO que se llevará a cabo el ${eventDates}, en Universidad Estatal de Milagro sector de Las Palmeras diagonal al Bloque E, en uno de los siguientes horarios:

• Jornada completa: 09h00 a 13h00 y 13h00 a 17h00
• Jornada mañana: 09h00 a 13h00
• Jornada tarde: 13h00 a 17h00

🌟 Beneficio Principal: Stand de Exposición Gratuito
Como parte de nuestro compromiso con el fomento del emprendimiento local, deseamos ofrecerle la oportunidad de contar con un stand de exposición totalmente gratuito en una zona de alto tráfico de visitantes.

Esta es una excelente ocasión para:
• Dar a conocer sus productos a un público amplio y segmentado.<br>
• Generar ventas directas en el evento.<br>
• Establecer contactos con otros emprendedores y potenciales socios.<br>
• Reforzar la imagen de su marca.

📝 Detalles Logísticos del Stand
• Costo: $0.00 (Totalmente gratuito).
• Incluye: Espacio y stand

⚠️⚠️Requisitos Importantes⚠️⚠️ :
• Asistencia puntual
• Cuidar de los enseres prestados
• Hacerse responsable de sus productos
• Respetar los tiempos establecidos.

Si está interesado/a en aprovechar esta oportunidad, le solicitamos que confirme su participación a más tardar el ${deadline}.

Se solicita confirmar su asistencia y horario, por favor, responda a este correo electrónico y nos contactaremos.`;

        // HTML for Clipboard
        const htmlBody = `
            <div style="font-family: sans-serif; color: #000;">
                <p>Estimado/a Emprendedor/a <strong>${name}</strong>,</p>
                <p>Es un placer para nosotros contactarte en nombre de <strong>Coordinación de Emprendimiento</strong> de la Universidad Estatal de Milagro. Le hemos contactado debido a que se encuentra en nuestros registros de <strong>Red de Emprendedores UNEMI</strong>, hemos querido contactar con usted pero no hemos tenido respuesta.</p>
                <p>Por ello, nos complace extenderle una invitación formal y exclusiva por este medio para participar del <strong>PROGRAMA UNEMI EMPRENDE CONTIGO</strong> que se llevará a cabo el <strong>${eventDates}</strong>, en Universidad Estatal de Milagro sector de Las Palmeras diagonal al Bloque E, en <u>uno de los siguientes horarios</u>:</p>
                <ul>
                    <li><strong>Jornada completa:</strong> 09h00 a 13h00 y 13h00 a 17h00</li>
                    <li><strong>Jornada mañana:</strong> 09h00 a 13h00</li>
                    <li><strong>Jornada tarde:</strong> 13h00 a 17h00</li>
                </ul>
                <p>🌟 <strong>Beneficio Principal: Stand de Exposición Gratuito</strong><br>
                Como parte de nuestro compromiso con el fomento del emprendimiento local, deseamos ofrecerle la oportunidad de contar con un stand de exposición totalmente gratuito en una zona de alto tráfico de visitantes.</p>
                <p>Esta es una excelente ocasión para:<br>
                • Dar a conocer sus productos a un público amplio y segmentado.<br>
                • Generar ventas directas en el evento.<br>
                • Establecer contactos con otros emprendedores y potenciales socios.<br>
                • Reforzar la imagen de su marca.</p>
                <p>📝 <strong>Detalles Logísticos del Stand</strong><br>
                • Costo: $0.00 (Totalmente gratuito).<br>
                • Incluye: Espacio y stand</p>
                <p>⚠️⚠️<strong>Requisitos Importantes</strong>⚠️⚠️ :<br>
                • Asistencia puntual<br>
                • Cuidar de los enseres prestados<br>
                • Hacerse responsable de sus productos<br>
                • Respetar los tiempos establecidos.</p>
                <p>Si está interesado/a en aprovechar esta oportunidad, le solicitamos que confirme su participación a más tardar el <strong>${deadline}</strong>.</p>
                <p><strong>Se solicita confirmar su asistencia y horario, por favor, responda a este correo electrónico y nos contactaremos.</strong></p>
            </div>
        `;

        try {
            const blobHtml = new Blob([htmlBody], { type: "text/html" });
            const blobText = new Blob([plainBody], { type: "text/plain" });
            const data = [new ClipboardItem({
                ["text/html"]: blobHtml,
                ["text/plain"]: blobText
            })];
            await navigator.clipboard.write(data);
            alert("El contenido del correo ha sido copiado al portapapeles con el formato correcto. Por favor, pégalo (Ctrl+V) en la ventana de Gmail que se abrirá.");
        } catch (err) {
            console.error("Error copying to clipboard:", err);
            // Fallback to just opening URL if clipboard fails
        }

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(subject)}`;
        const gmailUrlWithBody = `${gmailUrl}&body=${encodeURIComponent(plainBody)}`;
        window.open(gmailUrlWithBody, '_blank');
    };

    const handleBulkConfirmationEmail = async () => {
        // Use currentWeek from context to filter assignments
        const targetWeek = currentWeek;

        console.log('Debug Bulk Email:', {
            targetWeek,
            currentBlock,
            assignmentsCount: assignments.length,
            firstAssignment: assignments[0],
            filteredDataCount: filteredData.length
        });

        const assignedEntrepreneurIds = new Set(
            assignments
                .filter(a => a.semana === targetWeek && a.bloque === currentBlock)
                .map(a => a.id_emprendedor) // Changed from emprendedor_id to id_emprendedor based on AssignmentLogic.js
        );

        console.log('Assigned IDs for week and block:', [...assignedEntrepreneurIds]);

        const emails = filteredData
            .filter(e => assignedEntrepreneurIds.has(e.id)) // Only include those with assignments in the target week
            .map(e => e.correo)
            .filter(email => email && email.includes('@')); // Basic validation

        if (emails.length === 0) {
            alert(`No hay emprendedores con asignación para la semana ${targetWeek} y bloque ${currentBlock} en la lista filtrada.`);
            return;
        }

        const to = "emprendimiento_innovacion@unemi.edu.ec";
        const cc = "jzambranom@unemi.edu.ec, aholguinb@unemi.edu.ec, mlojas@unemi.edu.ec";
        const bcc = emails.join(',');
        const subject = "CONFIRMACIÓN DE ASISTENCIA A UNEMI-EMPRENDE";
        const deadline = "jueves, 4 de diciembre a las 12:00pm";
        const eventDates = "Lunes 8 y Martes 9 de diciembre";

        const plainBody = `Estimado/a Emprendedor/a,

Es un placer para nosotros invitarle a formalizar su participación en UNEMI EMPRENDE CONTIGO, nuestro espacio dedicado a impulsar y visibilizar tu emprendimiento.

Para asegurar tu lugar y mantener el stand asignado, es imprescindible que confirmes tu asistencia, la asistencia para el stand es el día ${eventDates}. Una vez recibida tu confirmación, nuestro equipo se comunicará contigo para continuar con la coordinación correspondiente.

Por favor, responde a este correo electrónico a más tardar el [${deadline}] indicando claramente:

1. 📝 Nombre del Emprendimiento:
2. 📝 Nombre Completo del Responsable:
3. 📝 Numero de celular:
4. ✅ Confirmación: "Confirmo mi participación en UNEMI EMPRENDE CONTIGO."

⚠️⚠️ IMPORTANTE ⚠️⚠️ : Tu respuesta es crucial. Si no recibimos tu confirmación antes de la fecha límite, entenderemos que has desistido de participar y el stand podrá ser reasignado a otro emprendedor.

Estamos muy emocionados de contar contigo y tu proyecto en este evento. Si tienes alguna pregunta sobre logística o el montaje de tu stand, no dudes en contactarnos.

¡Te esperamos!

Atentamente,`;

        const htmlBody = `
            <div style="font-family: sans-serif; color: #000;">
                <p>Estimado/a Emprendedor/a,</p>
                <p>Es un placer para nosotros invitarle a formalizar su participación en <strong>UNEMI EMPRENDE CONTIGO</strong>, nuestro espacio dedicado a impulsar y visibilizar tu emprendimiento.</p>
                <p>Para asegurar tu lugar y mantener el stand asignado, es imprescindible que confirmes tu asistencia, la asistencia para el stand es el día <strong>${eventDates}</strong>. Una vez recibida tu confirmación, nuestro equipo se comunicará contigo para continuar con la coordinación correspondiente.</p>
                <p>Por favor, responde a este correo electrónico <strong>a más tardar el [${deadline}]</strong> indicando claramente:</p>
                <ol>
                    <li>📝 <strong>Nombre del Emprendimiento:</strong></li>
                    <li>📝 <strong>Nombre Completo del Responsable:</strong></li>
                    <li>📝 <strong>Numero de celular:</strong></li>
                    <li>✅ <strong>Confirmación:</strong> "Confirmo mi participación en UNEMI EMPRENDE CONTIGO."</li>
                </ol>
                <p>⚠️⚠️ <strong>IMPORTANTE</strong> ⚠️⚠️ : <strong>Tu respuesta es crucial.</strong> Si no recibimos tu confirmación antes de la fecha límite, entenderemos que has desistido de participar y el stand podrá ser reasignado a otro emprendedor.</p>
                <p>Estamos muy emocionados de contar contigo y tu proyecto en este evento. Si tienes alguna pregunta sobre logística o el montaje de tu stand, no dudes en contactarnos.</p>
                <p>¡Te esperamos!</p>
                <p>Atentamente,</p>
            </div>
        `;

        try {
            const blobHtml = new Blob([htmlBody], { type: "text/html" });
            const blobText = new Blob([plainBody], { type: "text/plain" });
            const data = [new ClipboardItem({
                ["text/html"]: blobHtml,
                ["text/plain"]: blobText
            })];
            await navigator.clipboard.write(data);
            alert(`Se han copiado ${emails.length} correos al campo BCC y el contenido del mensaje al portapapeles. Por favor pega el contenido en Gmail.`);
        } catch (err) {
            console.error("Error copying to clipboard:", err);
        }

        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&cc=${encodeURIComponent(cc)}&bcc=${encodeURIComponent(bcc)}&su=${encodeURIComponent(subject)}`;
        const gmailUrlWithBody = `${gmailUrl}&body=${encodeURIComponent(plainBody)}`;
        window.open(gmailUrlWithBody, '_blank');
    };

    const [selectedEntrepreneur, setSelectedEntrepreneur] = useState(null);

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative pb-20">
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

            <ContactSelectionModal
                isOpen={!!contactSelection}
                onClose={() => setContactSelection(null)}
                phoneNumber={contactSelection}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-lg shadow-primary-500/20 text-white">
                            <Users size={24} />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Emprendedores</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-1">
                        Gestión general <span className="inline-block mx-2 text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-primary-600 font-bold bg-primary-50 dark:bg-primary-900/30 dark:text-primary-400 px-2 py-0.5 rounded-md">{filteredData.length} registros</span>
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full md:w-auto">
                    <button
                        onClick={handleBulkConfirmationEmail}
                        className="btn flex-1 md:flex-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-100 dark:hover:border-primary-500/30 shadow-sm hover:shadow px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <Mail size={18} />
                        <span>Confirmación Masiva</span>
                    </button>
                    <button
                        onClick={() => {
                            setEditingEntrepreneur(null);
                            setIsModalOpen(true);
                        }}
                        className="btn flex-1 md:flex-none bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={20} />
                        <span>Nuevo Emprendedor</span>
                    </button>
                </div>
            </div>

            {/* Modals */}
            <FollowUpModal
                isOpen={followUpModalOpen}
                onClose={() => setFollowUpModalOpen(false)}
                entrepreneur={selectedEntrepreneurForFollowUp}
            />
            <HistoryModal
                isOpen={historyModalOpen}
                onClose={() => setHistoryModalOpen(false)}
                entrepreneur={selectedEntrepreneurForFollowUp}
            />

            {/* Search & Filter Bar */}
            <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="relative flex-1 w-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        className="glass-input w-full pl-12 pr-4 py-3 rounded-xl outline-none placeholder:text-slate-400 font-medium text-slate-700 dark:text-white focus:ring-4 focus:ring-primary-500/10 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600"
                        placeholder="Buscar por nombre, teléfono o correo..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                {/* Sort Dropdown */}
                <div className="relative w-full md:hidden">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <ArrowUpDown size={18} />
                    </div>
                    <select
                        className="w-full pl-11 pr-10 py-3 bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none font-medium text-slate-700 dark:text-white cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700"
                        value={`${sortConfig.key}-${sortConfig.direction}`}
                        onChange={e => {
                            const [key, direction] = e.target.value.split('-');
                            setSortConfig({ key, direction });
                        }}
                    >
                        <option value="veces_en_stand-desc">Mayor Participación</option>
                        <option value="veces_en_stand-asc">Menor Participación</option>
                        <option value="nombre_emprendimiento-asc">Nombre (A-Z)</option>
                        <option value="nombre_emprendimiento-desc">Nombre (Z-A)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Tag size={18} />
                    </div>
                    <select
                        className="w-full pl-11 pr-10 py-3 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-700"
                        value={filterCategory}
                        onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <ChevronDown size={16} />
                    </div>
                </div>
            </div>

            {/* Desktop List (Card-Rows) */}
            <div className="hidden md:flex flex-col gap-3">
                {/* Header Row */}
                <div className="flex px-6 py-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <div className="w-[35%] cursor-pointer hover:text-primary-600 transition-colors flex items-center gap-1" onClick={() => requestSort('nombre_emprendimiento')}>
                        Emprendimiento {getSortIcon('nombre_emprendimiento')}
                    </div>
                    <div className="w-[25%] pl-4">Contacto</div>
                    <div className="w-[15%] text-center cursor-pointer hover:text-primary-600 transition-colors flex items-center justify-center gap-1" onClick={() => requestSort('veces_en_stand')}>
                        Participación {getSortIcon('veces_en_stand')}
                    </div>
                    <div className="w-[25%] text-right pr-4">Acciones</div>
                </div>

                {paginatedData.map((e) => (
                    <div
                        key={e.id}
                        onClick={() => setSelectedEntrepreneur(e)}
                        className={`group rounded-xl p-4 flex items-center shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${selectedEntrepreneur?.id === e.id
                            ? 'bg-primary-50 dark:bg-primary-900/10 border border-primary-500 dark:border-primary-500 ring-1 ring-primary-500 dark:ring-primary-500 z-10'
                            : 'bg-white dark:bg-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-500/30'
                            }`}
                    >
                        {/* Left Accent */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary-500 transition-colors"></div>

                        {/* Col 1: Identity */}
                        <div className="w-[35%] pr-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mt-1">
                                    {e.nombre_emprendimiento.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-white text-base active:text-primary-700 leading-tight">{e.nombre_emprendimiento}</h3>
                                    <div className="flex flex-wrap items-center gap-2 mt-1 mb-1.5">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{e.persona_contacto}</span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-orange-900/20 text-slate-500 dark:text-orange-200 border border-slate-200 dark:border-orange-900/30">
                                            {e.categoria_principal}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed line-clamp-2" title={e.actividad_economica}>
                                        {e.actividad_economica || 'Sin descripción de actividad.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Col 2: Contact */}
                        <div className="w-[25%] px-4 border-l border-slate-100 dark:border-slate-700">
                            <div className="flex flex-col gap-1.5">
                                <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors w-fit" onClick={(ev) => handleContactClick(e.telefono, ev)}>
                                    <Phone size={14} className="text-slate-400 dark:text-slate-400" />
                                    <span className="font-mono">{e.telefono}</span>
                                </button>
                                {e.correo && (
                                    <button className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full text-left group/email" onClick={(ev) => handleEmail(e.correo, ev)}>
                                        <Mail size={14} className="text-slate-400 dark:text-slate-400 shrink-0 group-hover/email:text-blue-500 dark:group-hover/email:text-blue-400" />
                                        <span className="break-all leading-tight">{e.correo}</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Col 3: Stats */}
                        <div className="w-[15%] flex flex-col items-center justify-center border-l border-slate-100 dark:border-slate-700 px-4">
                            <div className={`text-xl font-bold ${e.veces_en_stand > 0 ? 'text-primary-600 dark:text-primary-400' : 'text-slate-300 dark:text-slate-600'}`}>
                                {e.veces_en_stand}
                            </div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider text-center">
                                {e.veces_en_stand > 0 && e.ultima_semana_participacion ? getDateRangeFromWeek(e.ultima_semana_participacion) : ''}
                            </div>
                        </div>

                        {/* Col 4: Actions */}
                        <div className="w-[25%] pl-4 flex items-center justify-end gap-2" onClick={ev => ev.stopPropagation()}>
                            <button
                                onClick={() => {
                                    setSelectedEntrepreneurForFollowUp(e);
                                    setFollowUpModalOpen(true);
                                }}
                                className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 border border-slate-200 dark:border-slate-600 hover:border-primary-200 dark:hover:border-primary-500/30 transition-all"
                                title="Añadir Observación"
                            >
                                <Eye size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedEntrepreneurForFollowUp(e);
                                    setHistoryModalOpen(true);
                                }}
                                className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-secondary hover:text-white border border-slate-200 dark:border-slate-600 hover:border-secondary transition-all"
                                title="Historial"
                            >
                                <List size={16} />
                            </button>
                            {e.correo && (
                                <button
                                    onClick={(ev) => handleStandOfferEmail(e, ev)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 border border-slate-200 dark:border-slate-600 hover:border-green-200 dark:hover:border-green-500/30 transition-all"
                                    title="Ofertar Stand"
                                >
                                    <Store size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cards (Mobile) */}
            {/* Cards (Mobile) */}
            <div className="md:hidden flex flex-col gap-4">
                {paginatedData.map((e) => (
                    <MobileEntrepreneurCard
                        key={e.id}
                        e={e}
                        onSelect={setSelectedEntrepreneur}
                        onContact={handleContactClick}
                        onFollowUp={() => {
                            setSelectedEntrepreneurForFollowUp(e);
                            setFollowUpModalOpen(true);
                        }}
                        onEmail={handleEmail}
                        onOffer={handleStandOfferEmail}
                        onHistory={() => {
                            setSelectedEntrepreneurForFollowUp(e);
                            setHistoryModalOpen(true);
                        }}
                    />
                ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm gap-4">
                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Mostrando <span className="font-bold text-slate-800 dark:text-slate-200">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="font-bold text-slate-800 dark:text-slate-200">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-bold text-slate-800 dark:text-slate-200">{filteredData.length}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        <ArrowUp className="-rotate-90" size={18} />
                    </button>
                    <div className="px-4 py-2 font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                        {currentPage} / {totalPages}
                    </div>
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-all"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        <ArrowUp className="rotate-90" size={18} />
                    </button>
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

const TikTokIcon = ({ size = 20, className = "", ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5v2a7 7 0 0 1-7-7v5" />
    </svg>
);

function EntrepreneurModal({ isOpen, onClose, onSave, categories, initialData }) {
    const [formData, setFormData] = useState({
        nombre_emprendimiento: '',
        persona_contacto: '',
        telefono: '',
        correo: '',
        ciudad: '',
        categoria_principal: '',
        actividad_economica: '',
        red_social: '',
        tipo_emprendedor: 'Externo',
        notas: '',
        no_contesto: false
    });
    const [isCustomCategory, setIsCustomCategory] = useState(false);

    const [socialOverride, setSocialOverride] = useState('instagram');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    nombre_emprendimiento: initialData.nombre_emprendimiento || '',
                    persona_contacto: initialData.persona_contacto || '',
                    telefono: initialData.telefono || '',
                    correo: initialData.correo || '',
                    ciudad: initialData.ciudad || '',
                    categoria_principal: initialData.categoria_principal || '',
                    actividad_economica: initialData.actividad_economica || '',
                    red_social: initialData.red_social || '',
                    tipo_emprendedor: initialData.semaforizacion || 'Externo',
                    notas: initialData.notas || '',
                    no_contesto: initialData.no_contesto || false,
                    ruc: initialData.ruc || ''
                });
                setIsCustomCategory(!categories.includes(initialData.categoria_principal) && initialData.categoria_principal !== '');
            } else {
                setFormData({
                    nombre_emprendimiento: '',
                    persona_contacto: '',
                    categoria_principal: '',
                    tipo_emprendedor: 'Externo',
                    actividad_economica: '',
                    telefono: '',
                    correo: '',
                    ciudad: '',
                    red_social: '',
                    ruc: '',
                    no_contesto: false
                });
                setIsCustomCategory(false);
            }

            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, initialData, onClose, categories]);

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Fixed Header */}
                <div className="flex-none bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner border border-white/30">
                            {initialData ? <Edit size={20} /> : <Sparkles size={20} />}
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
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-800/50">
                    <form id="entrepreneur-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Nombre del Emprendimiento <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Store size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                        placeholder="Ej. Artesanías Manabitas"
                                        value={formData.nombre_emprendimiento}
                                        onChange={(e) => setFormData({ ...formData, nombre_emprendimiento: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Persona de Contacto <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                        placeholder="Nombre completo"
                                        value={formData.persona_contacto}
                                        onChange={(e) => setFormData({ ...formData, persona_contacto: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Categoría <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Tag size={20} />
                                    </div>
                                    {isCustomCategory ? (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400"
                                                placeholder="Nueva categoría..."
                                                value={formData.categoria_principal}
                                                onChange={(e) => setFormData({ ...formData, categoria_principal: e.target.value })}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomCategory(false)}
                                                className="p-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                                            >
                                                <List size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <select
                                            className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none font-medium text-slate-700 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600"
                                            value={formData.categoria_principal}
                                            onChange={(e) => {
                                                if (e.target.value === 'custom') {
                                                    setIsCustomCategory(true);
                                                    setFormData({ ...formData, categoria_principal: '' });
                                                } else {
                                                    setFormData({ ...formData, categoria_principal: e.target.value });
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Seleccionar...</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            <option value="custom" className="font-bold text-primary-600">+ Nueva Categoría</option>
                                        </select>
                                    )}
                                    {!isCustomCategory && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                            <ChevronDown size={16} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Tipo de Emprendedor <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <User size={20} />
                                    </div>
                                    <select
                                        className="w-full pl-12 pr-10 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none font-medium text-slate-700 dark:text-white cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600"
                                        value={formData.tipo_emprendedor}
                                        onChange={(e) => setFormData({ ...formData, tipo_emprendedor: e.target.value })}
                                        required
                                    >
                                        <option value="Externo">Emprendedor Externo</option>
                                        <option value="Estudiante / Graduado UNEMI">Estudiante / Graduado UNEMI</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Notas Generales / Actividad
                                </label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400 min-h-[100px] resize-none"
                                    placeholder="Describe la actividad económica o añade notas internas..."
                                    value={formData.actividad_economica}
                                    onChange={(e) => setFormData({ ...formData, actividad_economica: e.target.value })}
                                />
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Teléfono
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <input
                                        type="tel"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                        placeholder="09XXXXXXXX"
                                        value={formData.telefono}
                                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Email
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                        placeholder="ejemplo@correo.com"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Ciudad
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                        <Building2 size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                        placeholder="Ej. Milagro"
                                        value={formData.ciudad}
                                        onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Red Social
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative group flex-1">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                            {(() => {
                                                const val = (formData.red_social || '').toLowerCase();

                                                if (val.startsWith('@')) {
                                                    if (socialOverride === 'tiktok') {
                                                        return <TikTokIcon
                                                            size={20}
                                                            className="text-black cursor-pointer hover:scale-110 transition-transform"
                                                            onClick={() => setSocialOverride('instagram')}
                                                            title="Cambiar a Instagram"
                                                        />;
                                                    }
                                                    return <Instagram
                                                        size={20}
                                                        className="text-pink-500 cursor-pointer hover:scale-110 transition-transform"
                                                        onClick={() => setSocialOverride('tiktok')}
                                                        title="Cambiar a TikTok"
                                                    />;
                                                }

                                                if (val.includes('instagram')) return <Instagram size={20} className="text-pink-500" />;
                                                if (val.includes('facebook') || val.includes('fb.com')) return <Facebook size={20} className="text-blue-600" />;
                                                if (val.includes('tiktok')) return <TikTokIcon size={20} className="text-black" />;

                                                return <Globe size={20} />;
                                            })()}
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                            placeholder="URL o @usuario"
                                            value={formData.red_social}
                                            onChange={(e) => setFormData({ ...formData, red_social: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1 ml-1">
                                    Si usas @, haz clic en el icono para cambiar entre Instagram y TikTok.
                                </p>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    Identificación
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                            <FileText size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-mono font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                                            placeholder="RUC / CI"
                                            value={formData.ruc || ''}
                                            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 px-4">
                                        <input
                                            type="checkbox"
                                            id="no_contesto"
                                            className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                            checked={formData.no_contesto}
                                            onChange={(e) => setFormData({ ...formData, no_contesto: e.target.checked })}
                                        />
                                        <label htmlFor="no_contesto" className="text-sm font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                                            No Contestó / Inubicable
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="flex-none p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-bold text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    >
                        <Save size={20} />
                        {initialData ? 'Guardar Cambios' : 'Registrar Emprendedor'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}

function ContactSelectionModal({ isOpen, onClose, phoneNumber }) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAction = (type) => {
        if (!phoneNumber) return;

        // Remove non-numeric characters
        let cleanPhone = phoneNumber.replace(/\D/g, '');

        if (type === 'whatsapp') {
            // Add Ecuador country code if missing (assuming 09... format)
            if (cleanPhone.startsWith('09')) {
                cleanPhone = '593' + cleanPhone.substring(1);
            } else if (cleanPhone.startsWith('9')) {
                cleanPhone = '593' + cleanPhone;
            }
            window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else if (type === 'call') {
            window.location.href = `tel:${cleanPhone}`;
        }
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Contactar Emprendedor</h3>
                    <p className="text-slate-500 dark:text-slate-300 mb-6 font-medium text-lg">{phoneNumber}</p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => handleAction('whatsapp')}
                            className="btn bg-[#25D366] hover:bg-[#128C7E] text-white border-none w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                        >
                            <MessageCircle size={24} /> WhatsApp
                        </button>
                        <button
                            onClick={() => handleAction('call')}
                            className="btn bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white border-none w-full py-3.5 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-slate-500/20 active:scale-95 transition-all"
                        >
                            <Phone size={24} /> Llamar
                        </button>
                        <button
                            onClick={onClose}
                            className="btn btn-ghost w-full py-3 rounded-xl font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

function FollowUpModal({ isOpen, onClose, entrepreneur }) {
    const { addFollowUp } = useData();
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        status: 'answered',
        observation: ''
    });

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setFormData({
                date: now.toISOString().split('T')[0],
                time: now.toTimeString().split(' ')[0].substring(0, 5),
                status: 'answered',
                observation: ''
            });
            const handleEsc = (e) => {
                if (e.key === 'Escape') onClose();
            };
            window.addEventListener('keydown', handleEsc);
            return () => window.removeEventListener('keydown', handleEsc);
        }
    }, [isOpen, onClose]);

    if (!isOpen || !entrepreneur) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addFollowUp(entrepreneur.id, formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al guardar el seguimiento');
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                            <List size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Añadir Observación</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{entrepreneur.nombre_emprendimiento}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Fecha :</label>
                            <input
                                type="date"
                                className="input w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium dark:text-white"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Hora :</label>
                            <input
                                type="time"
                                className="input w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-medium dark:text-white"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Acción :</label>
                        <div className="relative">
                            <select
                                className="input w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all appearance-none font-medium dark:text-white"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="answered">EL EMPRENDEDOR CONTESTÓ</option>
                                <option value="no_answer">NO CONTESTÓ</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">Detalle :</label>
                        <textarea
                            className="input w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all min-h-[100px] dark:text-white"
                            value={formData.observation}
                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                            placeholder="Ingrese los detalles..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <XCircle size={18} /> Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <Save size={18} /> Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

function HistoryModal({ isOpen, onClose, entrepreneur }) {
    const { deleteFollowUp } = useData();

    useEffect(() => {
        const handleEsc = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !entrepreneur) return null;

    const history = entrepreneur.followUpHistory || [];

    const handleDelete = async (index) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este registro?')) {
            await deleteFollowUp(entrepreneur.id, index);
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 font-sans" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 flex-none">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ver Observaciones</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{entrepreneur.nombre_emprendimiento}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {history.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <History size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No hay observaciones registradas</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hora Llamada</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Observación</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Registrado Por</th>
                                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {history.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-white whitespace-nowrap">
                                                {item.date}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                {item.time}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {item.observation || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.status === 'answered' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                        Contestó
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                        No Contestó
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                Admin
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(idx)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Eliminar registro"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end flex-none">
                    <button
                        onClick={onClose}
                        className="btn bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 px-6 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2"
                    >
                        <X size={18} /> Cerrar
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
