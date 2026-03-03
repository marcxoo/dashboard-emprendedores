import { motion } from 'framer-motion';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';

const BentoCard = ({
    title,
    description,
    icon: Icon,
    onClick,
    className = "",
    gradient = "from-slate-500 to-slate-600",
    iconColor = "text-slate-500",
    span = "col-span-1",
    delay = 0,
    active = false,
    stats = null,
    avatars = null // Array of { src, name } objects for entrepreneur photos
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay * 0.1 }}
            onClick={onClick}
            className={`group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 ${span} ${className}`}
        >
            {/* Background Gradient Effect */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

            {/* Optional Background Image */}
            {active && !stats && (
                <div className="absolute top-6 right-6 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${iconColor.replace('text-', 'bg-')}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${iconColor.replace('text-', 'bg-')}`}></span>
                </div>
            )}

            {/* Background Image Logic */}
            {stats && stats.backgroundImage && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={stats.backgroundImage}
                        alt=""
                        className={`w-full h-full object-cover transition-all duration-700 opacity-80 group-hover:opacity-90 group-hover:scale-105 ${stats.backgroundPosition || 'object-center'}`}
                    />
                    {/* Premium gradient overlay with subtle color tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            )}

            {/* Avatar Collage Background (when avatars provided instead of backgroundImage) */}
            {avatars && avatars.length > 0 && !stats?.backgroundImage && (
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="grid grid-cols-4 grid-rows-3 h-full w-full gap-0.5">
                        {avatars.slice(0, 12).map((avatar, idx) => (
                            <div key={idx} className="relative overflow-hidden">
                                <img
                                    src={avatar.src}
                                    alt={avatar.name || ''}
                                    className="w-full h-full object-cover transition-all duration-500 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-80"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        ))}
                    </div>
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-white/40 dark:from-slate-900 dark:via-slate-900/85 dark:to-slate-900/40" />
                </div>
            )}

            {/* Active Indicator Pulse */}
            {active && (
                <div className="absolute top-6 right-6 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${iconColor.replace('text-', 'bg-')}`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${iconColor.replace('text-', 'bg-')}`}></span>
                </div>
            )}

            <div className="p-8 h-full flex flex-col relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${stats?.backgroundImage ? 'bg-white/20 backdrop-blur-md border-white/20' : 'bg-white/90 dark:bg-white/10 backdrop-blur-sm border-slate-100 dark:border-white/10'} border group-hover:scale-110 transition-transform duration-300 shadow-sm ${iconColor} ${stats?.backgroundImage ? '!text-white' : ''}`}>
                        <Icon size={32} strokeWidth={1.5} />
                    </div>

                    {/* Hover Arrow */}
                    <div className={`w-10 h-10 rounded-full ${stats?.backgroundImage ? 'bg-white/20 backdrop-blur-md' : 'bg-white/90 dark:bg-white/10 backdrop-blur-sm'} flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300 shadow-sm`}>
                        <ArrowRight size={18} className={stats?.backgroundImage ? 'text-white' : 'text-slate-600 dark:text-slate-300'} />
                    </div>
                </div>

                {/* Content Section with enhanced contrast */}
                <div className="mt-auto">
                    {stats && (
                        <div className="mb-4">
                            <span className={`text-5xl font-black tracking-tight block ${stats.backgroundImage ? 'text-white drop-shadow-lg' : 'text-slate-900 dark:text-white drop-shadow-sm'}`}>
                                {stats.value}
                            </span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${stats.backgroundImage ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'}`}>
                                {stats.label}
                            </span>
                        </div>
                    )}

                    <h3 className={`text-xl font-bold mb-2 transition-colors ${stats?.backgroundImage ? 'text-white drop-shadow-md group-hover:text-cyan-300' : 'text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 drop-shadow-sm'}`}>
                        {title}
                    </h3>
                    <p className={`text-sm font-medium leading-relaxed line-clamp-2 ${stats?.backgroundImage ? 'text-white/90' : 'text-slate-700 dark:text-slate-300'}`}>
                        {description}
                    </p>
                </div>
            </div>

            {/* Spotlight Glare */}
            <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
        </motion.div>
    );
};

export default BentoCard;
