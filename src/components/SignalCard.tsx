"use client";

import { FeatherInsight } from "@/types";
import { AlertTriangle, TrendingDown, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignalCardProps {
    signal: FeatherInsight["signals"][0];
    isPrimary?: boolean;
}

export function SignalCard({ signal, isPrimary }: SignalCardProps) {
    const iconMap: Record<string, any> = {
        "Engagement Drop": TrendingDown,
        "Influencer Disengagement": Users,
        "Content Saturation": Zap,
        "Audience Fatigue": AlertTriangle,
    };

    const statusColor = {
        Normal: "text-neon-green",
        Warning: "text-yellow-400",
        Critical: "text-neon-red",
    };

    const Icon = iconMap[signal.metric] || AlertTriangle;

    return (
        <div className={cn(
            "glass-panel p-4 rounded-xl border-l-4 transition-all relative overflow-hidden",
            isPrimary ? "border-l-neon-red bg-neon-red/5 ring-1 ring-neon-red/20 shadow-[0_0_20px_rgba(255,0,60,0.1)]" : "border-l-transparent hover:border-l-white/20"
        )}>
            {isPrimary && (
                <div className="absolute top-0 right-0 bg-neon-red text-black text-[8px] font-black px-2 py-0.5 uppercase tracking-tighter">
                    Primary Collapse Driver
                </div>
            )}
            <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg bg-white/5 ${statusColor[signal.status]}`}>
                        <Icon size={18} />
                    </div>
                    <span className="font-semibold text-sm text-white/90">{signal.metric}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-white/5 ${statusColor[signal.status]}`}>
                    {signal.status}
                </span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">
                {signal.explanation}
            </p>
        </div>
    );
}
