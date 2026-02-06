import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Calendar, Clock, MapPin, ArrowRight, Trophy, Sparkles, Info } from 'lucide-react';
import PrizeWheel from './ui/PrizeWheel';

function PublicSurveyView() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const [formValues, setFormValues] = useState({});

    // Prize Wheel State
    const [showWheel, setShowWheel] = useState(false);
    const [prize, setPrize] = useState(null);

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
                        note: data.note, // Map DB column
                        eventDate: data.event_date,
                        eventTime: data.event_time,
                        eventLocation: data.event_location,
                        responses: data.survey_responses || [] // Map relation
                    };
                    setSurvey(formattedSurvey);

                    if (formattedSurvey.limit && formattedSurvey.limit > 0 && formattedSurvey.responses.length >= formattedSurvey.limit) {
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
        if (survey.limit && survey.limit > 0 && (survey.responses?.length || 0) >= survey.limit) {
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
            <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-700 relative overflow-hidden ${showWheel ? 'bg-slate-900' : 'bg-[#0f172a]'}`}>
                {/* Advanced Dynamic Background */}
                {!showWheel && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                        <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-blue-500/20 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                    </div>
                )}

                <div className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-lg w-full text-center animate-scale-in relative border border-white/20 overflow-hidden ${showWheel ? 'bg-slate-800/95 border-white/10 text-white' : ''}`}>

                    {/* Decorative Top Gradient Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>

                    {!showWheel ? (
                        <>
                            <div className="relative mb-10 mt-4">
                                <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl opacity-60 animate-pulse"></div>
                                <div className="relative w-28 h-28 bg-gradient-to-tr from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/40 animate-bounce-small border-4 border-white dark:border-slate-800">
                                    <CheckCircle size={56} className="text-white drop-shadow-md" strokeWidth={3} />
                                </div>
                            </div>

                            <div className="space-y-2 mb-10">
                                <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
                                    ¡Registro <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">Exitoso!</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Tu cupo ha sido reservado.</p>
                            </div>

                            {/* Ticket Style Event Details */}
                            <div className="relative bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-10 border border-slate-100 dark:border-white/5 shadow-inner group transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
                                {/* Ticket Cutouts */}
                                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-white/5 -translate-y-1/2"></div>
                                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white dark:bg-slate-900 rounded-full border border-slate-100 dark:border-white/5 -translate-y-1/2"></div>

                                <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-3">Estás registrado en</p>
                                <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-tight mb-6 text-balance">
                                    {survey.title}
                                </h2>

                                <div className="border-t-2 border-dashed border-slate-200 dark:border-slate-700 pt-6 flex flex-wrap justify-center gap-4">
                                    {survey.eventDate && (
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600">
                                            <Calendar size={18} className="text-purple-500" />
                                            <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">
                                                {new Date(survey.eventDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                    )}
                                    {survey.eventTime && (
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-700 py-2 px-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600">
                                            <Clock size={18} className="text-orange-500" />
                                            <span className="font-bold text-slate-700 dark:text-slate-200">
                                                {survey.eventTime.slice(0, 5)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>



                            {/* Wheel Teaser - Only for Raffle Type */}

                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                            {!prize ? (
                                <>
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">¡Mucha Suerte! 🍀</h2>
                                        <p className="text-slate-400 text-lg">Gira la ruleta y descubre tu premio</p>
                                    </div>
                                    <div className="transform scale-90 md:scale-100">
                                        <PrizeWheel
                                            onWin={(p) => setPrize(p)}
                                            prizes={[
                                                "10% Descuento", "Asesoría Gratis", "Kit Digital", "Consulta Express",
                                                "Workshop VIP", "Sigue Intentando", "Mención en Redes", "Ebook Gratis"
                                            ]}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="py-8 animate-in zoom-in duration-500">
                                    <div className="relative inline-block mb-8">
                                        <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse"></div>
                                        <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-3xl flex items-center justify-center text-white shadow-2xl rotate-6 mx-auto border-4 border-white/20 backdrop-blur-sm">
                                            <Sparkles size={64} className="animate-bounce drop-shadow-md" />
                                        </div>
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-4 drop-shadow-lg">{prize === "Sigue Intentando" ? "¡Casi!" : "¡FELICIDADES!"}</h2>

                                    <div className="bg-slate-700/50 rounded-2xl p-6 mb-8 border border-white/10 backdrop-blur-md">
                                        <p className="text-slate-300 text-sm uppercase tracking-widest font-bold mb-2">Tu premio</p>
                                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-orange-400">
                                            {prize}
                                        </div>
                                    </div>

                                    {prize !== "Sigue Intentando" && (
                                        <div className="flex items-start gap-3 text-left bg-blue-900/30 p-4 rounded-xl border border-blue-500/30 mb-8">
                                            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-300">
                                                <CheckCircle size={20} />
                                            </div>
                                            <p className="text-sm text-blue-100 leading-relaxed">
                                                <strong>¡Importante!</strong> Toma una captura de pantalla ahora mismo para reclamar tu premio con el organizador.
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-slate-100 transition-colors shadow-lg shadow-white/10"
                                    >
                                        Volver al inicio
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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

                </div>
            </div>
        );
    }

    // Logic for conditional display
    const hasLimit = survey.limit && survey.limit > 0;
    const responsesCount = survey.responses?.length || 0;
    const percentage = hasLimit ? Math.round((responsesCount / survey.limit) * 100) : 0;
    const notesContent = survey.note || (hasLimit ? "Este es un taller práctico que se realiza en aula con computadoras. Se requiere manejo básico de herramientas digitales." : null);

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                {/* Header Section */}
                <div className="bg-white p-6 md:p-10 border-b border-slate-100 relative overflow-hidden">
                    {/* Top Decor Line */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-primary-600"></div>

                    {/* Background Decor */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50/50 rounded-bl-full -mr-16 -mt-16 pointer-events-none opacity-60"></div>

                    <div className="relative z-10">
                        {/* Sponsor Logos */}
                        <div className="flex flex-col items-center gap-4 mb-6 md:mb-8 py-5 px-6 bg-slate-50/80 rounded-2xl border border-slate-100">
                            <img
                                src="https://i.imgur.com/9VlCMnD.png"
                                alt="Escuela de Emprendimiento UNEMI"
                                className="h-16 md:h-20 w-auto object-contain"
                            />
                            <div className="w-full h-px bg-slate-200"></div>
                            <div className="flex items-center justify-center gap-8 md:gap-16">
                                <img
                                    src="https://i.imgur.com/mltK17L.png"
                                    alt="Cooperativa Jardín Azuayo"
                                    className="h-14 md:h-16 w-auto object-contain max-w-[160px] md:max-w-[200px]"
                                />
                                <img
                                    src="https://i.imgur.com/PWgoHmu.png"
                                    alt="Cooperativa Santa Rosa"
                                    className="h-14 md:h-16 w-auto object-contain max-w-[160px] md:max-w-[200px]"
                                />
                            </div>
                        </div>
                        {/* Status Badge - Moved above title */}
                        <div className="mb-8">
                            {/* Urgent Banner - Hidden if disabled or not applicable */}
                            {Boolean(survey.showUrgencyBanner !== false && hasLimit) && (
                                <div className="relative overflow-hidden rounded-2xl p-[3px] bg-gradient-to-r from-orange-500 to-red-600 shadow-xl shadow-orange-900/20">
                                    <div className="bg-[#1a1b26] rounded-[14px] p-4 md:p-5 relative overflow-hidden">
                                        {/* Background Glows */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none"></div>
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 blur-3xl rounded-full pointer-events-none"></div>

                                        <div className="flex items-start md:items-center gap-4 md:gap-5 relative z-10">
                                            {/* Icon */}
                                            <div className="shrink-0">
                                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#eaddcf] flex items-center justify-center shadow-lg animate-heartbeat">
                                                    <AlertCircle size={24} className="md:w-8 md:h-8 text-[#d74e26]" strokeWidth={2.5} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 w-full min-w-0">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2 md:mb-3 gap-2">
                                                    <h3 className="font-black text-white text-lg md:text-xl uppercase tracking-tight leading-tight">
                                                        🔥 ¡ÚLTIMOS CUPOS DISPONIBLES!
                                                    </h3>
                                                    <span className="self-start md:self-auto bg-[#ffdad6] text-[#d74e26] text-[9px] md:text-[10px] font-black px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap">
                                                        Alta Demanda
                                                    </span>
                                                </div>

                                                <p className="text-[#94a3b8] text-sm font-medium mb-3 md:mb-4 leading-relaxed">
                                                    La capacidad del taller está al <strong className="text-[#f97316] text-base md:text-lg">{Math.max(percentage, 92)}%</strong>. No pierdas tu oportunidad de participar.
                                                </p>

                                                {/* Progress Bar */}
                                                <div className="space-y-1.5 md:space-y-2">
                                                    <style>
                                                        {`
                                                        @keyframes progress-stripes {
                                                            from { background-position: 1rem 0; }
                                                            to { background-position: 0 0; }
                                                        }
                                                        .animate-stripes {
                                                            animation: progress-stripes 1s linear infinite;
                                                        }
                                                        @keyframes heartbeat {
                                                            0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(234, 221, 207, 0); }
                                                            50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(234, 221, 207, 0.5); }
                                                        }
                                                        .animate-heartbeat {
                                                            animation: heartbeat 2s ease-in-out infinite;
                                                        }
                                                    `}
                                                    </style>
                                                    <div className="w-full bg-[#0f172a] rounded-full h-3 md:h-5 overflow-hidden shadow-inner border border-white/10 p-[2px]">
                                                        <div
                                                            className="h-full bg-orange-500 rounded-full relative transition-all duration-1000 animate-stripes shadow-[0_0_15px_rgba(249,115,22,0.6)]"
                                                            style={{
                                                                width: `${Math.max(percentage, 92)}%`,
                                                                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,0.4) 25%,transparent 25%,transparent 50%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.4) 75%,transparent 75%,transparent)',
                                                                backgroundSize: '1rem 1rem'
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-[10px] md:text-[11px] font-bold tracking-widest uppercase px-1">
                                                        <span className="text-[#64748b]">Reservados</span>
                                                        <span className="text-[#f97316] animate-pulse">¡Quedan pocos!</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Mobile Scroll Shortcut */}
                            <button
                                onClick={() => document.getElementById('registration-form').scrollIntoView({ behavior: 'smooth' })}
                                className="md:hidden w-full mt-3 py-3 text-xs font-bold bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border border-slate-100 hover:bg-slate-100"
                            >
                                Reservar mi lugar <ArrowRight size={14} />
                            </button>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-extrabold text-[#1d2b4f] leading-tight tracking-tight mb-3 md:mb-4">{survey.title}</h1>

                        {survey.description && (
                            <p className="text-slate-600 text-sm md:text-lg leading-relaxed whitespace-pre-wrap mb-6 md:mb-8">{survey.description}</p>
                        )}

                        {/* Note Alert */}
                        {notesContent && (
                            <div className="mb-6 md:mb-8 bg-amber-50 text-amber-900 px-4 py-3 rounded-xl border border-amber-100 flex items-start gap-3">
                                <Info size={18} className="text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-sm font-medium leading-relaxed">
                                    <span className="font-bold block mb-0.5">Nota:</span>
                                    {notesContent}
                                </p>
                            </div>
                        )}

                        {/* Event Details Bar - Grid Layout with Dividers */}
                        {(survey.eventDate || survey.eventTime || survey.eventLocation) && (
                            <div className="bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 relative z-10">
                                {survey.eventDate && (
                                    <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:bg-white/50 transition-colors first:rounded-t-xl md:first:rounded-l-2xl md:first:rounded-tr-none">
                                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white text-primary-600 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <Calendar size={18} strokeWidth={2} className="md:w-[20px] md:h-[20px]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">FECHA</span>
                                            <span className="font-bold text-[#1d2b4f] capitalize text-sm md:text-base leading-tight">
                                                {new Date(survey.eventDate + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {survey.eventTime && (
                                    <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:bg-white/50 transition-colors">
                                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white text-orange-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <Clock size={18} strokeWidth={2} className="md:w-[20px] md:h-[20px]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">HORA</span>
                                            <span className="font-bold text-[#1d2b4f] text-sm md:text-base leading-tight">
                                                {survey.eventTime.slice(0, 5)}
                                                <span className="text-[10px] md:text-xs text-slate-500 font-medium ml-1">hrs</span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {survey.eventLocation && (
                                    <div className="p-4 md:p-5 flex items-center gap-3 md:gap-4 hover:bg-white/50 transition-colors last:rounded-b-xl md:last:rounded-r-2xl md:last:rounded-bl-none">
                                        <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white text-purple-500 flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
                                            <MapPin size={18} strokeWidth={2} className="md:w-[20px] md:h-[20px]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">LUGAR</span>
                                            <span className="font-bold text-[#1d2b4f] text-sm md:text-base leading-tight break-words">
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
                <div id="registration-form" className="p-6 md:p-12 bg-white relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-1 rounded-full border border-slate-100 shadow-sm z-20 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Formulario de Registro</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 mt-4">
                        {survey.questions.map(q => (
                            <div key={q.id} className="group animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: `${q.id * 100}ms` }}>
                                <label className="block text-sm font-bold text-slate-700 mb-3 group-focus-within:text-primary-600 transition-colors uppercase tracking-wide flex justify-between items-center">
                                    {q.label}
                                    {q.required && <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold tracking-wider">REQUERIDO</span>}
                                </label>

                                {q.type === 'paragraph' ? (
                                    <textarea
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 min-h-[120px] text-[#1d2b4f] placeholder:text-slate-400 text-base resize-none"
                                        placeholder="Escribe tu respuesta aquí..."
                                    />
                                ) : q.type === 'multiple_choice' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-primary-200 hover:bg-slate-50 cursor-pointer transition-all duration-200 group/opt">
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
                                                <span className="text-slate-700 font-medium group-hover/opt:text-[#1d2b4f]">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : q.type === 'checkbox' ? (
                                    <div className="space-y-3">
                                        {q.options?.map((opt, idx) => (
                                            <label key={idx} className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 hover:border-primary-200 hover:bg-slate-50 cursor-pointer transition-all duration-200 group/opt">
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
                                                <span className="text-slate-700 font-medium group-hover/opt:text-[#1d2b4f]">{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <input
                                        type={q.type}
                                        required={q.required}
                                        onChange={(e) => handleInputChange(q.label, e.target.value)}
                                        className="w-full px-5 py-4 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all duration-300 text-[#1d2b4f] placeholder:text-slate-400 text-base"
                                        placeholder={`Escribe tu respuesta...`}
                                    />
                                )}
                            </div>
                        ))}

                        <div className="pt-8 border-t border-slate-100 mt-12">
                            <button
                                type="submit"
                                className="w-full group bg-[#1d2b4f] hover:bg-[#15203c] text-white font-bold py-5 px-6 rounded-2xl transition-all shadow-xl shadow-[#1d2b4f]/10 active:scale-[0.99] transform text-lg flex items-center justify-center gap-3"
                            >
                                <span>Confirmar Asistencia</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <p className="text-xs text-center text-slate-400 mt-6 flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                Sus datos están protegidos y seguros
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>

    );
}

export default PublicSurveyView;
