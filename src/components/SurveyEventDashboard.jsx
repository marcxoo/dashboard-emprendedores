
import { useState, useEffect, useRef } from 'react';
import Plus from 'lucide-react/dist/esm/icons/plus';
import X from 'lucide-react/dist/esm/icons/x';
import AlignLeft from 'lucide-react/dist/esm/icons/align-left';
import CheckSquare from 'lucide-react/dist/esm/icons/check-square';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Users from 'lucide-react/dist/esm/icons/users';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal';
import Copy from 'lucide-react/dist/esm/icons/copy';
import LayoutList from 'lucide-react/dist/esm/icons/layout-list';
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import Check from 'lucide-react/dist/esm/icons/check';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import Info from 'lucide-react/dist/esm/icons/info';
import Menu from 'lucide-react/dist/esm/icons/menu';
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid';
import Link from 'lucide-react/dist/esm/icons/link';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import Table from 'lucide-react/dist/esm/icons/table';
import MoreVertical from 'lucide-react/dist/esm/icons/more-vertical';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

// Helper to parse note field for metadata
const parseSurveyNote = (noteString) => {
    try {
        if (!noteString) return { content: '', group: '' };
        if (noteString.trim().startsWith('{')) {
            const parsed = JSON.parse(noteString);
            return { content: parsed.content || '', group: parsed.group || '' };
        }
        return { content: noteString, group: '' };
    } catch (e) {
        return { content: noteString || '', group: '' };
    }
};

