"use client";

import { TrendData } from "@/types";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface TrendChartProps {
    data: TrendData["history"];
    color?: string;
    subtitle?: string;
}

export function TrendChart({ data, color = "#00f3ff", subtitle }: TrendChartProps) {
    return (
        <div className="w-full h-[300px] glass-panel rounded-2xl p-4 relative">
            <div className="flex justify-between items-center mb-4 pl-2">
                <h3 className="text-white/60 text-sm font-semibold tracking-wider uppercase">
                    Engagement Velocity (24h)
                </h3>
                {subtitle && (
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                        {subtitle}
                    </span>
                )}
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="timestamp"
                        stroke="#555"
                        tick={{ fill: "#666", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={3}
                    />
                    <YAxis
                        stroke="#555"
                        tick={{ fill: "#666", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "8px" }}
                        itemStyle={{ color: "#fff" }}
                        labelStyle={{ color: "#888", marginBottom: "5px" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
