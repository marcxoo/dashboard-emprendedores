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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (status === 'not_found') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Enlace no válido</h2>
                    <p className="text-slate-600">No pudimos encontrar la asignación solicitada. Verifica el enlace.</p>
                </div>
            </div>
        );
    }

    if (status === 'already_submitted') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Gracias!</h2>
                    <p className="text-slate-600">Ya hemos recibido tu respuesta para esta semana.</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center animate-scale-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Encuesta Enviada!</h2>
                    <p className="text-slate-600 mb-6">Gracias por compartir tu experiencia. Tu opinión nos ayuda a mejorar el programa.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-primary-600 px-8 py-6">
                        <h1 className="text-2xl font-bold text-white">Encuesta Semanal</h1>
                        <p className="text-primary-100 mt-2">Cuéntanos cómo te fue en tu stand</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Question 1 */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                <Star className="text-yellow-500" size={24} />
                                1. ¿Cómo te fue esta semana en tu stand?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Muy bien', 'Bien', 'Regular', 'Mal'].map((option) => (
                                    <label key={option} className={`
                                        relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${formData.experience === option
                                            ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="experience"
                                            value={option}
                                            checked={formData.experience === option}
                                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 2 */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                <TrendingUp className="text-blue-500" size={24} />
                                2. ¿Sientes que este proyecto ayudó a tus ventas?
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['Mucho', 'Algo', 'Poco', 'Nada'].map((option) => (
                                    <label key={option} className={`
                                        relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                                        ${formData.impact === option
                                            ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'}
                                    `}>
                                        <input
                                            type="radio"
                                            name="impact"
                                            value={option}
                                            checked={formData.impact === option}
                                            onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                            className="sr-only"
                                        />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Question 3 */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-lg font-bold text-slate-800">
                                <DollarSign className="text-green-500" size={24} />
                                3. ¿Cuántas ventas realizaste? <span className="text-sm font-normal text-slate-500 ml-2">(Opcional)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formData.sales}
                                    onChange={(e) => setFormData({ ...formData, sales: e.target.value })}
                                    className="w-full p-4 text-lg border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">ventas</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary-600/30 hover:bg-primary-700 hover:shadow-primary-600/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            Enviar Respuesta
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
