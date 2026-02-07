"use client";

import { FeatherInsight } from "@/types";
import { AlertTriangle, TrendingDown, Users, Zap } from "lucide-react";

interface SignalCardProps {
    signal: FeatherInsight["signals"][0];
}

export function SignalCard({ signal }: SignalCardProps) {
    const iconMap = {
        "Engagement Drop": TrendingDown,
        "Influencer Disengagement": Users,
        "Content Saturation": Zap, // Using Zap as proxy for saturation/activity
        "Audience Fatigue": AlertTriangle,
    };

    const statusColor = {
        Normal: "text-neon-green",
        Warning: "text-yellow-400",
        Critical: "text-neon-red",
    };

    const Icon = iconMap[signal.metric] || AlertTriangle;

    return (
        <div className="glass-panel p-4 rounded-xl border-l-4 border-l-transparent hover:border-l-white/20 transition-all">
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-white/5 ${statusColor[signal.status]}`}>
                        <Icon size={18} />
                    </div>
                    <span className="font-semibold text-sm text-white/90">{signal.metric}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded full bg-white/5 ${statusColor[signal.status]}`}>
                    {signal.status}
                </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
                {signal.explanation}
            </p>
        </div>
    );
}
