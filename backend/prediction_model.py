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
            "comment_sentiment_score": -15.0  # Higher sentiment reduces risk
        }

    def predict(self, request_id):
        """Input ONLY Feather-served features"""
        features = feather.get_features(request_id)
        if not features:
            return {"declineRisk": 50, "timeWindow": "48h"}

        # Weighted score (0-100)
        risk_score = 50 # Base risk
        
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
