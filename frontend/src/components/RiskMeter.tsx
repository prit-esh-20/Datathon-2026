import { motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function RiskMeter({ score, level }) {
    const colorMap = {
        Low: "text-neon-green border-neon-green",
        Medium: "text-yellow-400 border-yellow-400",
        High: "text-neon-red border-neon-red",
    };

    const bgMap = {
        Low: "bg-neon-green",
        Medium: "bg-yellow-400",
        High: "bg-neon-red",
    };

    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

            <h3 className="text-white/60 text-sm font-semibold tracking-wider mb-6 uppercase">
                Decline Probability
            </h3>

            <div className="relative w-48 h-24 overflow-hidden mb-4">
                {/* Background Arc */}
                <div className="absolute w-44 h-44 rounded-full border-[12px] border-white/10 border-t-transparent border-l-transparent -rotate-45 top-0 left-2"></div>
                {/* Animated Arc */}
                <motion.div
                    initial={{ rotate: -135 }}
                    animate={{ rotate: -135 + (score / 100) * 180 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={cn(
                        "absolute w-44 h-44 rounded-full border-[12px] border-l-transparent border-b-transparent top-0 left-2 origin-center",
                        level === "Low" ? "border-neon-green" : level === "Medium" ? "border-yellow-400" : "border-neon-red"
                    )}
                    style={{ rotate: -135 }}
                />
            </div>

            <div className="text-center mt-2 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <span className={cn("text-4xl font-bold drop-shadow-md", colorMap[level].split(" ")[0])}>
                        {level}
                    </span>
                    <p className="text-white/40 text-xs mt-1">Risk Score: {score}/100</p>
                </motion.div>
            </div>

            <div className={cn("absolute bottom-0 inset-x-0 h-16 opacity-10 bg-gradient-to-t from-current to-transparent", bgMap[level])}></div>
        </div>
    );
}
