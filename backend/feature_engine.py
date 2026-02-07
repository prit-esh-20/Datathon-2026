import pandas as pd
from textblob import TextBlob
from datetime import datetime
from feather_client import feather

class FeatureEngine:
    def __init__(self):
        self.fatigue_keywords = ["boring", "tired", "repost", "again", "old", "dying", "dead", "over", "unsubscribed"]

    def compute_features(self, metadata, comments):
        """
        Compute ONLY human-interpretable, platform-agnostic features.
        """
        features = {}
        
        # 1. basic stats
        views = metadata.get("viewCount", 1)
        likes = metadata.get("likeCount", 0)
        comment_count = metadata.get("commentCount", 0)
        published_at = metadata.get("publishedAt", "")
        
        # 2. engagement_per_view
        features["engagement_per_view"] = (likes + comment_count) / views if views > 0 else 0
        
        # 3. trend_age (days)
        if published_at:
            pub_date = datetime.strptime(published_at[:10], "%Y-%m-%d")
            features["trend_age"] = (datetime.now() - pub_date).days
        else:
            features["trend_age"] = 7
            
        # 4. Comment based features
        if comments:
            df = pd.DataFrame(comments)
            
            # sentiment
            df["sentiment"] = df["text"].apply(lambda x: TextBlob(str(x)).sentiment.polarity)
            features["comment_sentiment_score"] = df["sentiment"].mean()
            
            # fatigue_keyword_ratio
            fatigue_count = 0
            for text in df["text"]:
                if any(kw in str(text).lower() for kw in self.fatigue_keywords):
                    fatigue_count += 1
            features["fatigue_keyword_ratio"] = fatigue_count / len(comments)
        else:
            features["comment_sentiment_score"] = 0.5
            features["fatigue_keyword_ratio"] = 0.1

        # 5. Engagement velocity & decay (simulated based on counts & age if time-series not available)
        # In a real system, we'd compare against snapshots from previous days
        features["engagement_velocity"] = likes / (features["trend_age"] + 1)
        
        # simulated decay rate (higher age usually means higher decay for viral trends)
        features["engagement_decay_rate"] = 0.05 * features["trend_age"]
        
        # format_repetition_score (placeholder logic for demo)
        features["format_repetition_score"] = min(0.9, (features["trend_age"] / 30))
        
        # time_since_peak (placeholder: assume peak was midway for older trends)
        features["time_since_peak"] = (features["trend_age"] * 12) if features["trend_age"] > 3 else 0

        return features

    def process_and_register(self, request_id, metadata, comments):
        """Compute features and store them in Feather"""
        features = self.compute_features(metadata, comments)
        feather.store_features(request_id, features)
        return features
