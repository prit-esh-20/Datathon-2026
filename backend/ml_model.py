import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

class TrendRiskClassifier:
    def __init__(self):
        self.model = None
        self._train_synthetic_model()

    def _train_synthetic_model(self):
        """
        Trains a Proxy ML Model (Logistic Regression) on synthetic behavioral data.
        Now uses matched features from the Feather Feature Store.
        """
        # 1. Generate Synthetic Data (Simulating Trend Behavior)
        np.random.seed(42)
        n_samples = 1500 # More samples for more features
        
        data = pd.DataFrame({
            "engagement_velocity": np.random.uniform(-1, 1, n_samples),
            "sentiment_score": np.random.uniform(-1, 1, n_samples),
            "comment_fatigue": np.random.uniform(0, 1, n_samples),
            "influencer_ratio": np.random.uniform(0, 1, n_samples),
            "posting_change": np.random.uniform(-1, 1, n_samples),
            "trend_age": np.random.uniform(1, 100, n_samples),
            "engagement_per_view": np.random.uniform(0, 0.2, n_samples),
            "interaction_quality": np.random.uniform(-1, 1, n_samples),
            "fatigue_keyword_ratio": np.random.uniform(0, 1, n_samples),
            "engagement_decay_rate": np.random.uniform(0, 0.5, n_samples),
            "format_repetition_score": np.random.uniform(0, 1, n_samples)
        })

        # 2. Define Decline Logic (Ground Truth for the Proxy)
        # Decline happens if: Sentiment is bad + high fatigue + aging trend
        data["decline"] = (
            (data["sentiment_score"] < -0.3) | 
            (data["comment_fatigue"] > 0.6) | 
            ((data["trend_age"] > 45) & (data["engagement_velocity"] < 0)) |
            (data["interaction_quality"] < -0.4)
        ).astype(int)

        X = data.drop("decline", axis=1)
        y = data["decline"]

        # 3. Create & Train Pipeline
        self.model = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(random_state=42))
        ])
        
        self.model.fit(X, y)
        print("✅ Proxy ML Model (LogisticRegression) re-trained with 11 features.")

    def predict_risk(self, signals: dict) -> dict:
        """
        Takes an expanded signal dict and returns risk score + metadata.
        """
        # Ensure input order matches training
        feature_order = [
            "engagement_velocity", "sentiment_score", "comment_fatigue", 
            "influencer_ratio", "posting_change", "trend_age",
            "engagement_per_view", "interaction_quality", "fatigue_keyword_ratio",
            "engagement_decay_rate", "format_repetition_score"
        ]
        
        # Filter and order signals
        input_data = {f: signals.get(f, 0.0) for f in feature_order}
        input_df = pd.DataFrame([input_data], columns=feature_order)
        
        # Predict probability of decline (Class 1)
        risk_prob = self.model.predict_proba(input_df)[0][1]
        risk_score = round(risk_prob * 100, 2)
        
        return {
            "risk_score": risk_score,
            "risk_level": self._map_risk_level(risk_score),
            "decline_window": self._map_decline_window(risk_score),
            "lifecycle_stage": self._map_lifecycle_stage(risk_score)
        }

    def _map_risk_level(self, score):
        if score >= 85: return "CRITICAL"
        if score >= 70: return "HIGH"
        if score >= 40: return "MEDIUM"
        return "LOW"

    def _map_decline_window(self, score):
        if score >= 85: return "< 24 Hours"
        if score >= 70: return "3-5 Days"
        if score >= 40: return "1-2 Weeks"
        return "Stable (> 30 Days)"

    def _map_lifecycle_stage(self, score):
        if score >= 85: return "Zombie"   # Dead but moving
        if score >= 70: return "Decay"    # Actively falling
        if score >= 40: return "Peak"     # Saturation point
        return "Growth"                   # Healthy

# Singleton Instance
ml_classifier = TrendRiskClassifier()