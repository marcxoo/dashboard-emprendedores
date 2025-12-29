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
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header Section */}
                <div className="bg-white p-8 md:p-10 border-b border-slate-100 relative overflow-hidden">
                    {/* Top Decor Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none opacity-60"></div>

                    <div className="relative z-10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">{survey.title}</h1>
                            {/* Status Badge */}
                            <span className="shrink-0 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                                Registro Abierto
                            </span>
                        </div>

                        {survey.description && (
                            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap mb-8">{survey.description}</p>
                        )}

                        {/* Event Details Bar */}
                        {(survey.eventDate || survey.eventTime || survey.eventLocation) && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col md:flex-row gap-6 md:items-center relative z-10">
                                {survey.eventDate && (
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <Calendar size={22} strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">FECHA</span>
                                            <span className="font-bold text-slate-900 capitalize text-lg leading-tight truncate">
                                                {new Date(survey.eventDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {survey.eventDate && (survey.eventTime || survey.eventLocation) && (
                                    <div className="hidden md:block w-px h-12 bg-slate-200 shrink-0"></div>
                                )}

                                {survey.eventTime && (
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <Clock size={22} strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">HORA</span>
                                            <span className="font-bold text-slate-900 text-lg leading-tight whitespace-nowrap">
                                                {survey.eventTime.slice(0, 5)}
                                                <span className="text-sm text-slate-500 font-medium ml-1">hrs</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {((survey.eventDate || survey.eventTime) && survey.eventLocation) && (
                                    <div className="hidden md:block w-px h-12 bg-slate-200 shrink-0"></div>
                                )}

                                {survey.eventLocation && (
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-white text-purple-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <MapPin size={22} strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">LUGAR</span>
                                            <span className="font-bold text-slate-900 text-lg leading-tight truncate" title={survey.eventLocation}>
                                                {survey.eventLocation}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Section */}
                <div className="p-8 md:p-10 bg-white">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {survey.questions.map(q => (
                            <div key={q.id} className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-3 group-focus-within:text-primary-600 transition-colors uppercase tracking-wide">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </label>

                                {q.type === 'paragraph' ? (
                                    <textarea
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all min-h-[120px] text-slate-900 placeholder:text-slate-400 text-base"
                                        placeholder="Escribe tu respuesta aquí..."
                                    />
                                ) : q.type === 'multiple_choice' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-primary-200 cursor-pointer transition-all group/opt">
                                                <div className="relative flex items-center justify-center">
                                                    <input
                                                        type="radio"
                                                        name={`question_${q.id}`}
                                                        value={opt}
                                                        required={q.required}
                                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-full checked:border-primary-500 checked:bg-primary-500 transition-colors"
                                                    />
                                                    <div className="absolute w-2 h-2 bg-white rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                                                </div>
                                                <span className="text-slate-700 font-medium group-hover/opt:text-slate-900">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : q.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-primary-200 cursor-pointer transition-all group/opt">
                                                <div className="relative flex items-center justify-center">
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
                                                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:border-primary-500 checked:bg-primary-500 transition-colors"
                                                    />
                                                    <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                                                </div>
                                                <span className="text-slate-700 font-medium group-hover/opt:text-slate-900">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={q.type}
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 text-base"
                                        placeholder={`Tu respuesta...`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-8">
                            <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-xl shadow-slate-900/10 active:scale-[0.99] transform text-lg"
                            >
                                Confirmar Asistencia
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-6">
                                Este formulario fue creado con <span className="font-bold text-slate-600">EmprendeForms</span>.
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default PublicSurveyView;
