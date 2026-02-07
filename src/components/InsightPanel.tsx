"use client";

import { FeatherInsight } from "@/types";
import { BrainCircuit, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface InsightPanelProps {
    insight: FeatherInsight;
}

export function InsightPanel({ insight }: InsightPanelProps) {
    return (
        <div className="glass-panel p-6 rounded-2xl border-neon-purple/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BrainCircuit className="w-24 h-24 text-neon-purple" />
            </div>

            <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-neon-purple animate-pulse" />
                <h3 className="text-neon-purple font-mono text-sm tracking-widest">FEATHER.AI INTELLIGENCE</h3>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <p className="text-xl md:text-2xl font-light text-white leading-relaxed drop-shadow-md">
                    &ldquo;{insight.summary}&rdquo;
                </p>
            </motion.div>

            <div className="mt-6 flex gap-2">
                {insight.riskScore > 80 && (
                    <span className="px-3 py-1 bg-neon-red/10 border border-neon-red/30 text-neon-red text-xs rounded-full">
                        Urgent Action Required
                    </span>
                )}
                <span className="px-3 py-1 bg-white/5 border border-white/10 text-white/40 text-xs rounded-full">
                    Confidence: 98.4%
                </span>
            </div>
        </div>
    );
}
