import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, LayoutGrid, Plus, Trash2, Calendar, FileText, Settings, Home, Link, Copy, Check, Users, MoreVertical, GripVertical, Pencil, FileDown, Table, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

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
        limit: 30,
        survey_type: 'standard', // 'standard', 'raffle', 'invitation'
        questions: [
            { id: 1, type: 'text', label: 'Nombre Completo', required: true, options: [] },
            { id: 2, type: 'email', label: 'Correo Electrónico', required: true, options: [] }
        ]
    });

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

            if (editingId) {
                await updateCustomSurvey(editingId, {
                    ...formData,
                    active: true // Ensure it stays active or pass existing status if preferred, but usually editing implies active intent or no change to status unless explicit
                });
                showToast('Formulario actualizado exitosamente', 'success');
            } else {
                await addCustomSurvey({
                    ...formData,
                    active: true
                });
                showToast('Formulario creado exitosamente', 'success');
            }

            resetForm();
            setView('list');
            setEditingId(null); // Clear editing state
        } catch (error) {
            console.error(error);
            showToast('Error al guardar el formulario', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            limit: 30,
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
                    return { ...q, options: [...(q.options || []), `Opción ${(q.options?.length || 0) + 1}`] };
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
        setFormData({
            title: survey.title,
            description: survey.description || '',
            limit: survey.limit,
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
        <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-900 selection:bg-primary-100 selection:text-primary-900">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-secondary z-50 flex items-center px-4 justify-between shadow-md">
                <div className="font-bold text-xl text-white tracking-tight">
                    <span className="text-primary-400">Emprende</span>
                    <span className="text-white">Forms</span>
                </div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-300 hover:text-white transition-colors">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:fixed left-4 top-4 bottom-4 z-50 w-72 backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-white/5 text-slate-600 dark:text-slate-200 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) rounded-3xl flex flex-col overflow-hidden
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
            `}>
                {/* Brand */}
                <div className="p-8 border-b border-slate-100 dark:border-white/5 relative overflow-hidden group cursor-default">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"></div>
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-100/50 dark:bg-primary-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 border border-white/20 transform group-hover:rotate-6 transition-transform duration-500">
                            <span className="font-black text-2xl text-white tracking-tighter">E</span>
                        </div>
                        <div>
                            <h1 className="font-extrabold text-xl leading-none text-slate-900 dark:text-white tracking-tight">Emprende<span className="text-primary-600">Forms</span></h1>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Gestión Pro</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="px-4 py-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Principal</p>
                        <div className="space-y-2">
                            <button
                                onClick={() => { resetForm(); setViewingResultsId(null); setView('list'); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${view === 'list'
                                    ? 'bg-primary-50 text-primary-700 shadow-md shadow-primary-100/50 border border-primary-100'
                                    : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800 border border-transparent'}`}
                            >
                                {view === 'list' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                                <LayoutGrid size={20} strokeWidth={view === 'list' ? 2.5 : 2} className={`transition-transform group-hover:scale-110 ${view === 'list' ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
                                <span className={`font-bold tracking-wide text-sm ${view === 'list' ? 'translate-x-1' : ''} transition-transform`}>Mis Formularios</span>
                                {customSurveys.length > 0 && <span className="ml-auto text-xs font-bold bg-white text-slate-500 px-2 py-0.5 rounded-full shadow-sm">{customSurveys.length}</span>}
                            </button>
                            <button
                                onClick={() => { resetForm(); setViewingResultsId(null); setView('create'); }}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${view === 'create'
                                    ? 'bg-primary-50 text-primary-700 shadow-md shadow-primary-100/50 border border-primary-100'
                                    : 'text-slate-500 hover:bg-white hover:shadow-sm hover:text-slate-800 border border-transparent'}`}
                            >
                                {view === 'create' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>}
                                <Plus size={20} strokeWidth={view === 'create' ? 2.5 : 2} className={`transition-transform group-hover:rotate-90 ${view === 'create' ? 'text-primary-600' : 'text-slate-400 group-hover:text-primary-500'}`} />
                                <span className={`font-bold tracking-wide text-sm ${view === 'create' ? 'translate-x-1' : ''} transition-transform`}>Crear Nueva</span>
                            </button>
                        </div>
                    </div>
                </nav>

                {/* User Profile */}
                <div className="p-4 bg-slate-50/50 dark:bg-black/20 backdrop-blur-md">
                    <div className="bg-white/60 dark:bg-white/5 rounded-2xl p-4 border border-white/50 dark:border-white/5 shadow-sm mb-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 flex items-center justify-center border-2 border-white shadow-sm">
                                <Users size={18} className="text-slate-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user?.name || 'Admin User'}</p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">Administrador</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/portal')}
                                className="flex-1 py-2 rounded-xl bg-white text-xs font-bold text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
                            >
                                Portal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 bg-slate-50 dark:bg-slate-900 transition-all duration-300 w-full max-w-full overflow-x-hidden">
                <header className="hidden lg:flex h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {view === 'list' && !viewingResultsId && 'Mis Formularios Activos'}
                        {view === 'list' && viewingResultsId && 'Resultados del Formulario'}
                        {view === 'create' && (editingId ? 'Editar Formulario' : 'Nuevo Formulario')}
                    </h2>
                </header>

                <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
                    {view === 'create' && (
                        <form onSubmit={handleCreateSurvey} className="space-y-8 animate-fade-in pb-20">
                            {/* General Info Card */}
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-white/50 dark:border-white/5 p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 opacity-60 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="space-y-8">
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Título del Evento</label>
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
                                            className="w-full text-4xl font-black bg-transparent border-none outline-none placeholder-slate-300 text-slate-800 dark:text-white resize-none overflow-hidden p-0 focus:ring-0 leading-tight"
                                            placeholder="Escribe un título..."
                                            style={{ minHeight: '3.5rem' }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Descripción</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full text-lg bg-transparent border-none outline-none placeholder-slate-300 text-slate-600 dark:text-slate-300 resize-none h-24 p-0 focus:ring-0 leading-relaxed"
                                            placeholder="Describe el propósito de este formulario..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex flex-col group/field">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-primary-500 transition-colors">Fecha</label>
                                            <input
                                                type="date"
                                                value={formData.eventDate}
                                                onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-primary-500 transition-colors">Hora</label>
                                            <input
                                                type="time"
                                                value={formData.eventTime}
                                                onChange={e => setFormData({ ...formData, eventTime: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-primary-500 transition-colors">Lugar</label>
                                            <input
                                                type="text"
                                                placeholder="Ej. Auditorio"
                                                value={formData.eventLocation}
                                                onChange={e => setFormData({ ...formData, eventLocation: e.target.value })}
                                                className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-medium"
                                            />
                                        </div>
                                        <div className="flex flex-col group/field">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/field:text-primary-500 transition-colors">Cupos</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    required
                                                    value={formData.limit}
                                                    onChange={e => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-center"
                                                />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <Users size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 mt-2 border-t border-slate-100 dark:border-white/5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block ml-1">Tipo de Experiencia</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'standard', label: 'Estándar', desc: 'Registro simple', icon: FileText, color: 'bg-slate-500' },
                                                { id: 'invitation', label: 'Invitación Taller', desc: 'Registro + Recursos', icon: Check, color: 'bg-purple-500' },
                                                { id: 'raffle', label: 'Asistencia + Ruleta', desc: 'Para Emprendex', icon: Trophy, color: 'bg-yellow-500' }
                                            ].map(type => {
                                                const Icon = type.icon;
                                                const isSelected = formData.survey_type === type.id;
                                                return (
                                                    <div
                                                        key={type.id}
                                                        onClick={() => setFormData({ ...formData, survey_type: type.id })}
                                                        className={`cursor-pointer relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 group/type ${isSelected
                                                            ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/10'
                                                            : 'border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-white text-primary-600 shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                                                <Icon size={20} />
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-500' : 'border-slate-200 dark:border-slate-600'}`}>
                                                                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-sm"></div>}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold text-base mb-1 ${isSelected ? 'text-primary-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>{type.label}</h4>
                                                            <p className={`text-xs ${isSelected ? 'text-primary-700/80 dark:text-primary-300/80' : 'text-slate-400'}`}>{type.desc}</p>
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
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-sm">{formData.questions.length}</span>
                                        Preguntas
                                    </h3>
                                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700 ml-6"></div>
                                </div>

                                {formData.questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="group bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-white/5 p-1 pl-1 relative transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary-200 dark:hover:border-primary-900/50"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragEnter={(e) => handleDragEnter(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        <div className="p-6 md:p-8">
                                            {/* Drag Handle */}
                                            <div className="drag-handle absolute top-4 right-4 opacity-0 group-hover:opacity-100 cursor-move p-2 text-slate-300 hover:text-slate-500 transition-colors">
                                                <GripVertical size={20} />
                                            </div>

                                            <div className="flex flex-col md:flex-row gap-6 mb-8 pr-8">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Pregunta</label>
                                                    <input
                                                        type="text"
                                                        value={q.label}
                                                        onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                                        className="w-full text-xl font-bold bg-transparent border-b-2 border-slate-100 hover:border-slate-300 focus:border-primary-500 outline-none py-2 text-slate-800 dark:text-white placeholder-slate-300 transition-colors"
                                                        placeholder="¿Qué quieres preguntar?"
                                                    />
                                                </div>
                                                <div className="w-full md:w-64">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Tipo de Respuesta</label>
                                                    <div className="relative">
                                                        <select
                                                            value={q.type}
                                                            onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                            className="w-full pl-4 pr-10 py-3 appearance-none bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none text-slate-700 dark:text-slate-200 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                        >
                                                            {QUESTION_TYPES.map(type => (
                                                                <option key={type.value} value={type.value}>{type.label}</option>
                                                            ))}
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                            <MoreVertical size={18} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dynamic Options */}
                                            {(q.type === 'multiple_choice' || q.type === 'checkbox') && (
                                                <div className="bg-slate-50/50 dark:bg-black/20 rounded-2xl p-6 mb-8 border border-slate-100 dark:border-white/5">
                                                    <div className="space-y-3">
                                                        {q.options?.map((opt, optIdx) => (
                                                            <div key={optIdx} className="flex items-center gap-4 group/opt">
                                                                <div className={`w-5 h-5 flex-shrink-0 border-2 ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded-md'} border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800`}></div>
                                                                <input
                                                                    type="text"
                                                                    value={opt}
                                                                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                                    className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary-500 outline-none py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors"
                                                                    placeholder={`Opción ${optIdx + 1}`}
                                                                />
                                                                <button type="button" onClick={() => removeOption(q.id, optIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-all p-1 hover:bg-red-50 rounded-lg">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            onClick={() => addOption(q.id)}
                                                            className="text-sm text-primary-600 hover:text-primary-700 font-bold flex items-center gap-2 pl-1 py-2 mt-2 hover:translate-x-1 transition-transform"
                                                        >
                                                            <Plus size={16} className="bg-primary-100 rounded-md p-0.5" /> Agregar otra opción
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <label className="flex items-center gap-3 cursor-pointer group/toggle">
                                                        <div className={`w-12 h-7 rounded-full p-1 transition-all duration-300 ${q.required ? 'bg-primary-500 shadow-inner' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                                            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${q.required ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                                        </div>
                                                        <span className="text-sm font-bold text-slate-500 group-hover/toggle:text-slate-700 dark:group-hover/toggle:text-slate-300 transition-colors">Obligatorio</span>
                                                        <input type="checkbox" className="hidden" checked={q.required} onChange={() => updateQuestion(q.id, 'required', !q.required)} />
                                                    </label>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeQuestion(q.id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-medium text-sm group/del"
                                                    title="Eliminar pregunta"
                                                >
                                                    <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
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
                                    className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl shadow-sm hover:shadow-lg hover:border-primary-400 hover:-translate-y-1 transition-all text-slate-500 dark:text-slate-300 font-bold group w-full md:w-auto justify-center"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-primary-100 text-slate-500 group-hover:text-primary-600 flex items-center justify-center transition-colors">
                                        <Plus size={18} strokeWidth={3} />
                                    </div>
                                    Agregar Nueva Pregunta
                                </button>
                            </div>

                            {/* Floating Footer */}
                            <div className="fixed bottom-6 w-[calc(100%-2rem)] lg:w-[calc(100%-20rem)] left-1/2 lg:left-[calc(50%+9rem)] -translate-x-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-white/50 dark:border-white/10 shadow-2xl shadow-slate-900/20 flex flex-col sm:flex-row justify-between items-center z-30 gap-4 sm:gap-0 transition-all duration-300">
                                <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-300 px-4">
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                                    <span>{formData.questions.length} preguntas configuradas</span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button type="button" onClick={() => { resetForm(); setView('list'); }} className="flex-1 sm:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                            <div className="space-y-6 animate-fade-in">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 lg:p-6 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="min-w-0 flex-1">
                                        <button onClick={() => setViewingResultsId(null)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white text-sm font-bold mb-2 flex items-center gap-1 transition-colors">
                                            ← Volver a Formularios
                                        </button>
                                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white break-words md:break-all leading-tight">{survey.title}</h1>
                                        <p className="text-slate-500 mt-1">{responses.length} respuestas recibidas</p>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleDownloadCSV(survey)}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-green-600/20 text-sm"
                                        >
                                            <FileDown size={18} className="flex-shrink-0" />
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
                                            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 md:py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-colors shadow-sm text-sm"
                                        >
                                            <Table size={18} className="flex-shrink-0" />
                                            <span>Abrir en Sheets</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <th className="p-5 whitespace-nowrap">Fecha</th>
                                                    {survey.questions.map(q => (
                                                        <th key={q.id} className="p-5 whitespace-nowrap min-w-[180px]">{q.label}</th>
                                                    ))}
                                                    <th className="p-5 whitespace-nowrap text-right sticky right-0 z-20 bg-gradient-to-l from-white via-white to-transparent dark:from-slate-800 dark:via-slate-800 pl-8">
                                                        <span className="bg-white dark:bg-slate-800 relative z-10 px-2">Acciones</span>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                                {responses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={survey.questions.length + 2} className="p-12 text-center text-slate-400 font-medium">
                                                            Aún no hay respuestas para mostrar.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    responses.map((r, idx) => {
                                                        const dateVal = r.created_at || r.createdAt || r.submittedAt;
                                                        return (
                                                            <tr key={idx} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors duration-300">
                                                                <td className="p-5 whitespace-nowrap text-slate-500 font-bold text-xs">
                                                                    {dateVal ? (
                                                                        <div className="flex flex-col">
                                                                            <span className="text-slate-700 dark:text-slate-300">{new Date(dateVal).toLocaleDateString()}</span>
                                                                            <span className="text-slate-400 text-[10px]">{new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>
                                                                    ) : 'Fecha inválida'}
                                                                </td>
                                                                {survey.questions.map(q => (
                                                                    <td key={q.id} className="p-5 max-w-[250px] truncate text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" title={Array.isArray(r.answers[q.label]) ? r.answers[q.label].join(', ') : r.answers[q.label]}>
                                                                        {Array.isArray(r.answers[q.label])
                                                                            ? r.answers[q.label].join(', ')
                                                                            : r.answers[q.label]}
                                                                    </td>
                                                                ))}
                                                                <td className="p-4 text-right whitespace-nowrap sticky right-0 z-10">
                                                                    {/* Gradient Mask for smooth fade */}
                                                                    <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent to-white dark:to-slate-800 pointer-events-none -ml-8"></div>
                                                                    <div className="bg-white dark:bg-slate-800 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 transition-colors duration-300 h-full w-full absolute inset-0 -z-10"></div>

                                                                    <div className="relative z-10 flex items-center justify-end gap-1">
                                                                        <button
                                                                            onClick={() => handleEditResponse(r)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-100/50 dark:bg-slate-700/50 dark:hover:bg-blue-900/30 transition-all hover:scale-110 active:scale-95"
                                                                            title="Editar"
                                                                        >
                                                                            <Pencil size={14} strokeWidth={2.5} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteResponse(r.id)}
                                                                            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-100/50 dark:bg-slate-700/50 dark:hover:bg-red-900/30 transition-all hover:scale-110 active:scale-95"
                                                                            title="Eliminar"
                                                                        >
                                                                            <Trash2 size={14} strokeWidth={2.5} />
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
                                <div className="text-center py-32 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[2.5rem] border border-dashed border-slate-300 dark:border-white/10 group">
                                    <div className="w-24 h-24 bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-blue-500/10">
                                        <FileText size={40} className="group-hover:rotate-6 transition-transform" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Crea tu primer evento</h3>
                                    <p className="text-lg text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">Configura formularios personalizados para talleres, ruletas y registros de asistencia en segundos.</p>
                                    <button onClick={() => setView('create')} className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1">
                                        + Nuevo Formulario
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {customSurveys.map(survey => {
                                        const responsesCount = survey.responses?.length || 0;
                                        const percentage = Math.min((responsesCount / survey.limit) * 100, 100);
                                        const isFull = responsesCount >= survey.limit;

                                        return (
                                            <div key={survey.id} className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-[2rem] shadow-xl shadow-slate-200/40 dark:shadow-black/40 border border-white/50 dark:border-white/5 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-300/50 dark:hover:shadow-black/60 transition-all duration-500 relative">
                                                {/* Top gradient accent */}
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                                <div className="p-8 flex-1 relative">
                                                    <div className="absolute top-6 right-6 flex gap-2">
                                                        {isFull ? (
                                                            <span className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-red-100 shadow-sm">
                                                                Completo
                                                            </span>
                                                        ) : (
                                                            <span className="relative inline-flex items-center px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-green-100 shadow-sm overflow-hidden">
                                                                <span className="relative z-10 flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                                    Activo
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mb-6 mt-2">
                                                        <div className="mb-4">
                                                            {survey.survey_type === 'raffle' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-yellow-100/80 text-yellow-700 uppercase tracking-wide border border-yellow-200/50 backdrop-blur-sm">
                                                                    <Trophy size={12} className="text-yellow-600" /> Ruleta
                                                                </span>
                                                            ) : survey.survey_type === 'invitation' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-purple-100/80 text-purple-700 uppercase tracking-wide border border-purple-200/50 backdrop-blur-sm">
                                                                    <Check size={12} className="text-purple-600" /> Invitación
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100/80 text-slate-600 uppercase tracking-wide border border-slate-200/50 backdrop-blur-sm">
                                                                    <FileText size={12} className="text-slate-500" /> Estándar
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h3 className="font-black text-2xl text-slate-800 dark:text-white line-clamp-2 leading-tight tracking-tight group-hover:text-primary-600 transition-colors">{survey.title}</h3>
                                                    </div>

                                                    <div className="space-y-5">
                                                        <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 border border-slate-100 dark:border-white/5">
                                                            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3">
                                                                <span className="text-slate-400">Progreso</span>
                                                                <span className="text-slate-700 dark:text-white">{responsesCount} / {survey.limit}</span>
                                                            </div>
                                                            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isFull ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-primary-500 to-cyan-400'}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">
                                                            <Calendar size={14} className="text-slate-300" />
                                                            <span>Creado: {new Date(survey.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`p-4 bg-slate-50/80 dark:bg-black/40 border-t border-slate-100 dark:border-white/5 grid ${survey.survey_type === 'raffle' ? 'grid-cols-5' : 'grid-cols-4'} gap-2 backdrop-blur-sm`}>
                                                    <button
                                                        onClick={() => copyToClipboard(survey.id)}
                                                        className={`col-span-1 py-3 rounded-xl flex items-center justify-center transition-all duration-300 relative group/btn
                                                            ${copiedId === survey.id
                                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                                                                : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-primary-600 hover:bg-white hover:shadow-lg hover:-translate-y-1'
                                                            }`}
                                                        title="Copiar Link"
                                                    >
                                                        {copiedId === survey.id ? <Check size={20} className="animate-bounce" /> : <Link size={20} />}
                                                    </button>

                                                    <button
                                                        onClick={() => setViewingResultsId(survey.id)}
                                                        className="col-span-1 py-3 rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-lg hover:-translate-y-1 flex items-center justify-center transition-all duration-300"
                                                        title="Ver Resultados"
                                                    >
                                                        <Table size={20} />
                                                    </button>

                                                    {survey.survey_type === 'raffle' && (
                                                        <button
                                                            onClick={() => navigate(`/raffle/${survey.id}`)}
                                                            className="col-span-1 py-3 rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-yellow-500 hover:bg-white hover:shadow-lg hover:-translate-y-1 flex items-center justify-center transition-all duration-300"
                                                            title="Ir a la Ruleta"
                                                        >
                                                            <Trophy size={20} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => handleEdit(survey)}
                                                        className="col-span-1 py-3 rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-orange-500 hover:bg-white hover:shadow-lg hover:-translate-y-1 flex items-center justify-center transition-all duration-300"
                                                        title="Editar Formulario"
                                                    >
                                                        <Pencil size={20} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(survey.id)}
                                                        className="col-span-1 py-3 rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-red-500 hover:bg-white hover:shadow-lg hover:-translate-y-1 flex items-center justify-center transition-all duration-300 group/delete"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 size={20} className="group-hover/delete:animate-shake" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingResponse(null)}></div>
                            <div className="bg-white dark:bg-slate-800 rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl animate-scale-in flex flex-col max-h-[90vh] border border-white/20 overflow-hidden">
                                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-black/20 backdrop-blur-md">
                                    <div>
                                        <h3 className="font-black text-xl text-slate-800 dark:text-white">Editar Respuesta</h3>
                                        <p className="text-xs text-slate-500 font-medium mt-1">Modifica los datos del registro</p>
                                    </div>
                                    <button onClick={() => setEditingResponse(null)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="p-8 overflow-y-auto custom-scrollbar">
                                    <form onSubmit={handleSaveResponseEdit} className="space-y-6">
                                        {survey.questions.map(q => (
                                            <div key={q.id}>
                                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">
                                                    {q.label}
                                                </label>
                                                {q.type === 'paragraph' ? (
                                                    <textarea
                                                        value={editingResponse.answers[q.label] || ''}
                                                        onChange={e => setEditingResponse(prev => ({
                                                            ...prev,
                                                            answers: { ...prev.answers, [q.label]: e.target.value }
                                                        }))}
                                                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium resize-none"
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
                                                        className="w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-medium"
                                                    />
                                                )}
                                            </div>
                                        ))}
                                        <div className="pt-6 flex gap-4 border-t border-slate-100 dark:border-white/5 mt-8">
                                            <button
                                                type="button"
                                                onClick={() => setEditingResponse(null)}
                                                className="flex-1 py-3 rounded-xl border-2 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all"
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
        </div>
    );
}

export default SurveyEventDashboard;

