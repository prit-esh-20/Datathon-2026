import numpy as np
from sklearn.ensemble import RandomForestClassifier
import random

class TrendRiskClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.is_trained = False
        self._train_synthetic_model()

    def _train_synthetic_model(self):
        """
        Since we don't have a massive labeled dataset of "failed trends",
        we train the model on 'Synthetic Expert Logic'.
        
        Features: 
        1. Trend Slope (Interest Velocity): -100 to 100
        2. Sentiment Score: -1.0 (Hate) to 1.0 (Love)
        3. Fatigue Score: 0 (Fresh) to 100 (Bored)
        
        Labels:
        0 = Low Risk (Growth)
        1 = Medium Risk (Stagnation)
        2 = High Risk (Collapse)
        """
        X = []
        y = []

        # Generate 1000 synthetic samples to teach the "rules"
        for _ in range(1000):
            slope = random.uniform(-50, 50)
            sentiment = random.uniform(-1, 1)
            fatigue = random.uniform(0, 100)
            
            # Helper logic to define "Ground Truth" for training
            if slope < -10 and (sentiment < -0.2 or fatigue > 60):
                label = 2 # High Risk (Crashing + Hated/Bored)
            elif slope < -2:
                label = 1 # Medium Risk (Slow decline)
            elif slope > 5 and sentiment > 0.2:
                label = 0 # Low Risk (Growing + Loved)
            elif fatigue > 80:
                label = 2 # High Risk (Even if growing, high fatigue = bubble pop)
            else:
                label = 1 # Uncertainty -> Medium

            X.append([slope, sentiment, fatigue])
            y.append(label)

        self.model.fit(X, y)
        self.is_trained = True
        print("ML Model: Random Forest Trained on 1000 synthetic patterns.")

    def predict_risk(self, slope, sentiment, fatigue):
        """
        Returns:
        - risk_score (0-100) based on class probability
        - risk_label (Low, Medium, High)
        """
        if not self.is_trained:
            return 50, "Medium"

        # Predict probabilities
        # classes are [0, 1, 2] usually
        probs = self.model.predict_proba([[slope, sentiment, fatigue]])[0]
        
        # Risk Score Calculation:
        # Weighted sum of probabilities: 
        # Low(0)*0 + Medium(1)*50 + High(2)*100
        # Actually better: P(Medium)*50 + P(High)*100
        
        # Check class order in sklearn (usually sorted)
        # 0: Low, 1: Medium, 2: High
        p_low = probs[0]
        p_med = probs[1] if len(probs) > 1 else 0
        p_high = probs[2] if len(probs) > 2 else 0

        risk_score = (p_med * 50) + (p_high * 95)
        
        if risk_score > 75:
            return int(risk_score), "High"
        elif risk_score > 35:
            return int(risk_score), "Medium"
        else:
            return int(risk_score), "Low"

# Singleton instance
trend_model = TrendRiskClassifier()
