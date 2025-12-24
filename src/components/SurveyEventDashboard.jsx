import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, LayoutGrid, Plus, Trash2, Calendar, FileText, Settings, Home, Link, Copy, Check, Users, MoreVertical, GripVertical, Pencil, FileDown, Table } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
    const { user, logout } = useAuth();
    const { customSurveys, addCustomSurvey, deleteCustomSurvey, updateCustomSurvey } = useData();
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
                showToast('Encuesta actualizada exitosamente', 'success');
            } else {
                await addCustomSurvey({
                    ...formData,
                    active: true
                });
                showToast('Encuesta creada exitosamente', 'success');
            }

            resetForm();
            setView('list');
            setEditingId(null); // Clear editing state
        } catch (error) {
            console.error(error);
            showToast('Error al guardar la encuesta', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            limit: 30,
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
        if (window.confirm('¿Eliminar esta encuesta? Se perderán todas las respuestas.')) {
            await deleteCustomSurvey(id);
            showToast('Encuesta eliminada', 'success');
        }
    };

    const handleEdit = (survey) => {
        setEditingId(survey.id);
        setFormData({
            title: survey.title,
            description: survey.description || '',
            limit: survey.limit,
            questions: survey.questions
        });
        setView('create');
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
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">

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
                fixed lg:fixed left-0 top-0 z-50 h-screen w-72 backdrop-blur-3xl bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-200 shadow-2xl transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                pt-16 lg:pt-0 flex flex-col
            `}>
                {/* Brand */}
                <div className="hidden lg:block p-6 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/20">
                            <span className="font-bold text-xl text-white">F</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight text-slate-900 dark:text-white">Emprende<span className="text-primary-600">Forms</span></h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Gestión de Eventos</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <button
                        onClick={() => { resetForm(); setViewingResultsId(null); setView('list'); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${view === 'list'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 border border-transparent'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400'}`}
                    >
                        <LayoutGrid size={22} className={`transition-transform group-hover:scale-105 ${view === 'list' ? 'text-white' : 'text-slate-500 group-hover:text-primary-600'}`} />
                        <span className="font-medium tracking-wide">Mis Formularios</span>
                    </button>
                    <button
                        onClick={() => { resetForm(); setViewingResultsId(null); setView('create'); }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${view === 'create'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20 border border-transparent'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-primary-600 dark:hover:text-primary-400'}`}
                    >
                        <Plus size={22} className={`transition-transform group-hover:scale-105 ${view === 'create' ? 'text-white' : 'text-slate-500 group-hover:text-primary-600'}`} />
                        <span className="font-medium tracking-wide">Crear Nueva</span>
                    </button>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 mb-3 backdrop-blur-sm shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 text-slate-600">
                            <Users size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-gray-200 truncate">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@emprende.com'}</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={() => navigate('/portal')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all text-sm font-medium">
                            Portal
                        </button>
                        <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-red-500 dark:text-red-400 bg-white dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/10 border border-red-100 dark:border-red-500/20 transition-all text-sm font-medium">
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 min-h-screen pt-16 lg:pt-0 bg-slate-50 dark:bg-slate-900 transition-all duration-300 w-full max-w-full overflow-x-hidden">
                <header className="hidden lg:flex h-16 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 items-center justify-between px-8 sticky top-0 z-40">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {view === 'list' && !viewingResultsId && 'Mis Formularios Activos'}
                        {view === 'list' && viewingResultsId && 'Resultados de la Encuesta'}
                        {view === 'create' && (editingId ? 'Editar Encuesta' : 'Nueva Encuesta / Evento')}
                    </h2>
                </header>

                <div className="p-4 lg:p-8 max-w-5xl mx-auto w-full">
                    {view === 'create' && (
                        <form onSubmit={handleCreateSurvey} className="space-y-8 animate-fade-in">
                            {/* General Info Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-white/5 p-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>
                                <div className="space-y-6">
                                    <div>
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
                                            className="w-full text-3xl font-bold border-b-2 border-transparent hover:border-slate-200 focus:border-primary-500 bg-transparent outline-none transition-colors placeholder-slate-300 text-slate-900 dark:text-white pb-2 resize-none overflow-hidden"
                                            placeholder="Título del Formulario"
                                            style={{ minHeight: '3rem' }}
                                        />
                                    </div>
                                    <div>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full text-base border-b border-transparent hover:border-slate-200 focus:border-primary-500 bg-transparent outline-none transition-colors placeholder-slate-400 text-slate-600 dark:text-slate-300 resize-none h-24"
                                            placeholder="Descripción del formulario..."
                                        />
                                    </div>

                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Límite de Cupos</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={formData.limit}
                                                onChange={e => setFormData({ ...formData, limit: parseInt(e.target.value) })}
                                                className="w-32 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none text-xl font-bold text-slate-900 dark:text-white transition-all text-center placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questions List */}
                            <div className="space-y-6">
                                {formData.questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 p-6 relative transition-all hover:shadow-md"
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, idx)}
                                        onDragEnter={(e) => handleDragEnter(e, idx)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                    >
                                        {/* Drag Handle */}
                                        <div className="drag-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-move bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600 transition-opacity flex items-center gap-2 shadow-sm">
                                            <GripVertical size={14} className="text-slate-400" />
                                            <span className="text-xs font-medium text-slate-500">Arrastrar</span>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 mb-6">
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-2 border border-slate-100 focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-50 transition-all">
                                                <input
                                                    type="text"
                                                    value={q.label}
                                                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                                    className="w-full bg-transparent border-none focus:ring-0 outline-none font-medium text-slate-900 dark:text-white placeholder-slate-400 text-lg"
                                                    placeholder="Escribe tu pregunta"
                                                />
                                            </div>
                                            <div className="w-full md:w-64">
                                                <div className="relative">
                                                    <select
                                                        value={q.type}
                                                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                                                        className="w-full px-4 py-3 appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none text-slate-700 dark:text-slate-200 pr-10 font-medium shadow-sm"
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
                                            <div className="ml-1 pl-4 space-y-3 mb-6 border-l-2 border-slate-100">
                                                {q.options?.map((opt, optIdx) => (
                                                    <div key={optIdx} className="flex items-center gap-3 group/opt">
                                                        <div className={`w-4 h-4 border-2 ${q.type === 'multiple_choice' ? 'rounded-full' : 'rounded-md'} border-slate-300 dark:border-slate-600`}></div>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                                                            className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-primary-500 outline-none py-1 text-sm text-slate-700 dark:text-slate-300 transition-colors"
                                                        />
                                                        <button type="button" onClick={() => removeOption(q.id, optIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => addOption(q.id)}
                                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 pl-1 py-1"
                                                >
                                                    <Plus size={14} /> Agregar opción
                                                </button>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                                            <div className="flex items-center gap-3 border-r border-slate-200 dark:border-white/10 pr-6">
                                                <label className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer select-none" onClick={() => updateQuestion(q.id, 'required', !q.required)}>Obligatorio</label>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuestion(q.id, 'required', !q.required)}
                                                    className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${q.required ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                                >
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${q.required ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(q.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Eliminar pregunta"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center pb-8 pt-4">
                                <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-slate-600 dark:text-slate-300 font-bold group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-primary-100 text-slate-500 group-hover:text-primary-600 flex items-center justify-center transition-colors">
                                        <Plus size={14} strokeWidth={3} />
                                    </div>
                                    Agregar Pregunta
                                </button>
                            </div>

                            <div className="sticky bottom-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl shadow-slate-200/50 flex flex-col sm:flex-row justify-between items-center z-30 gap-4 sm:gap-0">
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium px-2 w-full sm:w-auto justify-center sm:justify-start">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {formData.questions.length} preguntas configuradas
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <button type="button" onClick={() => { resetForm(); setView('list'); }} className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`flex-1 sm:flex-none px-8 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-600/30 hover:shadow-primary-600/40 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed transform-none' : ''}`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar Encuesta'
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
                                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 text-xs uppercase tracking-wider text-slate-500">
                                                    <th className="p-4 font-bold whitespace-nowrap">Fecha</th>
                                                    {survey.questions.map(q => (
                                                        <th key={q.id} className="p-4 font-bold whitespace-nowrap min-w-[150px]">{q.label}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                                {responses.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={survey.questions.length + 1} className="p-8 text-center text-slate-500">
                                                            Aún no hay respuestas para mostrar.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    responses.map((r, idx) => {
                                                        const dateVal = r.created_at || r.createdAt || r.submittedAt;
                                                        return (
                                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-sm">
                                                                <td className="p-4 whitespace-nowrap text-slate-500 font-medium">
                                                                    {dateVal ? (
                                                                        <>
                                                                            {new Date(dateVal).toLocaleDateString()} {new Date(dateVal).toLocaleTimeString()}
                                                                        </>
                                                                    ) : 'Fecha inválida'}
                                                                </td>
                                                                {survey.questions.map(q => (
                                                                    <td key={q.id} className="p-4 max-w-xs truncate font-medium text-slate-900 dark:text-white" title={Array.isArray(r.answers[q.label]) ? r.answers[q.label].join(', ') : r.answers[q.label]}>
                                                                        {Array.isArray(r.answers[q.label])
                                                                            ? r.answers[q.label].join(', ')
                                                                            : r.answers[q.label]}
                                                                    </td>
                                                                ))}
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
                        <div className="grid gap-6 animate-fade-in">
                            {customSurveys.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No hay formularios activos</h3>
                                    <p className="text-slate-500 mb-6">Crea tu primera encuesta o evento para empezar a recibir registros.</p>
                                    <button onClick={() => setView('create')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Crear Encuesta
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {customSurveys.map(survey => {
                                        const responsesCount = survey.responses?.length || 0;
                                        const percentage = Math.min((responsesCount / survey.limit) * 100, 100);
                                        const isFull = responsesCount >= survey.limit;

                                        return (
                                            <div key={survey.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 overflow-hidden flex flex-col">
                                                <div className="p-6 flex-1">
                                                    <div className="flex justify-between items-start gap-4 mb-4">
                                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 break-all">{survey.title}</h3>
                                                        {isFull ? (
                                                            <span className="flex-shrink-0 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg whitespace-nowrap">Completo</span>
                                                        ) : (
                                                            <span className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-lg whitespace-nowrap">Activo</span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <div className="flex justify-between text-sm mb-1">
                                                                <span className="text-slate-500">Registrados</span>
                                                                <span className="font-medium text-slate-900 dark:text-white">{responsesCount} / {survey.limit}</span>
                                                            </div>
                                                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                                            <Calendar size={14} />
                                                            <span>{new Date(survey.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 flex gap-2">
                                                    <button
                                                        onClick={() => copyToClipboard(survey.id)}
                                                        className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg text-sm font-medium transition-all duration-300
                                                            ${copiedId === survey.id
                                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                                : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        {copiedId === survey.id ? (
                                                            <>
                                                                <Check size={16} /> ¡Copiado!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Link size={16} /> Copiar Link
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => setViewingResultsId(survey.id)}
                                                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
                                                        title="Ver Resultados"
                                                    >
                                                        <Table size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(survey)}
                                                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(survey.id)}
                                                        className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
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
            </main>
        </div>
    );
}

export default SurveyEventDashboard;
