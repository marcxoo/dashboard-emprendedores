import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

function PublicSurveyView() {
    const { id } = useParams();
    const { isLoaded, getSurveyById, addSurveyResponse } = useData();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [isFull, setIsFull] = useState(false);
    const [formValues, setFormValues] = useState({});

    useEffect(() => {
        if (isLoaded) {
            const foundSurvey = getSurveyById(id);
            if (foundSurvey) {
                setSurvey(foundSurvey);
                const responsesCount = foundSurvey.responses?.length || 0;
                if (responsesCount >= foundSurvey.limit) {
                    setIsFull(true);
                }
            }
            setLoading(false);
        }
    }, [isLoaded, id, getSurveyById]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!survey) return;

        // Double check limit before submitting
        const currentSurvey = getSurveyById(id);
        if ((currentSurvey.responses?.length || 0) >= currentSurvey.limit) {
            setIsFull(true);
            return;
        }

        const success = await addSurveyResponse(id, formValues);
        if (success) {
            setSubmitted(true);
        }
    };

    const handleInputChange = (label, value) => {
        setFormValues(prev => ({
            ...prev,
            [label]: value
        }));
    };

    if (!isLoaded || loading) {
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
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Encuesta no encontrada</h1>
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
