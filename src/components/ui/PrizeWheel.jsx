import { useState, useEffect } from 'react';
import { motion, useAnimation, useMotionValue } from 'framer-motion';
import { Trophy, Sparkles, Gift } from 'lucide-react';

// Vibrant Casino Palette (Red, Blue, Green, Yellow, Purple, Orange)
const WHEEL_COLORS = [
    '#EF4444', // Red
    '#F59E0B', // Yellow/Gold
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F97316', // Orange
];

export default function PrizeWheel({ prizes = [], onWin }) {
    const [isSpinning, setIsSpinning] = useState(false);
    const [winnerIndex, setWinnerIndex] = useState(null);
    const [activeLight, setActiveLight] = useState(0);

    // Animations controls
    const wheelControls = useAnimation();
    const pointerControls = useAnimation();

    // Track rotation
    const [rotation, setRotation] = useState(0);

    // --- LIGHTS ANIMATION LOOP ---
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveLight((prev) => (prev + 1) % 24);
        }, isSpinning ? 40 : 100); // 40ms = Fast spin chase, 100ms = Idle crawl
        return () => clearInterval(interval);
    }, [isSpinning]);

    // --- DATA PREPARATION ---
    const rawItems = prizes.length > 0 ? prizes : ["Participante 1", "Participante 2", "Participante 3", "Participante 4"];
    let items = [...rawItems];
    // Ensure sufficient segments
    while (items.length < 8) {
        items = [...items, ...rawItems];
    }
    const numSegments = items.length;
    const segmentAngle = 360 / numSegments;

    // Pointer Ticking Logic
    const lastSegmentIndex = useMotionValue(-1);

    const spinToWinner = async () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setWinnerIndex(null);

        const winningIndex = Math.floor(Math.random() * numSegments);
        const winnerName = items[winningIndex];

        // Target: Top (North)
        const segmentCenter = (winningIndex * segmentAngle) + (segmentAngle / 2);
        let desiredEndRotation = 270 - segmentCenter;

        while (desiredEndRotation <= rotation) {
            desiredEndRotation += 360;
        }
        desiredEndRotation += 360 * 8; // 8 full spins

        const jitter = (Math.random() * segmentAngle * 0.4) - (segmentAngle * 0.2);
        desiredEndRotation += jitter;

        lastSegmentIndex.set(-1);

        // Accelerate
        await wheelControls.start({
            rotate: desiredEndRotation,
            transition: {
                duration: 8,
                ease: [0.15, 0, 0.15, 1], // Casino ease
                onUpdate: (latest) => {
                    const degPerSegment = 360 / numSegments;
                    const normalizedRotate = (latest + 90) % 360;
                    const currentSegment = Math.floor(normalizedRotate / degPerSegment);

                    if (currentSegment !== lastSegmentIndex.get() && lastSegmentIndex.get() !== -1) {
                        pointerControls.start({
                            rotate: [0, 25, 0],
                            transition: { duration: 0.1, ease: "easeOut" }
                        });
                    }
                    lastSegmentIndex.set(currentSegment);
                }
            }
        });

        setRotation(desiredEndRotation);
        setWinnerIndex(winningIndex);

        // Final tick
        await pointerControls.start({
            rotate: [0, 15, 0],
            transition: { duration: 0.3 }
        });

        setIsSpinning(false);
        if (onWin) onWin(winnerName);
    };

    return (
        <div className="flex flex-col items-center w-full max-w-full">
            <div className="relative w-full max-w-[550px] aspect-square">

                {/* --- POINTER (TOP CENTER) --- */}
                <div className="absolute top-[-4%] left-1/2 -translate-x-1/2 z-50 drop-shadow-2xl pointer-events-none filter drop-shadow-lg">
                    <motion.div
                        animate={pointerControls}
                        style={{ transformOrigin: "top center" }}
                        className="w-16 h-20 md:w-20 md:h-24"
                    >
                        <svg viewBox="0 0 100 120" className="w-full h-full">
                            <defs>
                                <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#b91c1c" />
                                    <stop offset="50%" stopColor="#ef4444" />
                                    <stop offset="100%" stopColor="#7f1d1d" />
                                </linearGradient>
                                <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(0,0,0,0.5)" />
                                </filter>
                            </defs>
                            <path d="M20,0 L80,0 L50,100 Z" fill="url(#pointerGrad)" stroke="#7f1d1d" strokeWidth="2" style={{ filter: "url(#dropShadow)" }} />
                            <circle cx="50" cy="15" r="8" fill="#d4d4d8" stroke="#52525b" strokeWidth="1" />
                        </svg>
                    </motion.div>
                </div>

                {/* --- WHEEL BEZEL (Chasing Lights) --- */}
                <div className="absolute inset-[-5%] rounded-full bg-gradient-to-br from-red-800 via-red-600 to-amber-700 shadow-2xl p-[4%] border-4 border-amber-600/50">
                    <div className="absolute inset-[3%] rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 shadow-inner border-2 border-yellow-200"></div>

                    {/* LIGHTS LOOP - ENHANCED VISUALS */}
                    {Array.from({ length: 24 }).map((_, i) => {
                        // High-speed Marquee Pattern: 1 ON, 1 OFF
                        const isActive = isSpinning
                            ? (i % 2 === activeLight % 2)
                            : (i % 24 === activeLight); // Single chaser when idle

                        return (
                            <div
                                key={`bulb-${i}`}
                                className="absolute top-0 left-1/2 w-6 h-[98%] -translate-x-1/2 pointer-events-none"
                                style={{ transform: `rotate(${i * 15}deg)` }}
                            >
                                <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full mx-auto transition-all duration-75 border border-amber-900/40 ${isActive
                                        ? "bg-[#fffbeb] shadow-[0_0_20px_4px_#f59e0b,0_0_8px_2px_#ffffff] scale-110 z-20"
                                        : "bg-gradient-to-br from-amber-700 to-red-950 shadow-inner opacity-70"
                                    }`}>
                                    {/* Glass Reflection Highlight */}
                                    {!isActive && <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white/30 rounded-full"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>


                {/* --- ROTATING WHEEL --- */}
                <motion.div
                    className="absolute inset-[4%] rounded-full overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] border-4 border-amber-900/40 bg-slate-900"
                    animate={wheelControls}
                    initial={{ rotate: 0 }}
                    style={{ transformOrigin: 'center' }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <defs>
                            <radialGradient id="metallicSheen" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="black" stopOpacity="0.4" />
                            </radialGradient>
                        </defs>
                        {items.map((item, index) => {
                            const startAngle = index * segmentAngle;
                            const endAngle = (index + 1) * segmentAngle;
                            const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                            const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                            const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                            const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);
                            const largeArcFlag = segmentAngle > 180 ? 1 : 0;
                            const d = `M50,50 L${x1},${y1} A50,50 0 ${largeArcFlag},1 ${x2},${y2} Z`;
                            const isWinner = winnerIndex === index;
                            const baseColor = WHEEL_COLORS[index % WHEEL_COLORS.length];
                            // Adaptive text color
                            const textColor = ['#f8fafc', '#F59E0B', '#F97316'].includes(baseColor) ? '#0f172a' : 'white';

                            return (
                                <g key={index} className={isWinner ? "animate-pulse" : ""}>
                                    <path d={d} fill={baseColor} stroke="#fcd34d" strokeWidth="0.8" />
                                    <path d={d} fill="url(#metallicSheen)" style={{ mixBlendMode: 'multiply' }} />
                                    <text
                                        x="50" y="50"
                                        fill={textColor}
                                        fontSize={items.length > 20 ? "3" : "4.5"}
                                        fontWeight="900"
                                        textAnchor="end"
                                        alignmentBaseline="middle"
                                        transform={`rotate(${startAngle + segmentAngle / 2}, 50, 50) translate(44, 0)`}
                                        style={{ fontFamily: 'Arial Black, sans-serif', textShadow: textColor === 'white' ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none' }}
                                    >
                                        {item.length > 15 ? item.substring(0, 15) + '..' : item.toUpperCase()}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </motion.div>

                {/* --- 3D GOLD HUB --- */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[20%] h-[20%] rounded-full z-30 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-500 to-yellow-800 border-4 border-yellow-400">
                    <div className="w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-yellow-700 via-yellow-400 to-white flex items-center justify-center shadow-inner relative">
                        <Trophy size={32} className="text-yellow-900 drop-shadow-sm opacity-80" />
                        <div className="absolute top-2 left-2 text-white animate-ping opacity-70">
                            <Sparkles size={12} />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACTION BUTTON --- */}
            <motion.button
                onClick={spinToWinner}
                disabled={isSpinning}
                whileHover={!isSpinning ? { scale: 1.05, translateY: -2 } : {}}
                whileTap={!isSpinning ? { scale: 0.95, translateY: 2 } : {}}
                className={`mt-16 px-20 py-6 rounded-2xl font-black text-2xl tracking-widest uppercase shadow-[0_10px_0_#991b1b] transition-all border-4 border-yellow-400 ${isSpinning
                        ? 'bg-gray-600 border-gray-500 text-gray-400 shadow-none translate-y-2'
                        : 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-[0_8px_0_#7f1d1d,0_15px_20px_rgba(0,0,0,0.5)] hover:bg-red-500'
                    }`}
            >
                {isSpinning ? 'GIRANDO...' : '¡GIRAR!'}
            </motion.button>
        </div>
    );
}
