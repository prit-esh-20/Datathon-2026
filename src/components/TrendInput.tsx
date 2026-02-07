"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { TimeWindow } from "@/types";
import { cn } from "@/lib/utils";

interface TrendInputProps {
    onAnalyze: (topic: string, timeWindow: TimeWindow) => void;
    isLoading?: boolean;
}

export function TrendInput({ onAnalyze, isLoading }: TrendInputProps) {
    const [topic, setTopic] = useState("");
    const [timeWindow, setTimeWindow] = useState<TimeWindow>("48h");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onAnalyze(topic, timeWindow);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex items-center bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-2 glass">
                    <Search className="w-6 h-6 text-neon-blue ml-3 opacity-70" />
                    <input
                        type="text"
                        placeholder="Enter trend, hashtag, or YouTube video URL"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-white/30 text-lg font-medium"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !topic.trim()}
                        className="bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue px-6 py-2 rounded-lg font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none border border-neon-blue/30 shadow-[0_0_15px_rgba(0,243,255,0.1)] hover:shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                    >
                        {isLoading ? "Scanning..." : "Analyze"}
                    </button>
                </div>
            </form>

            <div className="flex justify-center gap-4">
                {(["24h", "48h", "7d"] as TimeWindow[]).map((tw) => (
                    <button
                        key={tw}
                        onClick={() => setTimeWindow(tw)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                            timeWindow === tw
                                ? "bg-neon-purple/20 border-neon-purple text-neon-purple shadow-[0_0_10px_rgba(188,19,254,0.3)]"
                                : "bg-transparent border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                        )}
                    >
                        {tw}
                    </button>
                ))}
            </div>
        </div>
    );
}
