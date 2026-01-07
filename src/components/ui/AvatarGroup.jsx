import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AvatarGroup = ({
    avatars,
    maxVisible = 5,
    size = 40,
    overlap = 14,
}) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const visibleAvatars = avatars.slice(0, maxVisible);
    const extraCount = avatars.length - maxVisible;

    return (
        <div className="flex items-center">
            <div className="flex">
                {visibleAvatars.map((avatar, idx) => {
                    const isHovered = hoveredIdx === idx;
                    return (
                        <div
                            key={idx}
                            className="border-2 border-white dark:border-slate-800 rounded-full bg-white dark:bg-slate-800 transition-all duration-300 relative shadow-sm"
                            style={{
                                width: size,
                                height: size,
                                zIndex: isHovered ? 100 : visibleAvatars.length - idx,
                                marginLeft: idx === 0 ? 0 : -overlap,
                                position: "relative",
                                transition: "margin-left 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
                                transform: isHovered ? "translateY(-5px) scale(1.1)" : "translateY(0) scale(1)",
                            }}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => setHoveredIdx(null)}
                        >
                            <img
                                src={avatar.src}
                                alt={avatar.alt || `Avatar ${idx + 1}`}
                                style={{ width: '100%', height: '100%' }} /* Ensure img fills container */
                                className="rounded-full object-cover"
                                draggable={false}
                            />
                            <AnimatePresence>
                                {isHovered && avatar.label && (
                                    <motion.div
                                        key="tooltip"
                                        initial={{
                                            x: "-50%",
                                            y: 10,
                                            opacity: 0,
                                            scale: 0.7,
                                        }}
                                        animate={{
                                            x: "-50%",
                                            y: 0,
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            x: "-50%",
                                            y: 10,
                                            opacity: 0,
                                            scale: 0.7,
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 24,
                                        }}
                                        className="absolute z-50 px-2 py-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded shadow-lg whitespace-nowrap pointer-events-none font-semibold"
                                        style={{
                                            top: -size * 0.7,
                                            left: "50%",
                                        }}
                                    >
                                        {avatar.label}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
                {extraCount > 0 && (
                    <div
                        className="flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold border-4 border-white dark:border-slate-800 rounded-full"
                        style={{
                            width: size,
                            height: size,
                            marginLeft: -overlap,
                            zIndex: 0,
                            fontSize: size * 0.35,
                            transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    >
                        +{extraCount}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AvatarGroup;
