import { motion } from "framer-motion";
import { ShieldCheck, Target, AlertTriangle, Fingerprint, Cpu, Gauge } from "lucide-react";

interface DecisionSummaryProps {
    riskScore: number;
    confidence: "LOW" | "MEDIUM" | "HIGH";
}

export const DecisionSummary = ({ riskScore, confidence = "HIGH" }: DecisionSummaryProps) => {
    const getDecisionState = (score: number) => {
        if (score > 80) return {
            label: "STOP",
            subLabel: "HALT ALL ALLOCATION",
            color: "text-red-500",
            bg: "bg-red-500/10",
            border: "border-red-500/30",
            glow: "shadow-[0_0_50px_rgba(255,0,60,0.2)]",
            icon: <AlertTriangle className="w-8 h-8 text-red-500" />
        };
        if (score > 40) return {
            label: "PIVOT",
            subLabel: "STRATEGIC RE-ALIGNMENT",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/30",
            glow: "shadow-[0_0_50px_rgba(245,158,11,0.2)]",
            icon: <Fingerprint className="w-8 h-8 text-amber-500" />
        };
        return {
            label: "CONTINUE",
            subLabel: "MAINTAIN SCALE OPS",
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/30",
            glow: "shadow-[0_0_50_rgba(34,197,94,0.2)]",
            icon: <ShieldCheck className="w-8 h-8 text-green-500" />
        };
    };

    const state = getDecisionState(riskScore);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden p-8 rounded-3xl border ${state.border} ${state.bg} ${state.glow} transition-all duration-700`}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Cpu className="w-32 h-32" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Decision Section */}
                <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl bg-black/40 border ${state.border} backdrop-blur-xl`}>
                        {state.icon}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Target className="w-3 h-3 text-white/40" />
                            <span className="text-[10px] font-mono tracking-[0.3em] text-white/40 uppercase">Final Decision Protocol</span>
                        </div>
                        <h2 className={`text-7xl font-black tracking-tighter ${state.color} leading-none`}>
                            {state.label}
                        </h2>
                        <p className="text-white/60 font-mono text-xs tracking-[0.2em] mt-2 italic">
                            {state.subLabel}
                        </p>
                    </div>
                </div>

                {/* Metrics Section */}
                <div className="flex flex-wrap md:flex-nowrap gap-6 items-center">
                    {/* Risk Score */}
                    <div className="px-8 py-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase mb-2">Decline Risk</span>
                        <div className="flex items-baseline gap-1">
                            <span className={`text-4xl font-black ${state.color}`}>{riskScore}</span>
                            <span className="text-sm font-bold text-white/20">/100</span>
                        </div>
                        <div className="w-24 h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${riskScore}%` }}
                                className={`h-full bg-current ${state.color}`}
                            />
                        </div>
                    </div>

                    {/* Confidence */}
                    <div className="px-8 py-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col items-center">
                        <span className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase mb-2">Confidence Level</span>
                        <div className="flex items-center gap-3">
                            <Gauge className={`w-5 h-5 ${confidence === "HIGH" ? "text-green-400" : confidence === "MEDIUM" ? "text-amber-400" : "text-red-400"}`} />
                            <span className="text-3xl font-black text-white">{confidence}</span>
                        </div>
                        <div className="flex gap-1 mt-3">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-6 h-1 rounded-full ${(confidence === "HIGH") ||
                                            (confidence === "MEDIUM" && i <= 2) ||
                                            (confidence === "LOW" && i <= 1)
                                            ? (confidence === "HIGH" ? "bg-green-400" : confidence === "MEDIUM" ? "bg-amber-400" : "bg-red-400")
                                            : "bg-white/5"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tagline */}
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">Decision driven by explainable signals & Real-time market forensics</span>
                </div>
                <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest">
                    v4.2_ENGINE_STABLE
                </div>
            </div>
        </motion.div>
    );
};
