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
    riskScore: number;
    summary: string;
    signals: {
        metric: string;
        status: "Normal" | "Warning" | "Critical";
        explanation: string;
    }[];
    actions: string[];
    predictedDeclineDate?: string;
    // Extension fields
    primaryDriver?: string;
    explanation?: string;
    recommendedAction?: string;
    featureBreakdown?: {
        feature: string;
        contribution: number;
        value: any;
    }[];
}
