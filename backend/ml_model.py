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
        This acts as the 'Brain' of the system.
        """
        # 1. Generate Synthetic Data (Simulating Trend Behavior)
        np.random.seed(42)
        n_samples = 1000
        
        data = pd.DataFrame({
            "engagement_velocity": np.random.uniform(-1, 1, n_samples),
            "sentiment_score": np.random.uniform(-1, 1, n_samples),
            "comment_fatigue": np.random.uniform(0, 1, n_samples),
            "influencer_ratio": np.random.uniform(0, 1, n_samples),
            "posting_change": np.random.uniform(-1, 1, n_samples),
        })

        # 2. Define Decline Logic (Ground Truth for the Proxy)
        # Decline happens if: Sentiment is bad OR Engagement drops OR Influencers leave
        data["decline"] = (
            (data["sentiment_score"] < -0.2) |
            (data["engagement_velocity"] < -0.3) |
            (data["influencer_ratio"] < 0.3)
        ).astype(int)

        X = data.drop("decline", axis=1)
        y = data["decline"]

        # 3. Create & Train Pipeline
        self.model = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(random_state=42))
        ])
        
        self.model.fit(X, y)
        print("✅ Proxy ML Model (LogisticRegression) trained successfully.")

    def predict_risk(self, signals: dict) -> dict:
        """
        Takes a dictionary of 5 signals and returns risk score + metadata.
        """
        # Ensure input order matches training
        feature_order = [
            "engagement_velocity", "sentiment_score", "comment_fatigue", 
            "influencer_ratio", "posting_change"
        ]
        
        # Create DataFrame for single prediction
        input_df = pd.DataFrame([signals], columns=feature_order)
        
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