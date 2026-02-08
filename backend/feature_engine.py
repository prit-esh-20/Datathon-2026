import pandas as pd
from textblob import TextBlob
from datetime import datetime

class FeatureEngine:
    def __init__(self):
        self.fatigue_keywords = ["boring", "tired", "repost", "again", "old", "dying", "dead", "over", "fake", "scripted"]

    def compute_signals(self, metadata: dict, comments: list) -> dict:
        """
        Converts raw YouTube/Trend data into 11 Universal Features for Feature Store (Feather).
        """
        # 1. Parse Basic Inputs
        views = metadata.get("viewCount", 1) or 1
        likes = metadata.get("likeCount", 0) or 0
        comments_count = metadata.get("commentCount", 0) or 0
        published_at = metadata.get("publishedAt", "")
        
        # 2. Compute Engagement Per View (Interaction Depth)
        engagement_per_view = (likes + comments_count) / views if views > 0 else 0
        
        # 3. Compute Engagement Velocity (Proxy: Interaction rate comparison)
        # Normalize to -1 to 1 range (heuristic)
        interaction_rate = engagement_per_view * 100
        norm_velocity = min(1.0, max(-1.0, (interaction_rate - 5.0) / 5.0))

        # 4. Compute Sentiment Score (-1 to 1)
        sentiment_score = 0.0
        if comments:
            sentiments = [TextBlob(c).sentiment.polarity for c in comments]
            sentiment_score = sum(sentiments) / len(sentiments)

        # 5. Compute Comment Fatigue (0 to 1)
        fatigue_keyword_ratio = 0.0
        format_repetition_score = 0.0
        if comments:
            fatigue_count = sum(1 for c in comments if any(k in c.lower() for k in self.fatigue_keywords))
            fatigue_keyword_ratio = fatigue_count / len(comments)
            
            # Repetition score based on duplicate content
            unique_ratio = len(set(comments)) / len(comments)
            format_repetition_score = 1.0 - unique_ratio

        # 6. Trend Age (Days)
        trend_age = 0.0
        if published_at:
            try:
                # publishedAt format: 2009-10-25T06:57:33Z
                pub_date = datetime.strptime(published_at[:10], "%Y-%m-%d")
                trend_age = (datetime.now() - pub_date).days
            except:
                trend_age = 10 # Fallback

        # 7. Simulated/Proxied Metrics for Demo
        engagement_decay_rate = 0.2 if trend_age > 30 else 0.05
        influencer_ratio = 0.6 if views < 500_000 else 0.2
        posting_change = -0.1 if trend_age > 60 else 0.0
        time_since_peak = min(24.0, trend_age * 0.5)
        
        # 8. Interaction Quality (Combined Metric)
        interaction_quality = (sentiment_score * 0.5) + (engagement_per_view * 10)
        interaction_quality = min(1.0, max(-1.0, interaction_quality))

        # Return full 11-feature vector for Feather
        return {
            "engagement_velocity": round(norm_velocity, 4),
            "sentiment_score": round(sentiment_score, 4),
            "comment_fatigue": round((fatigue_keyword_ratio + format_repetition_score)/2, 4),
            "influencer_ratio": round(influencer_ratio, 4),
            "posting_change": round(posting_change, 4),
            
            # New Feather-specific features
            "fatigue_keyword_ratio": round(fatigue_keyword_ratio, 4),
            "engagement_decay_rate": round(engagement_decay_rate, 4),
            "format_repetition_score": round(format_repetition_score, 4),
            "trend_age": float(trend_age),
            "engagement_per_view": round(engagement_per_view, 6),
            "comment_sentiment_score": round(sentiment_score, 4),
            "interaction_quality": round(interaction_quality, 4),
            "viewCount": views,
            "likeCount": likes,
            "time_since_peak": round(time_since_peak, 2)
        }

ft_engine = FeatureEngine()