"use client";

import { CheckCircle2 } from "lucide-react";

interface ActionListProps {
    actions: string[];
}

export function ActionList({ actions }: ActionListProps) {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-neon-blue text-sm font-semibold tracking-wider mb-4 uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></span>
                Recommended Actions
            </h3>
            <ul className="space-y-3">
                {actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-3 text-white/80 hover:text-white transition-colors group">
                        <CheckCircle2 className="w-5 h-5 text-neon-green shrink-0 mt-0.5 group-hover:drop-shadow-[0_0_5px_rgba(10,255,0,0.5)] transition-all" />
                        <span className="text-sm font-light">{action}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
