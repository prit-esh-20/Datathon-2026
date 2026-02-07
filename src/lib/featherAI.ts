import { FeatherInsight, TrendData } from "@/types";

/**
 * Simulates the "Feather.ai" engine analysis.
 * In a real app, this would call an LLM API.
 */
export async function analyzeTrend(trend: TrendData): Promise<FeatherInsight> {
    // Simulate network delay for effect
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Deterministic logic based on Saturation & Engagement for the demo
    if (trend.saturationIndex > 80 && trend.currentVelocity < trend.peakVelocity * 0.2) {
        return {
            declineRisk: "High",
            riskScore: 89,
            summary: `Decline risk is HIGH because engagement velocity dropped ${(100 - (trend.currentVelocity / trend.peakVelocity) * 100).toFixed(0)}% in 36 hours. Audience fatigue detected due to repetitive content.`,
            signals: [
                { metric: "Engagement Drop", status: "Critical", explanation: "Velocity has cratered below recovery thresholds." },
                { metric: "Content Saturation", status: "Critical", explanation: "92% of posts are reposts or low-effort variations." },
                { metric: "Audience Fatigue", status: "Warning", explanation: "Negative sentiment keywords rising in comments." },
            ],
            actions: [
                "Stop campaign spend immediately.",
                "Pivot content to 'Nostalgia' angle if continuing.",
                "Exit trend safely.",
            ],
        };
    } else if (trend.saturationIndex > 50) {
        return {
            declineRisk: "Medium",
            riskScore: 55,
            summary: "Decline risk is MEDIUM. Growth has stalled, and early signs of saturation are appearing. Monitor closely.",
            signals: [
                { metric: "Engagement Drop", status: "Warning", explanation: "Growth rate has flattened to near zero." },
                { metric: "Content Saturation", status: "Warning", explanation: "Content variety is decreasing." },
                { metric: "Audience Fatigue", status: "Normal", explanation: "Sentiment remains neutral to positive." },
            ],
            actions: [
                "Reduce output frequency.",
                "Introduce high-quality variation.",
                "Prepare exit strategy.",
            ],
        };
    } else {
        return {
            declineRisk: "Low",
            riskScore: 12,
            summary: "Decline risk is LOW. This trend is still in its growth or maturity phase with healthy engagement.",
            signals: [
                { metric: "Engagement Drop", status: "Normal", explanation: "Engagement is steady or growing." },
                { metric: "Content Saturation", status: "Normal", explanation: "Low volume of competitive content." },
                { metric: "Audience Fatigue", status: "Normal", explanation: "Audience is actively participating." },
            ],
            actions: [
                "Scale up content production.",
                "Collaborate with key influencers.",
                "Ride the wave.",
            ],
        };
    }
}
