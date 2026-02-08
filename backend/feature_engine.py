import pandas as pd
from textblob import TextBlob
from datetime import datetime

class FeatureEngine:
    def __init__(self):
        self.fatigue_keywords = ["boring", "tired", "repost", "again", "old", "dying", "dead", "over", "fake", "scripted"]

    def compute_signals(self, metadata: dict, comments: list) -> dict:
        """
        Converts raw YouTube/Trend data into 5 Universal ML Signals.
        """
        
        # 1. Parse Inputs
        views = metadata.get("viewCount", 1) or 1
        likes = metadata.get("likeCount", 0) or 0
        
        # 2. Compute Engagement Velocity (Proxy: Likes/Views ratio)
        # In real production, this would compare t1 vs t0. Here we use interaction rate as proxy.
        engagement_velocity = (likes / views) * 100 if views > 0 else 0
        # Normalize to -1 to 1 range for model (approximate logic for demo)
        norm_velocity = min(1.0, max(-1.0, (engagement_velocity - 2.0) / 2.0))

        # 3. Compute Sentiment Score (-1 to 1)
        sentiment_score = 0.0
        if comments:
            sentiments = [TextBlob(c).sentiment.polarity for c in comments]
            sentiment_score = sum(sentiments) / len(sentiments)

        # 4. Compute Comment Fatigue (0 to 1)
        # Ratio of duplicate/similar comments OR keyword matching
        comment_fatigue = 0.0
        if comments:
            fatigue_count = sum(1 for c in comments if any(k in c.lower() for k in self.fatigue_keywords))
            comment_fatigue = fatigue_count / len(comments)
            
            # Add repetition penalty (simple unique ratio)
            unique_ratio = len(set(comments)) / len(comments)
            repetition_score = 1.0 - unique_ratio
            comment_fatigue = (comment_fatigue + repetition_score) / 2

        # 5. Influencer Ratio (Proxy/Placeholder)
        # In full version, check if verified users commented. 
        # For now, simulate based on view count (higher views usually = lower influencer ratio/mass market)
        influencer_ratio = 0.5  # Neutral baseline
        if views > 10_000_000:
            influencer_ratio = 0.2 # Mass market, diluted
        elif views < 100_000:
            influencer_ratio = 0.7 # Niche, high influencer density

        # 6. Posting Change (Proxy/Placeholder)
        posting_change = -0.1 # Slight decay assumption for demo if no time-series data

        # Return standard signal vector
        return {
            "engagement_velocity": round(norm_velocity, 4),
            "sentiment_score": round(sentiment_score, 4),
            "comment_fatigue": round(comment_fatigue, 4),
            "influencer_ratio": round(influencer_ratio, 4),
            "posting_change": round(posting_change, 4)
        }

ft_engine = FeatureEngine()