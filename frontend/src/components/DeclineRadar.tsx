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
    const radius = 90;  // Reduced to give more space for labels
    const cx = 200;     // Perfectly centered in 400
    const cy = 175;     // Perfectly centered in 350

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
            <svg width="100%" height="100%" viewBox="0 0 400 350" className="overflow-visible">
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
                    fill="rgba(255, 0, 60, 0.4)" // Neon Red Fill
                    stroke="#ff003c"
                    strokeWidth={2}
                />

                {/* Labels */}
                {data.map((d, i) => {
                    const { x, y } = getCoordinates(120, i); // Push labels out further
                    const words = d.label.split(' ');
                    const lines = [];
                    let currentLine = "";

                    // Simple word wrap for SVG
                    words.forEach(word => {
                        if ((currentLine + word).length > 15) {
                            lines.push(currentLine);
                            currentLine = word + " ";
                        } else {
                            currentLine += word + " ";
                        }
                    });
                    lines.push(currentLine);

                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-[9px] uppercase font-black tracking-widest fill-white/80"
                        >
                            {lines.map((line, lineIdx) => (
                                <tspan
                                    key={lineIdx}
                                    x={x}
                                    dy={lineIdx === 0 ? -(lines.length - 1) * 5 : 12}
                                >
                                    {line.trim()}
                                </tspan>
                            ))}
                        </text>
                    );
                })}
            </svg>

            {/* Center Label */}
            <div className="absolute inset-x-0 bottom-4 flex justify-center pointer-events-none">
                <span className="text-neon-red text-[10px] font-black uppercase tracking-[0.3em] bg-black/60 px-3 py-1.5 rounded-sm border border-neon-red/30 backdrop-blur-md">
                    Decline Drivers
                </span>
            </div>
        </div>
    );
}