const SurveyDescription = ({ description }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const text = description || 'Sin descripción';
    const shouldTruncate = text.length > 60;

    return (
        <div className="mb-6 flex-1">
            <p className={`text-sm text-slate-300 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                {text}
            </p>
            {shouldTruncate && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 mt-2 flex items-center gap-1 transition-colors"
                >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                </button>
            )}
        </div>
    );
};

function SurveyEventDashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useState('list'); // 'list' | 'create'
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [viewingResultsId, setViewingResultsId] = useState(null);
    const [editingResponse, setEditingResponse] = useState(null);
    const { user, logout } = useAuth();
    const { customSurveys, addCustomSurvey, deleteCustomSurvey, updateCustomSurvey, refreshData } = useData();
    const { showToast } = useToast();
    const titleRef = useRef(null);
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);


    const navigate = useNavigate();

    // Create Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        note: '',
        groupName: '', // New field for grouping
        limit: '',
        showUrgencyBanner: true, // Default to true
        survey_type: 'standard', // 'standard', 'raffle', 'invitation'
        eventDate: '',
        eventTime: '',
        eventLocation: '',
        questions: [
            { id: 1, type: 'text', label: 'Nombre Completo', required: true, options: [] },
            { id: 2, type: 'email', label: 'Correo Electrónico', required: true, options: [] }
        ]
    });

    // Drag and Drop State for Grouping
    const [draggedSurveyId, setDraggedSurveyId] = useState(null);
    const [dragOverGroup, setDragOverGroup] = useState(null);
    const [isDraggingOverMain, setIsDraggingOverMain] = useState(false);

    // Sidebar Folder State
    const [activeFolder, setActiveFolder] = useState(null); // null = All Surveys
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [localFolders, setLocalFolders] = useState([]); // Support for empty folders
    const [isRenamingFolder, setIsRenamingFolder] = useState(false);
    const [tempFolderName, setTempFolderName] = useState('');

    // Derived Folders
    const folders = [...new Set([
        ...customSurveys.map(s => parseSurveyNote(s.note).group).filter(Boolean),
        ...localFolders
    ])].sort();

    // Survey Drag Handlers
    const handleSurveyDragStart = (e, surveyId) => {
        e.dataTransfer.setData('surveyId', surveyId);
        e.dataTransfer.effectAllowed = 'move';
        setDraggedSurveyId(surveyId);
    };

    const handleSurveyDragEnd = () => {
        setDraggedSurveyId(null);
        setDragOverGroup(null);
        setIsDraggingOverMain(false);
    };

    // Group Drop Handlers
    const handleGroupDragOver = (e, groupName) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverGroup(groupName);
        setIsDraggingOverMain(false);
    };

    const handleGroupDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverGroup(null);
    };

    const handleGroupDrop = async (e, groupName) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverGroup(null);

        const surveyId = e.dataTransfer.getData('surveyId');
        if (!surveyId) return;

        const survey = customSurveys.find(s => s.id === surveyId);
        if (!survey) return;

        // Parse existing note content
        const { content, group } = parseSurveyNote(survey.note);

        if (group === groupName) return;

        // Update with new group
        const newNote = JSON.stringify({
            content: content,
            group: groupName
        });

        const success = await updateCustomSurvey(survey.id, { note: newNote });
        if (success) showToast(`Movido a ${groupName}`, 'success');
        else showToast('Error al mover el formulario', 'error');
    };

    // Main Container Drop Handlers (Ungroup)
    const handleMainDragOver = (e) => {
        e.preventDefault();
        if (draggedSurveyId) setIsDraggingOverMain(true);
    };

    const handleMainDragLeave = (e) => {
        e.preventDefault();
        setIsDraggingOverMain(false);
    };

    const handleMainDrop = async (e) => {
        e.preventDefault();
        setIsDraggingOverMain(false);

        const surveyId = e.dataTransfer.getData('surveyId');
        if (!surveyId) return;

        const survey = customSurveys.find(s => s.id === surveyId);
        if (!survey) return;

        const { content, group } = parseSurveyNote(survey.note);

        // Only ungroup if it was in a group
        if (!group) return;

        const newNote = content ? JSON.stringify({ content, group: '' }) : ''; // Clear group

        const success = await updateCustomSurvey(survey.id, { note: newNote });
        if (success) showToast('Formulario desagrupado', 'success');
        else showToast('Error al desagrupar', 'error');
    };

    // Folder Management Handlers
    const handleRenameFolder = async () => {
        if (!activeFolder || !tempFolderName.trim() || tempFolderName === activeFolder) {
            setIsRenamingFolder(false);
            return;
        }

        const oldName = activeFolder;
        const newName = tempFolderName.trim();

        // 1. Update Local Folders
        setLocalFolders(prev => prev.map(f => f === oldName ? newName : f));

        // 2. Find surveys in this group
        const surveysInGroup = customSurveys.filter(s => {
            const { group } = parseSurveyNote(s.note);
            return group === oldName;
        });

        if (surveysInGroup.length === 0) {
            setActiveFolder(newName);
            setIsRenamingFolder(false);
            showToast('Carpeta renombrada', 'success');
            return;
        }

        // 3. Update all surveys
        try {
            const updates = surveysInGroup.map(survey => {
                const { content } = parseSurveyNote(survey.note);
                const newNote = JSON.stringify({ content, group: newName });
                return updateCustomSurvey(survey.id, { note: newNote });
            });

            await Promise.all(updates);
            setActiveFolder(newName);
            showToast('Carpeta renombrada exitosamente', 'success');
        } catch (error) {
            console.error('Error renaming folder:', error);
            showToast('Error al renombrar carpeta', 'error');
        } finally {
            setIsRenamingFolder(false);
        }
    };

    const handleDeleteFolder = async () => {
        if (!activeFolder || !window.confirm(`¿Estás seguro de eliminar la carpeta "${activeFolder}"? Los formularios NO se eliminarán, solo se desagruparán.`)) return;

        const folderName = activeFolder;

        // 1. Remove from Local Folders
        setLocalFolders(prev => prev.filter(f => f !== folderName));

        // 2. Find surveys in this group
        const surveysInGroup = customSurveys.filter(s => {
            const { group } = parseSurveyNote(s.note);
            return group === folderName;
        });

        if (surveysInGroup.length === 0) {
            setActiveFolder(null);
            setView('list');
            showToast('Carpeta eliminada', 'success');
            return;
        }

        // 3. Ungroup all surveys
        try {
            const updates = surveysInGroup.map(survey => {
                const { content } = parseSurveyNote(survey.note);
                // Preserve content, remove group. if content is empty, note becomes empty string.
                const newNote = content ? JSON.stringify({ content, group: '' }) : '';
                return updateCustomSurvey(survey.id, { note: newNote });
            });

            await Promise.all(updates);
            setActiveFolder(null);
            setView('list');
            showToast('Carpeta eliminada y formularios desagrupados', 'success');
        } catch (error) {
            console.error('Error deleting folder:', error);
            showToast('Error al eliminar carpeta', 'error');
        }
    };



    // Auto-resize title textarea on mount or when content changes
    useEffect(() => {
        if (view === 'create' && titleRef.current) {
            titleRef.current.style.height = 'auto';
            titleRef.current.style.height = titleRef.current.scrollHeight + 'px';
        }
    }, [view, formData.title]);

    const QUESTION_TYPES = [
        { value: 'text', label: 'Respuesta Corta' },
        { value: 'paragraph', label: 'Párrafo' },
        { value: 'multiple_choice', label: 'Opción Múltiple' },
        { value: 'checkbox', label: 'Casillas de Verificación' },
        { value: 'date', label: 'Fecha' },
        { value: 'email', label: 'Correo Electrónico' },
        { value: 'tel', label: 'Teléfono' },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleCreateSurvey = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!formData.title) return showToast('El título es obligatorio', 'error');
        if (formData.questions.length === 0) return showToast('Agrega al menos una pregunta', 'error');

        setIsSubmitting(true);
        try {
            // Simulate network delay for better UX (optional but good for feeling "saved")
            await new Promise(resolve => setTimeout(resolve, 800));

            // Prepare note with metadata if group exists, otherwise just content
            let finalNote = formData.note;
            if (formData.groupName) {
                finalNote = JSON.stringify({
                    content: formData.note,
                    group: formData.groupName
                });
            }

            // Sanitize data: Convert empty strings to null for optional fields
            const surveyData = {
                ...formData,
                note: finalNote,
                limit: formData.limit === '' ? null : formData.limit,
                eventDate: formData.eventDate === '' ? null : formData.eventDate,
                eventTime: formData.eventTime === '' ? null : formData.eventTime,
                eventLocation: formData.eventLocation === '' ? null : formData.eventLocation,
                active: true
            };

            // Remove temporary field from payload
            delete surveyData.groupName;

            let success;
            if (editingId) {
                success = await updateCustomSurvey(editingId, surveyData);
                if (success) showToast('Formulario actualizado exitosamente', 'success');
            } else {
                const result = await addCustomSurvey(surveyData);
                success = !!result;
                if (success) showToast('Formulario creado exitosamente', 'success');
            }

            if (!success) throw new Error('Failed to save survey');

            resetForm();
            setView('list');
            setEditingId(null); // Clear editing state
        } catch (error) {
            console.error(error);
            showToast('Error al guardar el formulario. Verifica los datos.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            note: '',
            groupName: '',
            limit: '',
            showUrgencyBanner: true,
            survey_type: 'standard',
            eventDate: '',
            eventTime: '',
            eventLocation: '',
            questions: [
                { id: 1, type: 'text', label: 'Nombre Completo', required: true, options: [] },
                { id: 2, type: 'email', label: 'Correo Electrónico', required: true, options: [] }
            ]
        });
    };

    const addQuestion = () => {
        const newId = Math.max(...formData.questions.map(q => q.id), 0) + 1;
        setFormData(prev => ({
            ...prev,
            questions: [...prev.questions, { id: newId, type: 'text', label: 'Pregunta sin título', required: false, options: ['Opción 1'] }]
        }));
    };

    const removeQuestion = (id) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== id)
        }));
    };

    const updateQuestion = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === id ? { ...q, [field]: value } : q)
        }));
    };

    const addOption = (questionId) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    return { ...q, options: [...(q.options || []), `Opción ${(q.options?.length || 0) + 1} `] };
                }
                return q;
            })
        }));
    };

    const updateOption = (questionId, optionIndex, value) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    const newOptions = [...(q.options || [])];
                    newOptions[optionIndex] = value;
                    return { ...q, options: newOptions };
                }
                return q;
            })
        }));
    };

    const removeOption = (questionId, optionIndex) => {
        setFormData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    const newOptions = q.options.filter((_, idx) => idx !== optionIndex);
                    return { ...q, options: newOptions };
                }
                return q;
            })
        }));
    };

    const handleDragStart = (e, index) => {
        // Only allow drag if handle is targeted
        if (!e.target.closest('.drag-handle')) {
            e.preventDefault();
            return;
        }
        dragItem.current = index;
    };

    const handleDragEnter = (e, index) => {
        dragOverItem.current = index;
    };

    const handleDragEnd = () => {
        const _dragItem = dragItem.current;
        const _dragOverItem = dragOverItem.current;

        if (_dragItem === null || _dragOverItem === null || _dragItem === _dragOverItem) {
            dragItem.current = null;
            dragOverItem.current = null;
            return;
        }

        const newQuestions = [...formData.questions];
        const draggedQuestion = newQuestions[_dragItem];

        newQuestions.splice(_dragItem, 1);
        newQuestions.splice(_dragOverItem, 0, draggedQuestion);

        setFormData(prev => ({ ...prev, questions: newQuestions }));

        dragItem.current = null;
        dragOverItem.current = null;
    };

    const copyToClipboard = (id) => {
        const url = `${window.location.origin}/forms/${id}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        showToast('Link copiado al portapapeles', 'success');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este formulario? Se perderán todas las respuestas.')) {
            await deleteCustomSurvey(id);
            showToast('Formulario eliminado', 'success');
        }
    };

    const handleEdit = (survey) => {
        setEditingId(survey.id);
        const parsedNote = parseSurveyNote(survey.note);

        setFormData({
            title: survey.title,
            description: survey.description || '',
            note: parsedNote.content,
            groupName: parsedNote.group,
            limit: survey.limit ?? '',
            showUrgencyBanner: survey.showUrgencyBanner ?? true,
            survey_type: survey.survey_type || 'standard',
            eventDate: survey.eventDate || '',
            eventTime: survey.eventTime || '',
            eventLocation: survey.eventLocation || '',
            questions: survey.questions
        });
        setView('create');
    };

    const handleDeleteResponse = async (responseId) => {
        if (window.confirm('¿Estás seguro de eliminar esta respuesta? Se liberará un cupo.')) {
            try {
                const { error } = await supabase
                    .from('survey_responses')
                    .delete()
                    .eq('id', responseId);

                if (error) throw error;

                await refreshData();
                showToast('Respuesta eliminada correctamente', 'success');
            } catch (error) {
                console.error(error);
                showToast('Error al eliminar la respuesta', 'error');
            }
        }
    };

    const handleEditResponse = (response) => {
        setEditingResponse({
            id: response.id,
            answers: { ...response.answers }
        });
    };

    const handleSaveResponseEdit = async (e) => {
        e.preventDefault();
        if (!editingResponse) return;

        try {
            const { error } = await supabase
                .from('survey_responses')
                .update({ answers: editingResponse.answers })
                .eq('id', editingResponse.id);

            if (error) throw error;

            await refreshData();
            showToast('Respuesta actualizada', 'success');
            setEditingResponse(null);
        } catch (error) {
            console.error(error);
            showToast('Error al actualizar', 'error');
        }
    };

    const handleDownloadCSV = (survey) => {
        if (!survey || !survey.responses || survey.responses.length === 0) {
            return showToast('No hay respuestas para descargar', 'error');
        }

        // Headers
        const questions = survey.questions.map(q => q.label);
        const headers = ['Fecha', ...questions];

        // Rows
        const rows = survey.responses.map(response => {
            const date = new Date(response.submittedAt).toLocaleString();
            const answers = survey.questions.map(q => {
                const answer = response.answers[q.label];
                if (Array.isArray(answer)) return answer.join('; '); // Checkbox
                return answer || '';
            });
            return [date, ...answers];
        });

        // CSV String
        // CSV String (Using Semicolon for Excel compatibility)
        const csvContent = [
            headers.join(';'),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
        ].join('\n');

        // Download with BOM for UTF-8 compatibility
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${survey.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resultados.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex min-h-screen bg-[#0F172A] selection:bg-indigo-500/30 selection:text-indigo-200 font-sans text-slate-100">
            {/* Premium Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>
                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-violet-500/5 blur-[100px]"></div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl z-50 flex items-center px-4 justify-between border-b border-white/5">
                <div className="font-bold text-xl text-white tracking-tight flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="font-black text-lg text-white">E</span>
                    </div>
                    <span>Emprende<span className="text-indigo-400">Forms</span></span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-0 lg:left-6 top-16 lg:top-6 bottom-0 lg:bottom-6 z-50 w-72 
                bg-slate-900/90 lg:bg-slate-900/60 backdrop-blur-2xl border-r lg:border border-white/5 
                shadow-2xl shadow-black/50 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) 
                lg:rounded-3xl flex flex-col overflow-hidden
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="p-8 pb-6 relative overflow-hidden group cursor-default">
                    <div className="relative flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            <span className="font-black text-xl text-white tracking-tighter">E</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none text-white tracking-tight">Emprende<span className="text-indigo-400">Forms</span></h1>
                            <p className="text-[10px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">Gestión Pro</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-2">Menu Principal</p>

                    <button
                        onClick={() => { resetForm(); setViewingResultsId(null); setView('list'); setActiveFolder(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${view === 'list' && !activeFolder
                            ? 'bg-indigo-500/10 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                    >
                        <LayoutGrid size={18} className={`transition-transform group-hover:scale-110 ${view === 'list' && !activeFolder ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                        <span className="font-semibold text-sm tracking-wide">Mis Formularios</span>
                        {customSurveys.length > 0 && (
                            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${view === 'list' && !activeFolder ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                                {customSurveys.length}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => { resetForm(); setViewingResultsId(null); setView('create'); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${view === 'create'
                            ? 'bg-indigo-500/10 text-white shadow-lg shadow-indigo-900/20 border border-indigo-500/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                    >
                        <Plus size={18} className={`transition-transform group-hover:rotate-90 ${view === 'create' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                        <span className="font-semibold text-sm tracking-wide">Crear Nuevo</span>
                    </button>

                    {/* Folders Section */}
                    <div className="pt-4 mt-2 border-t border-white/5 mx-4">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Carpetas</p>

                        <div className="space-y-1">
                            {folders.map(folder => (
                                <button
                                    key={folder}
                                    onClick={() => { setActiveFolder(folder); setView('list'); setViewingResultsId(null); }}
                                    onDragOver={(e) => handleGroupDragOver(e, folder)}
                                    onDragLeave={handleGroupDragLeave}
                                    onDrop={(e) => handleGroupDrop(e, folder)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 group/folder relative ${activeFolder === folder || dragOverGroup === folder
                                        ? 'bg-purple-500/10 text-purple-200 border border-purple-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                                        }`}
                                >
                                    <LayoutList size={16} className={activeFolder === folder ? 'text-purple-400' : 'text-slate-600 group-hover/folder:text-purple-400 transition-colors'} />
                                    <span className="text-xs font-bold truncate">{folder}</span>
                                    {dragOverGroup === folder && (
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                            ))}

                            {/* Create Folder Input/Button */}
                            {isCreatingFolder ? (
                                <div className="mt-2 animate-fade-in px-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                if (newFolderName.trim()) {
                                                    setLocalFolders(prev => [...prev, newFolderName.trim()]);
                                                    setIsCreatingFolder(false);
                                                    setNewFolderName('');
                                                    showToast('Carpeta creada', 'success');
                                                }
                                            }
                                            if (e.key === 'Escape') setIsCreatingFolder(false);
                                        }}
                                        onBlur={() => setIsCreatingFolder(false)}
                                        placeholder="Nombre..."
                                        className="w-full bg-black/40 border border-purple-500/50 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-600"
                                    />
                                    <p className="text-[9px] text-slate-500 mt-1 pl-1">Presiona Enter para guardar</p>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-purple-400 hover:bg-purple-500/5 rounded-lg transition-colors mt-2 border border-dashed border-white/5 hover:border-purple-500/20 group/add"
                                >
                                    <Plus size={14} className="group-hover/add:rotate-90 transition-transform" />
                                    Nueva Carpeta
                                </button>
                            )}
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center border border-white/10 shadow-inner">
                            <Users size={16} className="text-slate-300" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-white truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-[10px] font-medium text-slate-500 truncate">Administrador</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => navigate('/portal')}
                            className="py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 border border-white/5 transition-colors uppercase tracking-wider"
                        >
                            Portal
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 transition-colors"
                        >
                            <LogOut size={14} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 transition-all duration-300 w-full max-w-full overflow-x-hidden relative z-10">
                <header className="hidden lg:flex h-20 items-center justify-between px-10 sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            {view === 'list' && !viewingResultsId && 'Mis Formularios'}
                            {view === 'list' && viewingResultsId && 'Resultados'}
                            {view === 'create' && (editingId ? 'Editar Formulario' : 'Nuevo Formulario')}
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                            {view === 'list' && !viewingResultsId && 'Gestión y Monitoreo'}
                            {view === 'list' && viewingResultsId && 'Análisis de Datos'}
                            {view === 'create' && 'Configuración de Evento'}
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold text-slate-400">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </div>
                    </div>
                </header>

                <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
                    {view === 'create' && (
                        <form onSubmit={handleCreateSurvey} className="space-y-8 animate-fade-in pb-20">
                            {/* General Info Card */}
                            <div className="bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="space-y-8 relative z-10">
                                    <div className="relative">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Título del Evento</label>
                                        <textarea
                                            ref={titleRef}
                                            required
                                            value={formData.title}
                                            onChange={e => {
                                                setFormData({ ...formData, title: e.target.value });
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            rows={1}
                                            className="w-full text-4xl lg:text-5xl font-black bg-transparent border-none outline-none placeholder-slate-700 text-white resize-none overflow-hidden p-0 focus:ring-0 leading-tight tracking-tight"
                                            placeholder="Escribe un título..."
                                            style={{ minHeight: '3.5rem' }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full text-lg bg-transparent border-none outline-none placeholder-slate-600 text-slate-300 resize-none h-24 p-0 focus:ring-0 leading-relaxed font-medium"
                                            placeholder="Describe el propósito de este formulario..."
                                        />
                                    </div>



                                    {/* Note Toggle Section */}
                                    <div className="pt-4">
                                        {!formData.note && formData.note !== '' ? (
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, note: '' })}
                                                className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-amber-400 transition-colors px-2 py-1 -ml-2 rounded-lg hover:bg-amber-500/10"
                                            >
                                                <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-500 group-hover:bg-amber-500/20 group-hover:text-amber-500 flex items-center justify-center transition-colors">
                                                    <Plus size={14} strokeWidth={3} />
                                                </div>
                                                Agregar Nota de Aviso
                                            </button>
                                        ) : (
                                            <div className="relative group/note animate-fade-in">
                                                <div className="absolute inset-0 bg-amber-500/5 rounded-2xl opacity-50 transition-opacity group-hover/note:opacity-100"></div>
                                                <div className="relative p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 group-focus-within/note:bg-slate-900 group-focus-within/note:border-amber-500/50 transition-all duration-300">

                                                    <div className="flex items-start gap-4">
                                                        <div className="shrink-0 mt-1">
                                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                                                                <Info size={20} />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                                                                    Nota Visible al Público
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, note: null })}
                                                                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                                                                    title="Eliminar nota"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>

                                                            <textarea
                                                                value={formData.note}
                                                                onChange={e => setFormData({ ...formData, note: e.target.value })}
                                                                className="w-full text-base bg-transparent border-none outline-none placeholder-slate-500 text-slate-200 resize-none h-24 p-0 focus:ring-0 leading-relaxed font-medium"
                                                                placeholder="Escribe aquí un aviso importante (ej. requisitos, vestimenta, laptop...)"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Urgency Banner Toggle */}
                                    <div className="flex items-center gap-3 px-1 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, showUrgencyBanner: !formData.showUrgencyBanner })}
                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${formData.showUrgencyBanner ? 'bg-indigo-500' : 'bg-slate-700'}`}
                                            role="switch"
                                            aria-checked={formData.showUrgencyBanner}
                                        >
                                            <span className="sr-only">Mostrar aviso de urgencia</span>
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.showUrgencyBanner ? 'translate-x-5' : 'translate-x-0'}`}
                                            />
                                        </button>
                                        <span onClick={() => setFormData({ ...formData, showUrgencyBanner: !formData.showUrgencyBanner })} className="text-sm font-bold text-slate-400 cursor-pointer hover:text-white transition-colors">
                                            Mostrar Aviso de "Últimos Cupos"
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-white/5">
                                        <div className="flex flex-col group/field">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-400 transition-colors">Fecha</label>
                                            <input
                                                type="date"
                                                value={formData.eventDate}
                                                onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                                className="w-full px-4 py-3 border border-white/5 rounded-xl bg-black/20 text-white focus:border-indigo-500 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-400 transition-colors">Hora</label>
                                            <input
                                                type="time"
                                                value={formData.eventTime}
                                                onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
                                                className="w-full px-4 py-3 border border-white/5 rounded-xl bg-black/20 text-white focus:border-indigo-500 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-400 transition-colors">Lugar</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Auditorio"
                                                value={formData.eventLocation}
                                                onChange={e => setFormData({ ...formData, eventLocation: e.target.value })}
                                                className="w-full px-4 py-3 border border-white/5 rounded-xl bg-black/20 text-white focus:border-indigo-500 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium placeholder-slate-600"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1 group-focus-within/field:text-indigo-400 transition-colors">Cupos</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={formData.limit}
                                                    onChange={e => setFormData({ ...formData, limit: e.target.value === '' ? '' : parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 border border-white/5 rounded-xl bg-black/20 text-white focus:border-indigo-500 focus:bg-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-bold text-center"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                                                    <Users size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-2 border-t border-white/5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block ml-1">Tipo de Experiencia</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'standard', label: 'Asistencia Taller', desc: 'Registro simple', icon: FileText },
                                                { id: 'invitation', label: 'Invitación', desc: 'Registro previo', icon: Check },
                                                { id: 'raffle', label: 'Asistencia Emprendex', desc: 'Incluye Ruleta', icon: Trophy }
                                            ].map(type => {
                                                const Icon = type.icon;
                                                const isSelected = formData.survey_type === type.id;
                                                return (
                                                    <div
                                                        key={type.id}
                                                        onClick={() => setFormData({ ...formData, survey_type: type.id })}
                                                        className={`cursor-pointer relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 group/type ${isSelected
                                                            ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10'
                                                            : 'border-white/5 hover:border-white/10 bg-black/20 hover:bg-black/30'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-indigo-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500'}`}>
                                                                <Icon size={20} />
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-700'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm"></div>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-white' : 'text-slate-400 group-hover/type:text-slate-300'}`}>{type.label}</h4>
                                                            <p className={`text-xs ${isSelected ? 'text-indigo-200/70' : 'text-slate-600'}`}>{type.desc}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xl font-black text-white flex items-center gap-3 tracking-tight">
                                        <span className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/30">{formData.questions.length}</span>
                                        Preguntas
                                    </h3>
                                    <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent ml-8"></div>
                                </div>

                                {formData.questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="group bg-slate-800/40 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-black/20 border border-white/5 p-1 pl-1 relative transition-all duration-300 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1 hover:bg-slate-800/60"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragEnter={(e) => handleDragEnter(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="p-6 md:p-8">
                                            {/* Drag Handle */}
                                            <div className="drag-handle absolute top-6 right-6 opacity-0 group-hover:opacity-100 cursor-move p-2 text-slate-500 hover:text-white transition-colors">
                                                <GripVertical size={24} />
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-8 mb-8 pr-12">
                                                <div className="flex-1 group/field">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within/field:text-indigo-400 transition-colors">Pregunta</label>
                                                    <input
                                                        type="text"
                                                        value={q.label}
                                                        onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                                        className="w-full text-xl font-bold bg-transparent border-b-2 border-white/5 hover:border-white/10 focus:border-indigo-500 outline-none py-3 text-white placeholder-slate-600 transition-all leading-relaxed"
                                                        placeholder="¿Qué quieres preguntar?"
                                                    />
                                                </div>
                                                <div className="w-full md:w-72 group/field">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1 group-focus-within/field:text-indigo-400 transition-colors">Tipo de Respuesta</label>
                                                    <div className="relative">
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                            className="w-full pl-4 pr-10 py-3 appearance-none bg-black/20 border border-white/5 rounded-xl focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 font-medium cursor-pointer hover:bg-white/5 transition-colors"
                                                        >
                                                            {QUESTION_TYPES.map(type => (
                                                                <option key={type.value} value={type.value} className="bg-slate-900 text-slate-200">{type.label}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                            <MoreVertical size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Options */}
                                            {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                                                <div className="bg-black/20 rounded-2xl p-6 mb-8 border border-white/5">
                                                    <div className="space-y-4">
                                                        {q.options?.map((opt, optIdx) => (
                                                            <div key={optIdx} className="flex items-center gap-4 group/opt">
                                                                <div className={`w-5 h-5 flex-shrink-0 border-2 ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded-md'} border-slate-600 bg-slate-800`}></div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                                    className="flex-1 bg-transparent border-b border-transparent hover:border-white/10 focus:border-indigo-500 outline-none py-1.5 text-sm font-medium text-slate-300 transition-colors placeholder-slate-600"
                                                                    placeholder={`Opción ${optIdx + 1}`}
                                                                />
                                                                <button type="button" onClick={() => removeOption(q.id, optIdx)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover/opt:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addOption(q.id)}
                                                            className="text-sm text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-2 pl-1 py-2 mt-2 hover:translate-x-1 transition-transform"
                                                        >
                                                            <div className="bg-indigo-500/10 p-1 rounded-md">
                                                                <Plus size={14} className="text-indigo-400" />
                                                            </div>
                                                            Agregar otra opción
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                                        <div className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${q.required ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-700'}`}>
                                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${q.required ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-500 group-hover/toggle:text-slate-300 transition-colors uppercase tracking-wider">Obligatorio</span>
                                                        <input type="checkbox" className="hidden" checked={q.required} onChange={() => updateQuestion(q.id, 'required', !q.required)} />
                                                    </label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(q.id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold text-xs uppercase tracking-wider group/del"
                                                    title="Eliminar pregunta"
                                                >
                                                    <Trash2 size={14} className="group-hover/del:scale-110 transition-transform mb-0.5" />
                                                    <span>Eliminar</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center pb-8 pt-4">
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-3 px-8 py-5 bg-slate-800/40 border-2 border-dashed border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo-500/50 hover:bg-slate-800/80 hover:-translate-y-1 transition-all text-slate-400 hover:text-indigo-400 font-bold group w-full md:w-auto justify-center"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-indigo-500/20 text-slate-500 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                                        <Plus size={18} strokeWidth={3} />
                                    </div>
                                    Agregar Nueva Pregunta
                                </button>
                            </div>

                            {/* Floating Footer */}
                            <div className="fixed bottom-6 w-[calc(100%-2rem)] lg:w-[calc(100%-20rem)] left-1/2 lg:left-[calc(50%+9rem)] -translate-x-1/2 bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 flex flex-col sm:flex-row justify-between items-center z-30 gap-4 sm:gap-0 transition-all duration-300">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-300 px-4">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span>{formData.questions.length} preguntas configuradas</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button type="button" onClick={() => { resetForm(); setView('list'); }} className="flex-1 sm:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-bold rounded-xl transition-colors text-sm">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 sm:flex-none px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar Formulario'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {view === 'list' && viewingResultsId && (() => {
                        const survey = customSurveys.find(s => s.id === viewingResultsId);
                        if (!survey) return null;
                        const responses = survey.responses || [];

                        return (
                            <div className="space-y-8 animate-fade-in pb-12">
                                <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 shadow-2xl shadow-black/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-transparent opacity-50"></div>

                                    <div className="min-w-0 flex-1 relative z-10">
                                        <button onClick={() => setViewingResultsId(null)} className="text-slate-400 hover:text-white text-sm font-bold mb-4 flex items-center gap-2 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                                <ArrowLeft size={16} />
                                            </div>
                                            Volver a Formularios
                                        </button>
                                        <h1 className="text-3xl font-black text-white break-words leading-tight tracking-tight mb-2">{survey.title}</h1>
                                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                            {responses.length} respuestas recibidas
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0 relative z-10">
                                        <button
                                            onClick={() => handleDownloadCSV(survey)}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5"
                                        >
                                            <FileDown size={20} className="flex-shrink-0" />
                                            <span>Descargar Excel</span>
                                        </button>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    // Headers
                                                    const questions = survey.questions.map(q => q.label);
                                                    const headers = ['Fecha', ...questions];

                                                    // Rows
                                                    const rows = survey.responses.map(response => {
                                                        const date = new Date(response.created_at || response.createdAt || response.submittedAt).toLocaleString();
                                                        const answers = survey.questions.map(q => {
                                                            const answer = response.answers[q.label];
                                                            if (Array.isArray(answer)) return answer.join(', ');
                                                            return answer || '';
                                                        });
                                                        return [date, ...answers];
                                                    });

                                                    // TSV String (Tab Separated for easy pasting)
                                                    const tsvContent = [
                                                        headers.join('\t'),
                                                        ...rows.map(row => row.map(cell => String(cell).replace(/\t/g, ' ')).join('\t'))
                                                    ].join('\n');

                                                    await navigator.clipboard.writeText(tsvContent);
                                                    window.open('https://sheets.new', '_blank');
                                                    showToast('¡Datos copiados! Pega (Ctrl+V) en la hoja de cálculo.', 'success');
                                                } catch (err) {
                                                    console.error('Failed to copy: ', err);
                                                    showToast('Error al copiar datos', 'error');
                                                }
                                            }}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-bold transition-all shadow-lg shadow-black/20 hover:-translate-y-0.5"
                                        >
                                            <Table size={20} className="flex-shrink-0" />
                                            <span>Abrir en Sheets</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/20 overflow-hidden">
                                    <div className="overflow-x-auto custom-scrollbar">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-black/20 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                    <th className="p-6 whitespace-nowrap">Fecha</th>
                                                    {survey.questions.map(q => (
                                                        <th key={q.id} className="p-6 whitespace-nowrap min-w-[200px]">{q.label}</th>
                                                    ))}
                                                    <th className="p-6 whitespace-nowrap text-right sticky right-0 z-20 bg-[#0f1523] pl-8 border-l border-white/5">
                                                        Acciones
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {responses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={survey.questions.length + 2} className="p-16 text-center text-slate-500 font-medium">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-600">
                                                                    <Inbox size={32} />
                                                                </div>
                                                                <p>Aún no hay respuestas para mostrar.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    responses.map((r, idx) => {
                                                        const dateVal = r.created_at || r.createdAt || r.submittedAt;
                                                        return (
                                                            <tr key={idx} className="group hover:bg-white/5 transition-colors duration-300">
                                                                <td className="p-6 whitespace-nowrap text-slate-400 font-bold text-xs">
                                                                    {dateVal ? (
                                                                        <div className="flex flex-col gap-0.5">
                                                                            <span className="text-slate-200">{new Date(dateVal).toLocaleDateString()}</span>
                                                                            <span className="text-slate-500 text-[10px] font-mono">{new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>
                                                                    ) : 'Fecha inválida'}
                                                                </td>
                                                                {survey.questions.map(q => (
                                                                    <td key={q.id} className="p-6 max-w-[300px] truncate text-sm font-medium text-slate-300 group-hover:text-white transition-colors" title={Array.isArray(r.answers[q.label]) ? r.answers[q.label].join(', ') : r.answers[q.label]}>
                                                                        {Array.isArray(r.answers[q.label])
                                                                            ? r.answers[q.label].join(', ')
                                                                            : r.answers[q.label]}
                                                                    </td>
                                                                ))}
                                                                <td className="p-4 text-right whitespace-nowrap sticky right-0 z-10 bg-[#0f1523] group-hover:bg-[#131b2e] border-l border-white/5 transition-colors">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <button
                                                                            onClick={() => handleEditResponse(r)}
                                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all hover:scale-110 active:scale-95"
                                                                            title="Editar"
                                                                        >
                                                                            <Pencil size={16} strokeWidth={2} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteResponse(r.id)}
                                                                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all hover:scale-110 active:scale-95"
                                                                            title="Eliminar"
                                                                        >
                                                                            <Trash2 size={16} strokeWidth={2} />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {view === 'list' && !viewingResultsId && (
                        <div className="grid gap-8 animate-fade-in pb-12">
                            {customSurveys.length === 0 ? (
                                <div className="text-center py-32 bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] border border-dashed border-white/10 group relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                    <div className="w-24 h-24 bg-gradient-to-tr from-slate-800 to-slate-700 text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-black/50 border border-white/5 relative z-10">
                                        <FileText size={40} className="group-hover:rotate-6 transition-transform" />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight relative z-10">Crea tu primer evento</h3>
                                    <p className="text-lg text-slate-400 mb-10 max-w-md mx-auto leading-relaxed relative z-10">Configura formularios personalizados para talleres, ruletas y registros de asistencia en segundos.</p>
                                    <button onClick={() => setView('create')} className="relative z-10 px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl transition-all font-bold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-1">
                                        + Nuevo Formulario
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 transition-colors duration-300 rounded-[3rem] p-2 -m-2 md:p-4 md:-m-4 ${isDraggingOverMain ? 'bg-indigo-500/10 ring-2 ring-indigo-500/30' : ''}`}
                                    onDragOver={handleMainDragOver}
                                    onDragLeave={handleMainDragLeave}
                                    onDrop={handleMainDrop}
                                >
                                    {(() => {
                                        // Grouping Logic with Folder Support
                                        let surveysToRender = customSurveys;

                                        // 1. Filter if activeFolder is set
                                        if (activeFolder) {
                                            surveysToRender = customSurveys.filter(survey => {
                                                const { group } = parseSurveyNote(survey.note);
                                                return group === activeFolder;
                                            });

                                            // Sort surveys by event date: Upcoming (Ascending) -> Past (Ascending)
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);

                                            surveysToRender = surveysToRender.sort((a, b) => {
                                                const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0); // No date = Past
                                                const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0);

                                                const isFutureA = dateA >= now;
                                                const isFutureB = dateB >= now;

                                                if (isFutureA && !isFutureB) return -1; // A is future, B is past -> A first
                                                if (!isFutureA && isFutureB) return 1;  // B is future, A is past -> B first

                                                // If both are future or both are past/invalid, sort by date ascending
                                                return dateA - dateB;
                                            });
                                            return (
                                                <div className="col-span-full space-y-8 animate-fade-in">
                                                    {/* Folder Header */}
                                                    <div className="bg-slate-900/50 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2.5rem] border border-purple-500/20 p-5 md:p-8 relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 opacity-50"></div>
                                                        <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6">
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 w-full md:w-auto">
                                                                <button
                                                                    onClick={() => { setActiveFolder(null); setView('list'); }}
                                                                    className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 hover:-translate-x-1 transition-all"
                                                                    title="Volver a todos"
                                                                >
                                                                    <ArrowLeft size={24} />
                                                                </button>

                                                                <div>
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <div className="px-2 py-1 rounded-md bg-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest border border-purple-500/20">
                                                                            Carpeta Activa
                                                                        </div>
                                                                    </div>

                                                                    {isRenamingFolder ? (
                                                                        <div className="flex items-center gap-2 w-full max-w-[280px] sm:max-w-none">
                                                                            <input
                                                                                autoFocus
                                                                                type="text"
                                                                                value={tempFolderName}
                                                                                onChange={(e) => setTempFolderName(e.target.value)}
                                                                                className="text-3xl font-black bg-black/40 border-b-2 border-purple-500 text-white outline-none w-full min-w-[300px] px-2 py-1"
                                                                                onKeyDown={(e) => {
                                                                                    if (e.key === 'Enter') handleRenameFolder();
                                                                                    if (e.key === 'Escape') setIsRenamingFolder(false);
                                                                                }}
                                                                            />
                                                                            <button onClick={handleRenameFolder} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30">
                                                                                <Check size={20} />
                                                                            </button>
                                                                            <button onClick={() => setIsRenamingFolder(false)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
                                                                                <X size={20} />
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight break-all md:break-normal">{activeFolder}</h2>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-4 md:gap-6 w-full md:w-auto mt-2 md:mt-0">
                                                                <div className="flex gap-4 md:gap-8 px-4 md:px-6 py-3 bg-black/20 rounded-2xl border border-white/5 flex-1 md:flex-none justify-center">
                                                                    <div className="text-center">
                                                                        <p className="text-2xl font-bold text-white">{surveysToRender.length}</p>
                                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Formularios</p>
                                                                    </div>
                                                                    <div className="w-[1px] bg-white/10"></div>
                                                                    <div className="text-center">
                                                                        <p className="text-2xl font-bold text-white">{surveysToRender.reduce((acc, s) => acc + (s.responses?.length || 0), 0)}</p>
                                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Registros</p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setTempFolderName(activeFolder);
                                                                            setIsRenamingFolder(true);
                                                                        }}
                                                                        className="p-3 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/10 transition-all"
                                                                        title="Renombrar Carpeta"
                                                                    >
                                                                        <Pencil size={20} />
                                                                    </button>
                                                                    <button
                                                                        onClick={handleDeleteFolder}
                                                                        className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 transition-all"
                                                                        title="Eliminar Carpeta (Desagrupar)"
                                                                    >
                                                                        <Trash2 size={20} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Grid of Surveys in Folder */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                                                        {surveysToRender.map(survey => {
                                                            const responsesCount = survey.responses?.length || 0;
                                                            const hasLimit = survey.limit && survey.limit > 0;
                                                            const isFull = hasLimit && responsesCount >= survey.limit;

                                                            return (
                                                                <div
                                                                    key={survey.id}
                                                                    draggable={true}
                                                                    onDragStart={(e) => handleSurveyDragStart(e, survey.id)}
                                                                    onDragEnd={handleSurveyDragEnd}
                                                                    className="group bg-slate-800/80 hover:bg-slate-800/90 backdrop-blur-xl rounded-2xl md:rounded-[2rem] shadow-xl shadow-black/30 border border-white/10 overflow-hidden flex flex-col hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 relative cursor-grab active:cursor-grabbing"
                                                                >
                                                                    {/* Top glowing accent */}
                                                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                                                    {/* Survey Content */}
                                                                    <div className="p-5 md:p-6 flex-1 relative flex flex-col">
                                                                        {/* Header */}
                                                                        <div className="flex justify-between items-start mb-4">
                                                                            <div className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border ${survey.survey_type === 'invitation' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                                                survey.survey_type === 'raffle' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                                                    'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                                                                }`}>
                                                                                {survey.survey_type === 'invitation' ? 'Invitación' :
                                                                                    survey.survey_type === 'raffle' ? 'Taller + Sorteo' : 'Asistencia'}
                                                                            </div>

                                                                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isFull ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                                                                }`}>
                                                                                <div className={`w-2 h-2 rounded-full ${isFull ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                                                                                <span className="text-[11px] font-bold uppercase">{isFull ? 'Lleno' : 'Activo'}</span>
                                                                            </div>
                                                                        </div>

                                                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{survey.title}</h3>
                                                                        <SurveyDescription description={survey.description} />

                                                                        {/* Stats - Improved Contrast */}
                                                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                                                            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/10 group-hover:border-white/20 transition-colors">
                                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                                                    <Users size={12} />
                                                                                    <span>Registros</span>
                                                                                </div>
                                                                                <div className="text-2xl font-black text-white">{responsesCount}</div>
                                                                            </div>
                                                                            <div className="bg-slate-900/50 rounded-xl p-3 border border-white/10 group-hover:border-white/20 transition-colors">
                                                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                                                    <Calendar size={12} />
                                                                                    <span>Fecha</span>
                                                                                </div>
                                                                                <div className="text-sm font-bold text-white truncate h-8 flex items-center">{survey.eventDate || 'N/A'}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Actions Footer - Lighter bg */}
                                                                    <div className="px-5 md:px-6 py-4 bg-white/5 border-t border-white/5 grid grid-cols-4 gap-2">
                                                                        <button
                                                                            onClick={() => copyToClipboard(survey.id)}
                                                                            className="col-span-1 p-2 rounded-xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
                                                                            title="Copiar Link"
                                                                        >
                                                                            <Link size={20} strokeWidth={1.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setViewingResultsId(survey.id)}
                                                                            className="col-span-1 p-2 rounded-xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
                                                                            title="Ver Resultados"
                                                                        >
                                                                            <Table size={20} strokeWidth={1.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleEdit(survey)}
                                                                            className="col-span-1 p-2 rounded-xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/10 hover:shadow-lg hover:shadow-black/20"
                                                                            title="Editar"
                                                                        >
                                                                            <Pencil size={20} strokeWidth={1.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDelete(survey.id)}
                                                                            className="col-span-1 p-2 rounded-xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:shadow-lg hover:shadow-red-900/20"
                                                                            title="Eliminar"
                                                                        >
                                                                            <Trash2 size={20} strokeWidth={1.5} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // 2. Default Grouping Logic (All Surveys + Empty Folders)
                                        const grouped = customSurveys.reduce((acc, survey) => {
                                            const { group } = parseSurveyNote(survey.note);
                                            if (group) {
                                                if (!acc[`group_${group}`]) acc[`group_${group}`] = [];
                                                acc[`group_${group}`].push(survey);
                                            } else {
                                                acc[`single_${survey.id}`] = [survey];
                                            }
                                            return acc;
                                        }, {});

                                        // Ensure localFolders are displayed even if empty
                                        localFolders.forEach(folder => {
                                            if (!grouped[`group_${folder}`]) {
                                                grouped[`group_${folder}`] = [];
                                            }
                                        });

                                        return Object.entries(grouped).sort((a, b) => {
                                            const now = new Date();
                                            now.setHours(0, 0, 0, 0);

                                            // Helper to get the most relevant date in a group (Nearest Future OR Most Recent Past)
                                            const getRelevantDate = (items) => {
                                                if (!items || items.length === 0) return new Date(0);

                                                // Find earliest future date
                                                const futureDates = items
                                                    .map(i => i.eventDate ? new Date(i.eventDate) : new Date(0))
                                                    .filter(d => d >= now)
                                                    .sort((d1, d2) => d1 - d2);

                                                if (futureDates.length > 0) return futureDates[0];

                                                // If no future dates, find dates (will be past)
                                                const pastDates = items
                                                    .map(i => i.eventDate ? new Date(i.eventDate) : new Date(0))
                                                    .sort((d1, d2) => d2 - d1); // Descending

                                                return pastDates[0] || new Date(0);
                                            };

                                            const dateA = getRelevantDate(a[1]);
                                            const dateB = getRelevantDate(b[1]);

                                            const isFutureA = dateA >= now;
                                            const isFutureB = dateB >= now;

                                            if (isFutureA && !isFutureB) return -1;
                                            if (!isFutureA && isFutureB) return 1;

                                            return dateA - dateB;
                                        }).map(([key, groupItems]) => {
                                            // Sort items within the group
                                            groupItems.sort((a, b) => {
                                                const now = new Date();
                                                now.setHours(0, 0, 0, 0);

                                                const dateA = a.eventDate ? new Date(a.eventDate) : new Date(0);
                                                const dateB = b.eventDate ? new Date(b.eventDate) : new Date(0);

                                                const isFutureA = dateA >= now;
                                                const isFutureB = dateB >= now;

                                                if (isFutureA && !isFutureB) return -1;
                                                if (!isFutureA && isFutureB) return 1;

                                                return dateA - dateB;
                                            });
                                            // 1. Group Card
                                            if (key.startsWith('group_')) {
                                                const groupName = key.replace('group_', '');
                                                return (
                                                    <div
                                                        key={key}
                                                        className={`group bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-black/20 border border-purple-500/20 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-purple-900/20 transition-all duration-500 relative ${dragOverGroup === groupName ? 'ring-2 ring-purple-500 scale-[1.02] bg-slate-900/60' : ''}`}
                                                        onDragOver={(e) => handleGroupDragOver(e, groupName)}
                                                        onDragLeave={handleGroupDragLeave}
                                                        onDrop={(e) => handleGroupDrop(e, groupName)}
                                                    >
                                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                        {/* Group Header */}
                                                        <div className="p-8 pb-4 border-b border-white/5 bg-purple-500/5">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
                                                                    <LayoutList size={20} />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg text-white tracking-tight leading-none mb-1">{groupName}</h3>
                                                                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{groupItems.length} Formularios</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Group Items */}
                                                        <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                                                            {groupItems.map(survey => {
                                                                const responsesCount = survey.responses?.length || 0;
                                                                const isFull = survey.limit && survey.limit > 0 && responsesCount >= survey.limit;

                                                                return (
                                                                    <div
                                                                        key={survey.id}
                                                                        draggable={true}
                                                                        onDragStart={(e) => handleSurveyDragStart(e, survey.id)}
                                                                        onDragEnd={handleSurveyDragEnd}
                                                                        className="bg-black/20 hover:bg-white/5 rounded-2xl p-4 border border-white/5 transition-colors group/item relative cursor-grab active:cursor-grabbing"
                                                                    >
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <h4 className="font-bold text-sm text-slate-200 line-clamp-2 pr-8 group-hover/item:text-white transition-colors">{survey.title}</h4>
                                                                            {isFull ? (
                                                                                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)] shrink-0 mt-1"></span>
                                                                            ) : (
                                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)] shrink-0 mt-1"></span>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center justify-between mt-3">
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                                                <Users size={12} />
                                                                                <span>{responsesCount} {survey.limit ? `/ ${survey.limit}` : ''}</span>
                                                                            </div>

                                                                            <div className="flex items-center gap-1 opacity-60 group-hover/item:opacity-100 transition-opacity">
                                                                                <button onClick={() => copyToClipboard(survey.id)} className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Copiar Link"><Link size={14} /></button>
                                                                                <button onClick={() => setViewingResultsId(survey.id)} className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Ver Resultados"><Table size={14} /></button>
                                                                                <button onClick={() => handleEdit(survey)} className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Editar"><Pencil size={14} /></button>
                                                                                <button onClick={() => handleDelete(survey.id)} className="p-1.5 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>


                                                    </div>
                                                );
                                            }

                                            // 2. Single Card (Original Design)
                                            const survey = groupItems[0];
                                            const responsesCount = survey.responses?.length || 0;
                                            const hasLimit = survey.limit && survey.limit > 0;
                                            const percentage = hasLimit ? Math.min((responsesCount / survey.limit) * 100, 100) : 0;
                                            const isFull = hasLimit && responsesCount >= survey.limit;

                                            return (
                                                <div
                                                    key={survey.id}
                                                    draggable={true}
                                                    onDragStart={(e) => handleSurveyDragStart(e, survey.id)}
                                                    onDragEnd={handleSurveyDragEnd}
                                                    className="group bg-slate-800/40 backdrop-blur-xl rounded-2xl md:rounded-[2.5rem] shadow-2xl shadow-black/20 border border-white/5 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-black/40 transition-all duration-500 relative cursor-grab active:cursor-grabbing"
                                                >
                                                    {/* Top glowing accent */}
                                                    <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>

                                                    <div className="p-5 md:p-8 pb-6 flex-1 relative flex flex-col">
                                                        {/* Status Badge */}
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="bg-white/5 border border-white/5 rounded-xl p-1 flex gap-1">
                                                                {survey.survey_type === 'raffle' ? (
                                                                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
                                                                        <Trophy size={16} />
                                                                    </div>
                                                                ) : survey.survey_type === 'invitation' ? (
                                                                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center">
                                                                        <Check size={16} />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 flex items-center justify-center">
                                                                        <FileText size={16} />
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {isFull ? (
                                                                <span className="inline-flex items-center px-3 py-1 bg-red-500/10 text-red-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-red-500/20">
                                                                    Completo
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-emerald-500/20">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                                    Activo
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h3 className="text-xl font-bold text-white mb-2 leading-tight group-hover:text-indigo-400 transition-colors">{survey.title}</h3>
                                                        <SurveyDescription description={survey.description} />

                                                        {/* Progress Section - Improved Contrast */}
                                                        <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/10 group-hover:border-white/20 transition-colors mt-auto">
                                                            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest mb-3">
                                                                <span className="text-slate-400">Registros</span>
                                                                <span className="text-white">
                                                                    {responsesCount} <span className="text-slate-500">{hasLimit ? `/ ${survey.limit}` : ''}</span>
                                                                </span>
                                                            </div>

                                                            {hasLimit ? (
                                                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg relative ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    >
                                                                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-[10px] text-indigo-300 font-bold bg-indigo-500/20 py-2 px-3 rounded-lg border border-indigo-500/30 w-fit">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                                                                    Cupos Ilimitados
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6">
                                                            <Calendar size={12} className="text-slate-600" />
                                                            <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="p-2 grid grid-cols-4 gap-1 bg-black/20 border-t border-white/5">
                                                        <button
                                                            onClick={() => copyToClipboard(survey.id)}
                                                            className={`col-span-1 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 group/btn hover:bg-white/5 ${copiedId === survey.id ? 'text-emerald-400' : 'text-slate-400 hover:text-white'}`}
                                                            title="Copiar Link"
                                                        >
                                                            {copiedId === survey.id ? <Check size={18} /> : <Link size={18} />}
                                                        </button>
                                                        <button
                                                            onClick={() => setViewingResultsId(survey.id)}
                                                            className="col-span-1 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5"
                                                            title="Ver Resultados"
                                                        >
                                                            <Table size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(survey)}
                                                            className="col-span-1 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-white hover:bg-white/5"
                                                            title="Editar"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(survey.id)}
                                                            className="col-span-1 py-4 rounded-2xl flex items-center justify-center transition-all duration-300 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Edit Response Modal */}
                {editingResponse && (() => {
                    const survey = customSurveys.find(s => s.id === viewingResultsId);
                    if (!survey) return null;

                    return (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" onClick={() => setEditingResponse(null)}></div>
                            <div className="bg-slate-800 rounded-[2.5rem] w-full max-w-lg relative z-10 shadow-2xl animate-scale-in flex flex-col max-h-[90vh] border border-white/10 overflow-hidden">
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20 backdrop-blur-md">
                                    <div>
                                        <h3 className="font-black text-xl text-white">Editar Respuesta</h3>
                                        <p className="text-xs text-slate-400 font-medium mt-1">Modifica los datos del registro</p>
                                    </div>
                                    <button onClick={() => setEditingResponse(null)} className="w-10 h-10 rounded-full bg-white/5 text-slate-400 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto custom-scrollbar">
                                    <form onSubmit={handleSaveResponseEdit} className="space-y-6">
                                        {survey.questions.map(q => (
                                            <div key={q.id} className="group/field">
                                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-indigo-400 transition-colors">
                                                    {q.label}
                                                </label>
                                                {q.type === 'paragraph' ? (
                                                    <textarea
                                                        value={editingResponse.answers[q.label] || ''}
                                                        onChange={e => setEditingResponse(prev => ({
                                                            ...prev,
                                                            answers: { ...prev.answers, [q.label]: e.target.value }
                                                        }))}
                                                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-black/20 text-white focus:border-indigo-500 focus:bg-white/5 outline-none transition-all font-medium resize-none shadow-inner"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={Array.isArray(editingResponse.answers[q.label]) ? editingResponse.answers[q.label].join(', ') : (editingResponse.answers[q.label] || '')}
                                                        onChange={e => setEditingResponse(prev => ({
                                                            ...prev,
                                                            answers: { ...prev.answers, [q.label]: e.target.value }
                                                        }))}
                                                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-black/20 text-white focus:border-indigo-500 focus:bg-white/5 outline-none transition-all font-medium shadow-inner"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div className="pt-6 flex gap-4 border-t border-white/5 mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setEditingResponse(null)}
                                                className="flex-1 py-4 rounded-2xl border border-white/10 text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-colors text-sm"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-4 rounded-2xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all text-sm"
                                            >
                                                Guardar Cambios
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    );
                })()}

            </main>
        </div >
    );
}

export default SurveyEventDashboard;

