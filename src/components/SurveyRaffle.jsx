import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trash2, Shuffle, Users, Trophy, RefreshCw } from 'lucide-react';
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
                // Heuristic: Look for key containing 'name', 'nombre', or just take the first string value
                const names = (responses || []).map(r => {
                    const answers = r.answers;
                    const keys = Object.keys(answers);

                    // Priority 1: Exact matches
                    let nameKey = keys.find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name'));

                    // Priority 2: First key
                    if (!nameKey && keys.length > 0) nameKey = keys[0];

                    return answers[nameKey] || "Participante";
                }).filter(n => n && n !== "Participante"); // Filter placeholder if needed, or keep them

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

    const handleWin = (info) => {
        setWinner(info);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex overflow-hidden relative font-sans">
            {showConfetti && <SimpleConfetti />}

            {/* Sidebar List - Glassmorphic Navy */}
            <div className="w-80 border-r border-white/5 bg-[#0b2e43]/30 backdrop-blur-2xl flex flex-col h-screen z-20 shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <button onClick={() => navigate(-1)} className="flex items-center text-slate-300 hover:text-white mb-6 transition-colors text-sm font-medium tracking-wide">
                        <ArrowLeft size={16} className="mr-2" /> VOLVER AL DASHBOARD
                    </button>
                    <h2 className="font-bold text-xl flex items-center gap-3 text-white">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                            <Users size={18} />
                        </div>
                        Participantes <span className="text-slate-400 text-sm font-normal">({participants.length})</span>
                    </h2>
                </div>

                <div className="p-4 gap-3 flex border-b border-white/5 bg-black/20">
                    <button onClick={handleShuffle} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase tracking-wide hover:text-orange-400">
                        <Shuffle size={14} /> Mezclar
                    </button>
                    <button onClick={() => window.location.reload()} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-white/5 uppercase tracking-wide hover:text-orange-400">
                        <RefreshCw size={14} /> Reset
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                    {participants.map((p, idx) => (
                        <div key={idx} className="bg-white/5 p-3 rounded-xl flex justify-between items-center group hover:bg-white/10 transition-all border border-transparent hover:border-orange-500/30">
                            <span className="text-sm font-medium truncate w-48 text-slate-200 group-hover:text-white transition-colors">{p}</span>
                            <button onClick={() => handleRemoveParticipant(idx)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-white/5 p-1.5 rounded-lg hover:bg-white/20">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {participants.length === 0 && (
                        <div className="text-center text-slate-500 py-10 text-sm italic">
                            No hay participantes disponibles.
                        </div>
                    )}
                </div>

                {/* Footer Credits */}
                <div className="p-4 border-t border-white/5 bg-black/20 text-center">
                    <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">Admin Panel • UNEMI</span>
                </div>
            </div>

            {/* Main Stage */}
            <div className="flex-1 flex flex-col relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#0f172a] to-[#020617]">

                {/* Beautiful Background Grid */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px'
                }}></div>

                {/* Ambient Glows */}
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="absolute top-0 left-0 w-full p-10 flex justify-between items-start pointer-events-none z-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4 border border-orange-500/20 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                            En Vivo
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm tracking-tight">
                            {surveyTitle || "Sorteo del Evento"}
                        </h1>
                    </div>
                </div>

                {/* Center Stage - Centered with proper spacing */}
                <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full overflow-hidden">
                    {participants.length > 1 ? (
                        <div className="w-full max-w-[450px] md:max-w-[550px] aspect-square flex items-center justify-center">
                            <PrizeWheel
                                prizes={participants}
                                onWin={handleWin}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 bg-white/5 p-12 rounded-3xl border border-white/5 backdrop-blur-md">
                            <AlertCircle size={64} className="mx-auto mb-6 text-slate-500 opacity-80" />
                            <h3 className="text-2xl font-bold text-white mb-2">Esperando Participantes</h3>
                            <p className="text-slate-400">Se necesitan al menos 2 nombres para iniciar la ruleta.</p>
                        </div>
                    )}
                </div>

                {/* Winner Modal Overlay - Premium Card */}
                {winner && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-500 backdrop-blur-xl bg-[#020617]/80">
                        {/* Radial Burst Background */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,121,0,0.05)_20deg,transparent_40deg,rgba(255,121,0,0.05)_60deg,transparent_80deg,rgba(255,121,0,0.05)_100deg,transparent_120deg,rgba(255,121,0,0.05)_140deg,transparent_160deg,rgba(255,121,0,0.05)_180deg,transparent_200deg,rgba(255,121,0,0.05)_220deg,transparent_240deg,rgba(255,121,0,0.05)_260deg,transparent_280deg,rgba(255,121,0,0.05)_300deg,transparent_320deg,rgba(255,121,0,0.05)_340deg,transparent_360deg)] animate-[spin_20s_linear_infinite]"></div>
                        </div>

                        <div className="bg-[#0f172a] text-white rounded-[2.5rem] p-10 md:p-16 max-w-2xl w-full text-center shadow-[0_0_100px_rgba(255,121,0,0.2)] animate-in zoom-in-50 duration-500 border border-white/10 relative overflow-hidden transform hover:scale-[1.01] transition-transform">

                            {/* Decorative banner */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"></div>

                            <div className="w-28 h-28 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20 animate-[bounce_1s_infinite]">
                                <Trophy size={56} className="text-white drop-shadow-md" fill="currentColor" />
                            </div>

                            <h2 className="text-2xl md:text-3xl font-black uppercase text-orange-500 tracking-[0.3em] mb-2">¡Felicidades!</h2>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-10 break-words leading-none drop-shadow-lg tracking-tight">
                                {winner}
                            </h1>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => setWinner(null)}
                                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 px-8 rounded-2xl transition-colors text-lg uppercase tracking-wider flex-1"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={() => {
                                        setParticipants(prev => prev.filter(p => p !== winner));
                                        setWinner(null);
                                    }}
                                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2 uppercase tracking-wider flex-1"
                                >
                                    <Trash2 size={20} />
                                    Remover
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
function SimpleConfetti() {
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
            className="absolute inset-0 pointer-events-none z-[100]"
        />
    );
}

function AlertCircle({ size, className }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
    );
}
