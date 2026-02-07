import { motion } from "framer-motion";

interface RadarProps {
    data: {
        label: string;
        value: number; // 0 to 100
        fullMark: number;
    }[];
}

export function DeclineRadar({ data }: RadarProps) {
    // Config
    const radius = 110; // Slightly smaller to ensure fit
    const cx = 175;     // Centered in 350
    const cy = 150;     // Centered in 300

    // Stats
    const total = data.length;
    const angleSlice = (Math.PI * 2) / total;

    // Helper to get coordinates
    const getCoordinates = (value: number, i: number) => {
        const angle = angleSlice * i - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        };
    };

    // Generate polygon points string
    const polygonPoints = data
        .map((d, i) => {
            const { x, y } = getCoordinates(d.value, i);
            return `${x},${y}`;
        })
        .join(" ");

    // Generate background webs (levels)
    const levels = [25, 50, 75, 100];

    return (
        <div className="relative w-full h-[350px] flex items-center justify-center">
            {/* Increased viewBox to prevent clipping of labels */}
            <svg width="100%" height="100%" viewBox="0 0 350 300" className="overflow-visible">
                {/* Background Grids */}
                {levels.map((level, i) => (
                    <polygon
                        key={i}
                        points={data
                            .map((_, j) => {
                                const { x, y } = getCoordinates(level, j);
                                return `${x},${y}`;
                            })
                            .join(" ")}
                        fill="transparent"
                        stroke="white"
                        strokeOpacity={0.1}
                        strokeWidth={1}
                    />
                ))}

                {/* Axis Lines */}
                {data.map((_, i) => {
                    const { x, y } = getCoordinates(100, i);
                    return (
                        <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={x}
                            y2={y}
                            stroke="white"
                            strokeOpacity={0.1}
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Data Polygon */}
                <motion.polygon
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.6, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    points={polygonPoints}
                    fill="rgba(255, 0, 60, 0.5)" // Neon Red Fill
                    stroke="#ff003c"
                    strokeWidth={2}
                />

                {/* Labels */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(115, i); // Push labels out slightly
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[10px] uppercase font-bold tracking-widest fill-white/60"
                            style={{ fontSize: '10px' }}
                        >
                            {d.label}
                        </text>
                    );
                })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
                <span className="text-neon-red text-xs font-mono bg-black/50 px-2 py-1 rounded backdrop-blur-sm border border-neon-red/30">
                    DECLINE DRIVERS
                </span>
            </div>
        </div>
    );
}
