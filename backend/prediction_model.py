from feather_client import feather

class DeclineModel:
    """
    Decline Prediction Module
    - Uses interpretable weights (mimicking RandomForest feature importance)
    - Input ONLY Feather-served features
    """
    def __init__(self):
        # Human-interpretable weights for features
        self.weights = {
            "fatigue_keyword_ratio": 40.0,    # High impact on decline
            "engagement_decay_rate": 30.0,   # Strong indicator
            "format_repetition_score": 15.0, # Moderate impact
            "trend_age": 10.0,               # General factor
            "engagement_per_view": -10.0,    # Higher engagement reduces risk
            "comment_sentiment_score": -15.0, # Higher sentiment reduces risk
            "interaction_quality": -20.0     # High quality interaction actively stabilizes
        }

    def predict(self, request_id):
        """Input ONLY Feather-served features"""
        features = feather.get_features(request_id)
        if not features:
            return {"declineRisk": 50, "timeWindow": "48h"}

        # Custom logic for "Evergreen" legends (e.g. Despacito)
        # If views are massive and likes are massive, it's a stable pillar
        views = features.get("viewCount", 0)
        likes = features.get("likeCount", 0)
        
        # Weighted score (0-100)
        risk_score = 50 # Base risk
        
        # Evergreen damping
        if views > 10000000 or likes > 500000:
            risk_score = 15 # Even lower for confirmed legends
        
        for feature, weight in self.weights.items():
            val = features.get(feature, 0)
            # Normalize feature values to 0-1 for common ones
            if feature == "trend_age":
                val = min(1.0, val / 30)
            elif feature == "comment_sentiment_score":
                val = (val + 1) / 2 # -1..1 to 0..1
            
            risk_score += (val * weight)
            
        risk_score = max(0, min(100, risk_score))
        
        # Decide time window
        if risk_score > 75:
            time_window = "24h"
        elif risk_score > 40:
            time_window = "48h"
        else:
            time_window = "72h"

        return {
            "declineRisk": int(risk_score),
            "timeWindow": time_window
        }

model = DeclineModel()


def map_risk_level(risk_score: float) -> str:
    if risk_score >= 85:
        return "CRITICAL"
    elif risk_score >= 70:
        return "HIGH"
    elif risk_score >= 40:
        return "MEDIUM"
    else:
        return "LOW"


def map_lifecycle_stage(risk_score: float) -> str:
    if risk_score >= 85:
        return "Zombie"
    elif risk_score >= 70:
        return "Decay"
    elif risk_score >= 40:
        return "Peak"
    else:
        return "Growth"
    