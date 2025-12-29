import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';

function PublicSurveyView() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                // Fetch survey and its responses count (we don't need all response content, but for now fetching all is easier/ok for small scale)
                const { data, error } = await supabase
                    .from('custom_surveys')
                    .select('*, survey_responses(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                if (data) {
                    const formattedSurvey = {
                        ...data,
                        limit: data.response_limit, // Map DB column to frontend prop
                        limit: data.response_limit, // Map DB column to frontend prop
                        eventDate: data.event_date,
                        eventTime: data.event_time,
                        eventLocation: data.event_location,
                        responses: data.survey_responses || [] // Map relation
                    };
                    setSurvey(formattedSurvey);

                    if (formattedSurvey.responses.length >= formattedSurvey.limit) {
                        setIsFull(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching survey:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!survey) return;

        // Double check limit before submitting
        if ((survey.responses?.length || 0) >= survey.limit) {
            setIsFull(true);
            return;
        }

        try {
            const responseData = {
                survey_id: id,
                answers: formValues
            };

            const { error } = await supabase
                .from('survey_responses')
                .insert([responseData]);

            if (error) throw error;

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting survey:', error);
            alert('Hubo un error al enviar tu respuesta. Por favor intenta de nuevo.');
        }
    };

    const handleInputChange = (label, value) => {
        setFormValues(prev => ({
            ...prev,
            [label]: value
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!survey) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Formulario no encontrado</h1>
                    <p className="text-slate-500">El link que utilizaste no es válido o ha expirado.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-primary-600 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Exitoso!</h1>
                    <p className="text-slate-600 mb-8 break-words break-all">
                        Gracias por registrarte en <strong>{survey.title}</strong>. Hemos guardado tu información correctamente.
                    </p>
                </div>
            </div>
        );
    }

    if (isFull) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Cupos Agotados</h1>
                    <p className="text-slate-600 mb-6">
                        Lo sentimos, se ha alcanzado el límite de registros para <strong>{survey.title}</strong>.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500">
                        Si crees que esto es un error, por favor contacta al organizador.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                {/* Header Card */}
                <div className="bg-white rounded-t-3xl shadow-sm border-b-8 border-primary-600 p-8 mb-6 relative overflow-hidden">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-bl-full opacity-50 pointer-events-none"></div>

                    <h1 className="text-3xl font-bold text-slate-900 mb-2 relative z-10">{survey.title}</h1>
                    {survey.description && (
                        <p className="text-slate-600 whitespace-pre-wrap relative z-10">{survey.description}</p>
                    )}

                    {(survey.eventDate || survey.eventTime || survey.eventLocation) && (
                        <div className="mt-8 bg-slate-50/80 backdrop-blur-sm rounded-2xl p-4 md:p-5 border border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 relative z-10">
                            {survey.eventDate && (
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                        <Calendar size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">FECHA</span>
                                        <span className="font-bold text-slate-900 capitalize text-lg leading-tight whitespace-nowrap">
                                            {new Date(survey.eventDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Divider for Desktop */}
                            {(survey.eventDate && (survey.eventTime || survey.eventLocation)) && (
                                <div className="hidden md:block w-px h-12 bg-slate-200"></div>
                            )}

                            {survey.eventTime && (
                                <div className="flex items-center gap-4 flex-1 md:justify-center">
                                    <div className="w-12 h-12 rounded-xl bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                        <Clock size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">HORA</span>
                                        <span className="font-bold text-slate-900 text-lg leading-tight whitespace-nowrap">
                                            {survey.eventTime.slice(0, 5)}
                                            <span className="text-sm text-slate-500 font-medium ml-1">hrs</span>
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Divider for Desktop */}
                            {((survey.eventDate || survey.eventTime) && survey.eventLocation) && (
                                <div className="hidden md:block w-px h-12 bg-slate-200"></div>
                            )}

                            {survey.eventLocation && (
                                <div className="flex items-center gap-4 flex-1 md:justify-end">
                                    <div className="w-12 h-12 rounded-xl bg-white text-purple-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                        <MapPin size={22} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">LUGAR</span>
                                        <span className="font-bold text-slate-900 text-lg leading-tight">
                                            {survey.eventLocation}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="mt-6 flex items-center gap-2 text-sm text-slate-500 relative z-10">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">Registro Abierto</span>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {survey.questions.map(q => (
                            <div key={q.id} className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-2 group-focus-within:text-primary-600 transition-colors">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </label>

                                {q.type === 'paragraph' ? (
                                    <textarea
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all min-h-[120px] text-slate-900 placeholder:text-slate-400"
                                        placeholder="Tu respuesta..."
                                    />
                                ) : q.type === 'multiple_choice' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-primary-200 cursor-pointer transition-all">
                                                <input
                                                    type="radio"
                                                    name={`question_${q.id}`}
                                                    value={opt}
                                                    required={q.required}
                                                    onChange={(e) => handleInputChange(q.label, e.target.value)}
                                                    className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-slate-300"
                                                />
                                                <span className="text-slate-700 font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : q.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-primary-200 cursor-pointer transition-all">
                                                <input
                                                    type="checkbox"
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const currentVal = formValues[q.label] || [];
                                                        let newVal;
                                                        if (e.target.checked) {
                                                            newVal = [...currentVal, opt];
                                                        } else {
                                                            newVal = currentVal.filter(v => v !== opt);
                                                        }
                                                        handleInputChange(q.label, newVal);
                                                    }}
                                                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 border-slate-300"
                                                />
                                                <span className="text-slate-700 font-medium">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={q.type}
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                                        placeholder={`Tu respuesta...`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-primary-600/30 active:scale-[0.98] transform"
                            >
                                Enviar Registro
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-4">
                                Nunca envíes contraseñas a través de Formularios.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PublicSurveyView;
