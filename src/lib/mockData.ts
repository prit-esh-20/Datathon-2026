import { TrendData } from "@/types";

export const MOCK_TRENDS: Record<string, TrendData> = {
    "skibidi-toilet": {
        id: "1",
        topic: "Skibidi Toilet",
        category: "Meme",
        currentVelocity: 120,
        peakVelocity: 5000,
        engagementScore: 35,
        saturationIndex: 92,
        history: Array.from({ length: 24 }).map((_, i) => ({
            timestamp: `${i}h ago`,
            value: 5000 - i * 150 - Math.random() * 500, // Downward trend
        })).reverse(),
    },
    "ai-agents": {
        id: "2",
        topic: "AI Agents",
        category: "Topic",
        currentVelocity: 850,
        peakVelocity: 900,
        engagementScore: 88,
        saturationIndex: 40,
        history: Array.from({ length: 24 }).map((_, i) => ({
            timestamp: `${i}h ago`,
            value: 200 + i * 30 + Math.random() * 50, // Upward trend
        })).reverse(),
    },
    "grimace-shake": {
        id: "3",
        topic: "Grimace Shake",
        category: "Meme",
        currentVelocity: 45,
        peakVelocity: 8000,
        engagementScore: 12,
        saturationIndex: 98,
        history: Array.from({ length: 24 }).map((_, i) => ({
            timestamp: `${i}h ago`,
            value: 300 - i * 10, // Flatline / Dead
        })).reverse(),
    },
};

export const MOCK_INSIGHT: any = {
    declineRisk: "High",
    riskScore: 85,
    summary: "Feather.ai detected high volatility in this trend (Offline Mode).",
    signals: [
        { metric: "Engagement Drop", status: "Critical", explanation: "Velocity has cratered below recovery thresholds." },
        { metric: "Content Saturation", status: "Critical", explanation: "92% of posts are reposts or low-effort variations." },
    ],
    actions: ["Stop campaign spend immediately", "Pivot strategy", "Exit trend"],
};
