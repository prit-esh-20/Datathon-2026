import { motion } from "framer-motion";

interface TimelineProps {
    stage: "Growth" | "Peak" | "Saturation" | "Decline" | "Collapse";
}

const STAGES = ["Growth", "Peak", "Saturation", "Decline", "Collapse"];

export function LifecycleTimeline({ stage }: TimelineProps) {
    const currentIndex = STAGES.indexOf(stage);
    const progress = ((currentIndex) / (STAGES.length - 1)) * 100;

    // Color logic
    const getColor = (index: number) => {
        if (index < currentIndex) return "bg-neon-blue";
        if (index === currentIndex) return "bg-white shadow-[0_0_15px_white]";
        return "bg-white/10";
    };

    const getLogWidth = (index: number) => {
        if (index <= currentIndex) return 3;
        return 0;
    }

    return (
        <div className="w-full py-6">
            <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-mono text-neon-blue tracking-widest uppercase">Lifecycle Stage</span>
                <span className="text-xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{stage}</span>
            </div>

            {/* Progress Bar Container */}
            <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                {/* Animated Fill */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-neon-blue via-purple-500 to-neon-red"
                />
            </div>

            {/* Nodes */}
            <div className="relative w-full flex justify-between -mt-3.5 px-[2px]"> {/* Adjusted logic for alignment */}
                {STAGES.map((s, i) => (
                    <div key={s} className="flex flex-col items-center group">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className={`w-3 h-3 rounded-full border border-black ${getColor(i)} z-10 transition-all duration-500`}
                        />
                        <span className={`mt-3 text-[10px] uppercase font-medium tracking-wider transition-colors duration-500 ${i === currentIndex ? 'text-white' : 'text-white/30'}`}>
                            {s}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
