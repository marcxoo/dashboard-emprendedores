import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle, Send, Star, TrendingUp, DollarSign } from 'lucide-react';

export default function SurveyPage() {
    const { id } = useParams();
    const { db, isLoaded } = useData();
    const [status, setStatus] = useState('loading'); // loading, ready, submitting, success, error
    const [assignment, setAssignment] = useState(null);
    const [formData, setFormData] = useState({
        experience: '',
        impact: '',
        sales: ''
    });

    useEffect(() => {
        if (isLoaded && db) {
            // Find assignment
            // Since db.asignaciones is available, we can search it.
            // However, if this is a fresh load on a public link, we might need to ensure data is loaded.
            // The DataProvider loads data on mount, so it should be fine.
            const found = db.asignaciones.find(a => a.id_asignacion === id);
            if (found) {
                setAssignment(found);
                // Check if already submitted
                if (found.comentarios && found.comentarios.startsWith('[SURVEY]')) {
                    setStatus('already_submitted');
                } else {
                    setStatus('ready');
                }
            } else {
                setStatus('not_found');
            }
        }
    }, [isLoaded, db, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.experience || !formData.impact) {
            alert('Por favor responde las preguntas obligatorias.');
            return;
        }

        setStatus('submitting');
        try {
            const success = await db.submitSurvey(id, formData);
            if (success) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    if (!isLoaded || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (status === 'not_found') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700/50">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} className="text-red-500 dark:text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Enlace no válido</h2>
                    <p className="text-slate-600 dark:text-slate-400">No pudimos encontrar la asignación solicitada. Por favor verifica el enlace.</p>
                </div>
            </div>
        );
    }

    if (status === 'already_submitted') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center border border-slate-100 dark:border-slate-700/50">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-500 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">¡Gracias!</h2>
                    <p className="text-slate-600 dark:text-slate-400">Ya hemos recibido tu respuesta para esta semana.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full text-center animate-scale-in border border-slate-100 dark:border-slate-700/50">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">¡Encuesta Enviada!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Gracias por compartir tu experiencia. Tu opinión nos ayuda a mejorar el programa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-xl mx-auto">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5 transition-colors duration-300">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold text-white mb-2">Encuesta Semanal</h1>
                            <p className="text-primary-100 text-lg">Cuéntanos cómo te fue en tu stand</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-10">
                        {/* Question 1 */}
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
                                <span className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400">
                                    <Star size={24} />
                                </span>
                                1. ¿Cómo te fue esta semana?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Muy bien', 'Bien', 'Regular', 'Mal'].map((option) => (
                                    <label key={option} className={`
                                        relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                        ${formData.experience === option
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-bold shadow-md scale-[1.02]'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="experience"
                                            value={option}
                                            checked={formData.experience === option}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
                                <span className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                    <TrendingUp size={24} />
                                </span>
                                2. ¿Impacto en tus ventas?
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                {['Mucho', 'Algo', 'Poco', 'Nada'].map((option) => (
                                    <label key={option} className={`
                                        relative flex items-center justify-center p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200
                                        ${formData.impact === option
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold shadow-md scale-[1.02]'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="impact"
                                            value={option}
                                            checked={formData.impact === option}
                                            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span className="text-lg">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div className="space-y-5">
                            <label className="flex items-center gap-3 text-xl font-bold text-slate-900 dark:text-white">
                                <span className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                                    <DollarSign size={24} />
                                </span>
                                3. ¿Ventas realizadas? <span className="text-sm font-normal text-slate-500 dark:text-slate-500 ml-auto">(Opcional)</span>
                            </label>
                            <div className="relative group">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.sales}
                                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                                    className="w-full p-5 text-xl bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:border-green-500 dark:focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none placeholder:text-slate-400"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium pointer-events-none group-focus-within:text-green-500 transition-colors">ventas</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-xl py-5 rounded-2xl shadow-xl shadow-primary-900/20 hover:shadow-primary-900/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300"></div>
                            <Send size={24} />
                            {status === 'submitting' ? 'Enviando...' : 'Enviar Respuesta'}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Emprende Dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
