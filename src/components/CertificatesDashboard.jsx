import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Download, Eye, FileText, Users, Calendar, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import JSZip from 'jszip';

// Certificate PDF template URL
const CERTIFICATE_PDF_URL = '/src/assets/certificado_plantilla.pdf';

export default function CertificatesDashboard() {
    const navigate = useNavigate();
    const { customSurveys } = useData();
    const { addToast } = useToast();

    const [selectedSurvey, setSelectedSurvey] = useState(null);
    const [selectedAttendees, setSelectedAttendees] = useState(new Set());
    const [certificateData, setCertificateData] = useState({
        workshopTitle: '',
        duration: '40',
        workshopDateStart: '',
        workshopDateEnd: '',
        issueDate: new Date().toISOString().split('T')[0]
    });
    const [previewAttendee, setPreviewAttendee] = useState(null);
    const [generating, setGenerating] = useState(false);

    // Filter surveys that have responses (events with attendees)
    const eventsWithAttendees = (customSurveys || []).filter(s => s.responses && s.responses.length > 0);

    // Get attendees from selected survey
    const attendees = selectedSurvey?.responses?.map(r => ({
        id: r.id,
        name: r.answers?.nombre_completo || r.answers?.nombre || r.answers?.name || 'Sin nombre',
        email: r.answers?.correo || r.answers?.email || '',
        created_at: r.created_at
    })) || [];

    // Auto-fill certificate data from survey
    useEffect(() => {
        if (selectedSurvey) {
            setCertificateData(prev => ({
                ...prev,
                workshopTitle: selectedSurvey.title || '',
                workshopDateStart: selectedSurvey.eventDate || '',
                workshopDateEnd: selectedSurvey.eventDate || ''
            }));
        }
    }, [selectedSurvey]);

    const handleSelectAll = () => {
        if (selectedAttendees.size === attendees.length) {
            setSelectedAttendees(new Set());
        } else {
            setSelectedAttendees(new Set(attendees.map(a => a.id)));
        }
    };

    const toggleAttendee = (id) => {
        const newSet = new Set(selectedAttendees);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedAttendees(newSet);
    };

    const formatDateText = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T12:00:00');
        const day = date.getDate();
        const month = date.toLocaleDateString('es-ES', { month: 'long' });
        const year = date.getFullYear();
        return `${day} días del mes de ${month} de ${year}`;
    };

    const formatDateRange = () => {
        if (!certificateData.workshopDateStart) return '';
        const start = new Date(certificateData.workshopDateStart + 'T12:00:00');
        const end = certificateData.workshopDateEnd ? new Date(certificateData.workshopDateEnd + 'T12:00:00') : start;

        const startDay = start.getDate();
        const endDay = end.getDate();
        const month = start.toLocaleDateString('es-ES', { month: 'long' });
        const year = start.getFullYear();

        if (startDay === endDay) {
            return `${startDay} de ${month} de ${year}`;
        }
        return `${startDay} al ${endDay} de ${month} de ${year}`;
    };

    const generatePDF = async (attendeeName) => {
        try {
            // Fetch the PDF template
            const templateResponse = await fetch(CERTIFICATE_PDF_URL);
            const templateBytes = await templateResponse.arrayBuffer();

            // Fetch Poppins fonts
            const [fontRegularResponse, fontMediumResponse, fontSemiBoldResponse] = await Promise.all([
                fetch('/src/assets/fonts/Poppins-Regular.ttf'),
                fetch('/src/assets/fonts/Poppins-Medium.ttf'),
                fetch('/src/assets/fonts/Poppins-SemiBold.ttf')
            ]);
            const fontRegularBytes = await fontRegularResponse.arrayBuffer();
            const fontMediumBytes = await fontMediumResponse.arrayBuffer();
            const fontSemiBoldBytes = await fontSemiBoldResponse.arrayBuffer();

            // Load the PDF
            const pdfDoc = await PDFDocument.load(templateBytes);
            pdfDoc.registerFontkit(fontkit);

            // Embed Poppins fonts
            const fontRegular = await pdfDoc.embedFont(fontRegularBytes);
            const fontMedium = await pdfDoc.embedFont(fontMediumBytes);
            const fontSemiBold = await pdfDoc.embedFont(fontSemiBoldBytes);

            // Get the first page
            const pages = pdfDoc.getPages();
            const page = pages[0];
            const { width, height } = page.getSize();

            // Text color #183144 converted to RGB (0-1 scale)
            const textColor = rgb(24 / 255, 49 / 255, 68 / 255);

            // Illustrator specs: 13.91pt, line height 16pt
            const bodyFontSize = 14;
            const lineHeight = 16;
            const nameFontSize = 28; // 28.02pt from Illustrator

            // Draw attendee name (centered, uppercase) - Poppins Medium
            const nameText = attendeeName.toUpperCase();
            const nameWidth = fontMedium.widthOfTextAtSize(nameText, nameFontSize);
            const nameX = (width - nameWidth) / 2 + 6; // 6px right
            const nameY = height - 270;

            page.drawText(nameText, {
                x: nameX,
                y: nameY,
                size: nameFontSize,
                font: fontMedium,
                color: textColor,
            });

            // Workshop details paragraph - symmetric margins
            const textMargin = 130; // Equal margin on both sides
            const textStartX = textMargin + 6; // Moved 6px right
            const textMaxWidth = width - (textMargin * 2);
            let currentY = height - 343;
            let xPos = textStartX;

            // Helper function to draw justified line with mixed fonts
            // Each item in words array is {text, font}
            const drawJustifiedMixedLine = (wordObjs, startX, y, maxWidth, isLastLine = false) => {
                if (wordObjs.length === 0) return;

                if (isLastLine || wordObjs.length === 1) {
                    // Last line: left-align, draw each word with its font
                    let xPos = startX;
                    for (let i = 0; i < wordObjs.length; i++) {
                        const { text, font } = wordObjs[i];
                        page.drawText(text, {
                            x: xPos,
                            y: y,
                            size: bodyFontSize,
                            font: font,
                            color: textColor,
                        });
                        xPos += font.widthOfTextAtSize(text, bodyFontSize);
                        if (i < wordObjs.length - 1) {
                            xPos += fontRegular.widthOfTextAtSize(' ', bodyFontSize);
                        }
                    }
                } else {
                    // Calculate total word width
                    let totalWordWidth = 0;
                    for (const { text, font } of wordObjs) {
                        totalWordWidth += font.widthOfTextAtSize(text, bodyFontSize);
                    }
                    const extraSpace = (maxWidth - totalWordWidth) / (wordObjs.length - 1);

                    // Draw each word with adjusted spacing
                    let xPos = startX;
                    for (let i = 0; i < wordObjs.length; i++) {
                        const { text, font } = wordObjs[i];
                        page.drawText(text, {
                            x: xPos,
                            y: y,
                            size: bodyFontSize,
                            font: font,
                            color: textColor,
                        });
                        xPos += font.widthOfTextAtSize(text, bodyFontSize) + extraSpace;
                    }
                }
            };

            // Build word objects with font assignments for paragraph 1
            const titleText = certificateData.workshopTitle;
            const para1Words = [];

            // 1. Pre-title (Regular)
            const preTitle = 'Por su participación en el';
            preTitle.split(' ').forEach(word => {
                if (word) para1Words.push({ text: word, font: fontRegular });
            });

            // 2. Title (SemiBold) with curly quotes attached
            const titleWords = titleText.split(' ');
            titleWords.forEach((word, index) => {
                let text = word;
                if (index === 0) text = `“${text}`; // Add opening curly quote
                if (index === titleWords.length - 1) text = `${text}”,`; // Add closing curly quote and comma
                para1Words.push({ text: text, font: fontSemiBold });
            });

            // 3. Post-title (Regular)
            const postTitle = `con una duración de ${certificateData.duration} hora(s), realizado del ${formatDateRange()}.`;
            postTitle.split(' ').forEach(word => {
                if (word) para1Words.push({ text: word, font: fontRegular });
            });

            // Word wrap and justify
            let lineWords = [];
            for (let i = 0; i < para1Words.length; i++) {
                const testWords = [...lineWords, para1Words[i]];
                // Calculate line width
                let lineWidth = 0;
                for (let j = 0; j < testWords.length; j++) {
                    lineWidth += testWords[j].font.widthOfTextAtSize(testWords[j].text, bodyFontSize);
                    if (j < testWords.length - 1) {
                        lineWidth += fontRegular.widthOfTextAtSize(' ', bodyFontSize);
                    }
                }

                if (lineWidth > textMaxWidth && lineWords.length > 0) {
                    drawJustifiedMixedLine(lineWords, textStartX, currentY, textMaxWidth);
                    currentY -= lineHeight;
                    lineWords = [para1Words[i]];
                } else {
                    lineWords.push(para1Words[i]);
                }
            }
            if (lineWords.length > 0) {
                drawJustifiedMixedLine(lineWords, textStartX, currentY, textMaxWidth, true);
                currentY -= lineHeight;
            }

            // Second paragraph (continues from first) - all Regular font
            currentY -= 2;
            const para2 = `La Universidad Estatal de Milagro a través de la Gestión de Emprendimiento de la Escuela de Formación y Emprendimiento, expide el presente certificado en Milagro, a los ${formatDateText(certificateData.issueDate)}.`;
            const para2RawWords = para2.split(' ');
            const para2Words = para2RawWords.map(word => ({ text: word, font: fontRegular }));
            lineWords = [];

            for (let i = 0; i < para2Words.length; i++) {
                const testWords = [...lineWords, para2Words[i]];
                let lineWidth = 0;
                for (let j = 0; j < testWords.length; j++) {
                    lineWidth += testWords[j].font.widthOfTextAtSize(testWords[j].text, bodyFontSize);
                    if (j < testWords.length - 1) {
                        lineWidth += fontRegular.widthOfTextAtSize(' ', bodyFontSize);
                    }
                }

                if (lineWidth > textMaxWidth && lineWords.length > 0) {
                    drawJustifiedMixedLine(lineWords, textStartX, currentY, textMaxWidth);
                    currentY -= lineHeight;
                    lineWords = [para2Words[i]];
                } else {
                    lineWords.push(para2Words[i]);
                }
            }
            if (lineWords.length > 0) {
                drawJustifiedMixedLine(lineWords, textStartX, currentY, textMaxWidth, true);
            }

            // Generate the PDF bytes
            const pdfBytes = await pdfDoc.save();
            return pdfBytes;

        } catch (err) {
            console.error('Error generating PDF:', err);
            return null;
        }
    };

    // State for PDF preview URL
    const [previewPdfUrl, setPreviewPdfUrl] = useState(null);

    const handlePreview = async (attendee) => {
        setPreviewAttendee(attendee);
        setGenerating(true);

        try {
            const pdfBytes = await generatePDF(attendee.name);
            if (pdfBytes) {
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                setPreviewPdfUrl(url);
            }
        } catch (err) {
            console.error(err);
            addToast('Error al generar vista previa', 'error');
        }

        setGenerating(false);
    };

    const closePreview = () => {
        if (previewPdfUrl) {
            URL.revokeObjectURL(previewPdfUrl);
            setPreviewPdfUrl(null);
        }
        setPreviewAttendee(null);
    };

    const handleDownloadSingle = async (attendee) => {
        setGenerating(true);

        try {
            const pdfBytes = await generatePDF(attendee.name);
            if (pdfBytes) {
                const blob = new Blob([pdfBytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Certificado_${attendee.name.replace(/\s+/g, '_')}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                addToast(`Certificado generado para ${attendee.name}`, 'success');
            } else {
                addToast('Error al generar certificado', 'error');
            }
        } catch (err) {
            console.error(err);
            addToast('Error al generar certificado', 'error');
        }

        setGenerating(false);
    };

    const handleDownloadAll = async () => {
        if (selectedAttendees.size === 0) {
            addToast('Selecciona al menos un participante', 'error');
            return;
        }

        setGenerating(true);
        const zip = new JSZip();
        const selected = attendees.filter(a => selectedAttendees.has(a.id));

        for (let i = 0; i < selected.length; i++) {
            const attendee = selected[i];

            try {
                const pdfBytes = await generatePDF(attendee.name);
                if (pdfBytes) {
                    zip.file(`Certificado_${attendee.name.replace(/\s+/g, '_')}.pdf`, pdfBytes);
                }
            } catch (err) {
                console.error(err);
            }
        }

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificados_${selectedSurvey?.title?.replace(/\s+/g, '_') || 'Taller'}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            addToast(`${selected.length} certificados generados`, 'success');
        } catch (err) {
            console.error(err);
            addToast('Error al crear ZIP', 'error');
        }

        setGenerating(false);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/portal')}
                                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                    <Award size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">Certificados</h1>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Generador de certificados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Panel: Configuration */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Event Selection */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Calendar size={18} className="text-amber-500" />
                                Seleccionar Evento
                            </h2>
                            <select
                                value={selectedSurvey?.id || ''}
                                onChange={(e) => {
                                    const survey = eventsWithAttendees.find(s => s.id === e.target.value);
                                    setSelectedSurvey(survey);
                                    setSelectedAttendees(new Set());
                                }}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="">-- Seleccionar evento --</option>
                                {eventsWithAttendees.map(survey => (
                                    <option key={survey.id} value={survey.id}>
                                        {survey.title} ({survey.responses?.length || 0} asistentes)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Certificate Data */}
                        {selectedSurvey && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText size={18} className="text-amber-500" />
                                    Datos del Certificado
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Título del Taller
                                        </label>
                                        <input
                                            type="text"
                                            value={certificateData.workshopTitle}
                                            onChange={(e) => setCertificateData(prev => ({ ...prev, workshopTitle: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            placeholder="Ej: Taller de Artesanías"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Duración (horas)
                                        </label>
                                        <input
                                            type="number"
                                            value={certificateData.duration}
                                            onChange={(e) => setCertificateData(prev => ({ ...prev, duration: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Fecha Inicio
                                            </label>
                                            <input
                                                type="date"
                                                value={certificateData.workshopDateStart}
                                                onChange={(e) => setCertificateData(prev => ({ ...prev, workshopDateStart: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Fecha Fin
                                            </label>
                                            <input
                                                type="date"
                                                value={certificateData.workshopDateEnd}
                                                onChange={(e) => setCertificateData(prev => ({ ...prev, workshopDateEnd: e.target.value }))}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                            Fecha de Emisión
                                        </label>
                                        <input
                                            type="date"
                                            value={certificateData.issueDate}
                                            onChange={(e) => setCertificateData(prev => ({ ...prev, issueDate: e.target.value }))}
                                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Attendees List */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedSurvey ? (
                            <>
                                {/* Actions Bar */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={handleSelectAll}
                                            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
                                        >
                                            {selectedAttendees.size === attendees.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                        </button>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {selectedAttendees.size} de {attendees.length} seleccionados
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleDownloadAll}
                                        disabled={selectedAttendees.size === 0 || generating}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {generating ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Generando...
                                            </>
                                        ) : (
                                            <>
                                                <Download size={18} />
                                                Descargar ZIP ({selectedAttendees.size})
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Attendees List */}
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                        <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Users size={18} className="text-amber-500" />
                                            Participantes ({attendees.length})
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                                        {attendees.map((attendee) => (
                                            <div
                                                key={attendee.id}
                                                className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedAttendees.has(attendee.id)}
                                                        onChange={() => toggleAttendee(attendee.id)}
                                                        className="w-5 h-5 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-900 dark:text-white">{attendee.name}</p>
                                                        {attendee.email && (
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">{attendee.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handlePreview(attendee)}
                                                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                                                        title="Vista previa"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadSingle(attendee)}
                                                        disabled={generating}
                                                        className="p-2 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 transition-colors"
                                                        title="Descargar PDF"
                                                    >
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 border border-slate-200 dark:border-slate-700 text-center">
                                <Award size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Selecciona un evento
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400">
                                    Elige un evento o taller para generar certificados para sus participantes.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Certificate Preview Modal */}
                {previewAttendee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closePreview}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">Vista Previa - {previewAttendee.name}</h3>
                                <button
                                    onClick={closePreview}
                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="p-4 bg-slate-100" style={{ height: '550px' }}>
                                {generating ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center">
                                            <Loader2 size={48} className="animate-spin text-amber-500 mx-auto mb-4" />
                                            <p className="text-slate-600">Generando vista previa...</p>
                                        </div>
                                    </div>
                                ) : previewPdfUrl ? (
                                    <iframe
                                        src={previewPdfUrl}
                                        className="w-full h-full rounded-lg border border-slate-300"
                                        title="Vista previa del certificado"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-slate-500">Error al generar vista previa</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    onClick={closePreview}
                                    className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => handleDownloadSingle(previewAttendee)}
                                    disabled={generating}
                                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold hover:from-amber-600 hover:to-orange-700 transition-all flex items-center gap-2"
                                >
                                    {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                    Descargar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
