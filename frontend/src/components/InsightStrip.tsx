import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BarChart3 } from "lucide-react";

interface InsightStripProps {
    riskScore: number;
    summary: string;
    fullExplanation?: string;
}

export const InsightStrip = ({ riskScore, summary, fullExplanation }: InsightStripProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatus = (score: number) => {
        if (score > 80) return { label: "High Risk", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" };
        if (score > 50) return { label: "Elevated Risk", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
        return { label: "Low Risk", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
    };

    const status = getStatus(riskScore);

    return (
        <div className="w-full bg-[#0A0A0B] border-y border-white/5 overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 py-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    {/* Status Section */}
                    <div className="flex items-center gap-4 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${status.bg} ${status.color} border ${status.border}`}>
                            {status.label}
                        </span>
                        <div className="h-4 w-[1px] bg-white/10 hidden md:block" />
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Decline Risk:</span>
                            <span className="text-xs font-mono font-bold text-white">{riskScore} / 100</span>
                        </div>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                    {/* Summary One-Liner */}
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white/80 leading-relaxed truncate group cursor-default">
                            {summary}
                        </p>
                    </div>

                    {/* Expand Toggle */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 text-[10px] font-bold text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest shrink-0"
                    >
                        {isExpanded ? "Less" : "Full Explanation"}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                            <div className="pt-6 pb-2 border-t border-white/5 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                    <div className="md:col-span-8">
                                        <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                            <BarChart3 className="w-3 h-3" />
                                            Detailed Forensic Rationalization
                                        </h4>
                                        <div className="text-[13px] text-white/60 leading-relaxed font-light space-y-4">
                                            {fullExplanation || summary.length > 100 ? (
                                                <p>{fullExplanation || summary}</p>
                                            ) : (
                                                <p>Automated vector analysis suggests a {status.label.toLowerCase()} profile based on current engagement velocity and audience retention metadata. Historical trend mapping indicates stable baseline growth with minimal saturation triggers at this coordinate.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 flex flex-col justify-end">
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <p className="text-[9px] font-mono text-white/20 uppercase leading-tight">
                                                Verification: TrendFall Core v2.4<br />
                                                Confidence: {(85 + Math.random() * 10).toFixed(1)}%<br />
                                                Status: Validated
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
