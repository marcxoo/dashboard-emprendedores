import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trash2, Shuffle, Users, Trophy, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import PrizeWheel from './ui/PrizeWheel';

export default function SurveyRaffle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [winner, setWinner] = useState(null);
    const [surveyTitle, setSurveyTitle] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get Survey Info
                const { data: surveyData } = await supabase.from('custom_surveys').select('title').eq('id', id).single();
                if (surveyData) setSurveyTitle(surveyData.title);

                // Get Responses
                const { data: responses, error } = await supabase
                    .from('survey_responses')
                    .select('answers')
                    .eq('survey_id', id);

                if (error) throw error;

                // Extract Names
                const names = (responses || []).map(r => {
                    const answers = r.answers;
                    const keys = Object.keys(answers);
                    // Priority 1: Exact matches for "nombre" or "name"
                    let nameKey = keys.find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name'));
                    // Priority 2: First key
                    if (!nameKey && keys.length > 0) nameKey = keys[0];
                    return answers[nameKey] || "Participante";
                }).filter(n => n && n !== "Participante");

                setParticipants(names);

            } catch (err) {
                console.error("Error loading participants:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleRemoveParticipant = (index) => {
        setParticipants(prev => prev.filter((_, i) => i !== index));
    };

    const handleShuffle = () => {
        setParticipants(prev => [...prev].sort(() => Math.random() - 0.5));
    };

    const [showConfetti, setShowConfetti] = useState(false);
    const [confettiFading, setConfettiFading] = useState(false);

    const handleWin = (info) => {
        setWinner(info);
        setShowConfetti(true);
        setConfettiFading(false);

        // Start fade out after 4 seconds
        setTimeout(() => {
            setConfettiFading(true);
        }, 4000);

        // Remove component after 5 seconds (1s fade)
        setTimeout(() => {
            setShowConfetti(false);
            setConfettiFading(false);
        }, 5000);
    };

    const [isWheelSpinning, setIsWheelSpinning] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex overflow-hidden relative font-sans">
            {showConfetti && <SimpleConfetti isFading={confettiFading} />}

            {/* Sidebar List - Premium Dark Glass - Collapsible */}
            <div className={`border-r border-white/5 bg-[#0f172a]/95 backdrop-blur-3xl flex flex-col h-screen z-30 shadow-[4px_0_24px_rgba(0,0,0,0.2)] transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] absolute md:relative ${isWheelSpinning || winner ? '-ml-80 opacity-0' : (isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -ml-4 opacity-0 overflow-hidden')} `}>
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent min-w-[320px]">
                    <button
                        onClick={() => navigate('/surveys')}
                        className="flex items-center text-slate-400 hover:text-white mb-8 transition-colors text-xs font-bold tracking-widest uppercase group"
                    >
                        <div className="bg-white/5 p-1.5 rounded-lg mr-2 group-hover:bg-orange-500 group-hover:text-white transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        Volver al Dashboard
                    </button>

                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-black text-2xl text-white tracking-tight">Participantes</h2>
                        <div className="bg-orange-500/20 text-orange-400 text-xs font-bold px-3 py-1 rounded-full border border-orange-500/20">
                            {participants.length}
                        </div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium">Lista de inscritos para el sorteo.</p>
                </div>

                <div className="p-4 grid grid-cols-2 gap-3 border-b border-white/5 min-w-[320px]">
                    <button
                        onClick={handleShuffle}
                        className="bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-orange-500/30 hover:text-white group"
                    >
                        <Shuffle size={14} className="group-hover:rotate-180 transition-transform duration-500 text-orange-500" />
                        Mezclar
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-slate-800/50 hover:bg-slate-700/80 text-slate-300 text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 hover:border-blue-500/30 hover:text-white group"
                    >
                        <RefreshCw size={14} className="group-hover:spin-once text-blue-500" />
                        Reset
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent min-w-[320px]">
                    {participants.map((p, idx) => (
                        <div key={idx} className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex justify-between items-center group transition-all border border-transparent hover:border-white/10 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/5 shrink-0">
                                    {idx + 1}
                                </div>
                                <span className="text-sm font-semibold truncate text-slate-200 group-hover:text-white transition-colors">{p}</span>
                            </div>
                            <button
                                onClick={() => handleRemoveParticipant(idx)}
                                className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-lg"
                                title="Eliminar"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {participants.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50 px-6">
                            <Users size={48} className="text-slate-600 mb-4" strokeWidth={1} />
                            <p className="text-slate-400 text-sm font-medium">No hay participantes.</p>
                            <p className="text-slate-600 text-xs mt-1">Sincroniza el formulario para añadir más.</p>
                        </div>
                    )}
                </div>

                {/* Footer Credits */}
                <div className="p-4 border-t border-white/5 bg-white/[0.02] text-center min-w-[320px]">
                    <span className="text-[10px] text-slate-600 font-bold tracking-[0.2em] uppercase">Admin Panel • UNEMI</span>
                </div>
            </div>

            {/* Sidebar Toggle Button (Floating) */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute top-6 left-6 z-40 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/20 transition-all duration-500 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                title="Mostrar Sidebar"
            >
                <Users size={20} />
            </button>
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute top-6 left-[20rem] z-40 bg-transparent text-slate-500 hover:text-white p-2 transition-all duration-300 ${isSidebarOpen && !isWheelSpinning && !winner ? 'opacity-100' : 'opacity-0 pointer-events-none -translate-x-10'}`}
                title="Ocultar Sidebar"
            >
                <ArrowLeft size={20} />
            </button>


            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative bg-[#020617] isolate overflow-hidden h-screen">

                {/* Dynamic Backgrounds */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,53,15,0.15),rgba(255,255,255,0))]" />
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at center, #ffffff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Header - Now Relative to push content down */}
                <div className={`w-full p-6 md:p-8 flex justify-center items-center text-center z-20 transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${isWheelSpinning ? '-mt-[200px] opacity-0' : 'mt-0 opacity-100'}`}>
                    <div className="max-w-[90%]">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-orange-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_orange]"></span>
                            Sorteo En Vivo
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm tracking-tight leading-tight">
                            {surveyTitle || "Gran Sorteo"}
                        </h1>
                    </div>
                </div>

                {/* Center Stage - Centered with proper spacing */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 z-10 w-full relative">
                    {participants.length > 1 ? (
                        <div className={`relative group perspective-[1000px] flex flex-col items-center justify-center w-full h-full transition-all duration-1500 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}>
                            {/* Glow Effect behind wheel */}
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none transition-all duration-1500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isWheelSpinning ? 'w-[150vh] h-[150vh] opacity-30' : 'w-[80vh] h-[80vh] opacity-50'}`}></div>

                            {/* Wheel Container - Dynamic Sizing */}
                            <div className={`aspect-square flex items-center justify-center relative z-10 transform transition-all duration-1500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isWheelSpinning ? 'w-auto h-[85vh]' : 'w-auto h-[50vh] max-h-[600px]'}`}>
                                <PrizeWheel
                                    prizes={participants}
                                    onWin={handleWin}
                                    onSpinChange={setIsWheelSpinning}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="text-center bg-white/5 p-16 rounded-[3rem] border border-white/5 backdrop-blur-xl shadow-2xl max-w-md mx-4 transform hover:scale-105 transition-all duration-500 hover:border-white/10 hover:shadow-orange-500/5 hover:bg-white/[0.07]">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <AlertCircle size={40} className="text-slate-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Esperando Participantes</h3>
                            <p className="text-slate-400 leading-relaxed font-medium">Se necesitan al menos <span className="text-orange-400">2 nombres</span> para iniciar la ruleta.</p>
                        </div>
                    )}
                </div>

                {/* Winner Modal Overlay - Premium Design */}
                {winner && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-500 backdrop-blur-2xl bg-[#020617]/90">
                        {/* Radial Burst Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(249,115,22,0.05)_20deg,transparent_40deg,rgba(249,115,22,0.05)_60deg,transparent_80deg,rgba(249,115,22,0.05)_100deg,transparent_120deg,rgba(249,115,22,0.05)_140deg,transparent_160deg,rgba(249,115,22,0.05)_180deg,transparent_200deg,rgba(249,115,22,0.05)_220deg,transparent_240deg,rgba(249,115,22,0.05)_260deg,transparent_280deg,rgba(249,115,22,0.05)_300deg,transparent_320deg,rgba(249,115,22,0.05)_340deg,transparent_360deg)] animate-[spin_30s_linear_infinite]"></div>
                        </div>

                        <div className="bg-[#0f172a] text-white rounded-[3rem] p-12 md:p-16 max-w-3xl w-full text-center shadow-[0_0_120px_rgba(249,115,22,0.15)] animate-in zoom-in-50 duration-500 border border-white/10 relative overflow-hidden transform hover:scale-[1.01] transition-transform">

                            {/* Decorative banner */}
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

                            <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/30 animate-[bounce_1s_infinite]">
                                <Trophy size={64} className="text-white drop-shadow-md" fill="currentColor" />
                            </div>

                            <div className="space-y-4 mb-12">
                                <h2 className="text-xl md:text-2xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 tracking-[0.4em] flex items-center justify-center gap-4">
                                    <Sparkles size={20} className="text-yellow-400" />
                                    ¡Felicidades!
                                    <Sparkles size={20} className="text-yellow-400" />
                                </h2>
                                <h1 className="text-5xl md:text-7xl font-black text-white break-words leading-none drop-shadow-2xl tracking-tight">
                                    {winner}
                                </h1>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
                                <button
                                    onClick={() => {
                                        setWinner(null);
                                        setIsSidebarOpen(true);
                                    }}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 px-8 rounded-2xl transition-colors text-sm uppercase tracking-wider flex-1 border border-white/5 hover:border-white/10"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => {
                                        setParticipants(prev => prev.filter(p => p !== winner));
                                        setWinner(null);
                                        setIsSidebarOpen(true);
                                    }}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 text-sm flex items-center justify-center gap-3 uppercase tracking-wider flex-1 group"
                                >
                                    <Trash2 size={16} className="text-white/80 group-hover:text-white" />
                                    Remover Ganador
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Improved Confetti with Rotation & Physics
function SimpleConfetti({ isFading }) {
    useEffect(() => {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
        const particles = [];

        // Create particles
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 8 + 5,
                h: Math.random() * 8 + 5,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 4 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.vy += 0.05; // Gravity

                // Reset logic
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.vy = Math.random() * 4 + 2;
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <canvas
            id="confetti-canvas"
            className={`absolute inset-0 pointer-events-none z-[100] transition-opacity duration-1000 ${isFading ? 'opacity-0' : 'opacity-100'}`}
        />
    );
}
