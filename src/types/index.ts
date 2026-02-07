export type TimeWindow = "24h" | "48h" | "7d";

export interface TrendData {
    id: string;
    topic: string; // The hashtag or meme
    category: "Hashtag" | "Meme" | "Topic";
    currentVelocity: number; // e.g., posts per hour
    peakVelocity: number;
    engagementScore: number; // 0-100
    saturationIndex: number; // 0-100 (high means saturated)
    history: {
        timestamp: string;
        value: number; // Engagement metric
    }[];
}

export interface FeatherInsight {
    declineRisk: "Low" | "Medium" | "High";
    riskScore: number; // 0-100
    summary: string; // "Decline risk is HIGH because..."
    signals: {
        metric: "Engagement Drop" | "Influencer Disengagement" | "Content Saturation" | "Audience Fatigue";
        status: "Normal" | "Warning" | "Critical";
        explanation: string;
    }[];
    actions: string[]; // Recommended actions
    predictedDeclineDate?: string; // ISO date
}
