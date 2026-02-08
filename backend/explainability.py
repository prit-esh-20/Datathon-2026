"""
Enhanced Explainability Layer with SHAP Integration
Provides both mathematical (SHAP) and business (rule-based) explanations.
"""

import shap
import numpy as np
from typing import Dict, List, Any


class ExplainabilityLayer:
    """
    Decision Justification Engine™ - XAI Component
    Combines SHAP (mathematical) with business logic (interpretable).
    """
    
    def __init__(self):
        # Maps technical signals to business problems
        self.business_map = {
            "sentiment_score": "Audience sentiment has turned negative",
            "engagement_velocity": "Engagement momentum is rapidly slowing",
            "comment_fatigue": "Content saturation detected (Audience Fatigue)",
            "influencer_ratio": "Key creators are disengaging from this trend",
            "posting_change": "Posting frequency has dropped significantly"
        }
        
        # SHAP explainer will be initialized when ML model is passed
        self.shap_explainer = None
    
    def initialize_shap_explainer(self, ml_model):
        """
        Initialize SHAP explainer with the trained ML model.
        Called once when the system starts.
        """
        try:
            # Use KernelExplainer for compatibility with sklearn pipelines
            # We'll create a small background dataset for SHAP
            background_data = np.random.uniform(-1, 1, (100, 5))
            
            # Define prediction function for SHAP
            def predict_fn(X):
                import pandas as pd
                feature_order = [
                    "engagement_velocity", "sentiment_score", "comment_fatigue",
                    "influencer_ratio", "posting_change"
                ]
                df = pd.DataFrame(X, columns=feature_order)
                return ml_model.predict_proba(df)[:, 1]
            
            self.shap_explainer = shap.KernelExplainer(predict_fn, background_data)
            print("✅ SHAP Explainer initialized successfully")
        except Exception as e:
            print(f"⚠️ SHAP initialization failed: {e}. Using rule-based XAI only.")
            self.shap_explainer = None
    
    def generate_shap_explanation(self, signals: Dict[str, float], ml_model) -> List[Dict[str, Any]]:
        """
        Generate SHAP-based feature attribution.
        
        Returns:
            List of drivers with SHAP values (contribution to prediction)
        """
        
        # Initialize SHAP if not done
        if self.shap_explainer is None and ml_model is not None:
            self.initialize_shap_explainer(ml_model)
        
        # If SHAP is unavailable, return empty (fallback to rule-based)
        if self.shap_explainer is None:
            return []
        
        try:
            # Convert signals dict to numpy array in correct order
            feature_order = [
                "engagement_velocity", "sentiment_score", "comment_fatigue",
                "influencer_ratio", "posting_change"
            ]
            signal_array = np.array([[signals.get(f, 0) for f in feature_order]])
            
            # Compute SHAP values
            shap_values = self.shap_explainer.shap_values(signal_array)
            
            # Convert to business-friendly format
            drivers = []
            for idx, feature_name in enumerate(feature_order):
                contribution = float(shap_values[0][idx])
                # Only include significant contributors
                if abs(contribution) > 0.01:
                    drivers.append({
                        "feature": feature_name,
                        "label": self.business_map.get(feature_name, feature_name),
                        "shap_value": round(contribution, 4),
                        "contribution": abs(contribution),  # For sorting
                        "direction": "negative" if contribution > 0 else "positive"  # Positive SHAP = higher risk
                    })
            
            # Sort by absolute contribution
            drivers.sort(key=lambda x: x["contribution"], reverse=True)
            
            return drivers
        
        except Exception as e:
            print(f"⚠️ SHAP computation error: {e}")
            return []
    
    def generate_decision_justification(
        self, 
        signals: dict, 
        risk_score: float,
        ml_model=None
    ) -> Dict[str, Any]:
        """
        Returns the 'WHY' behind the risk score.
        Combines SHAP (if available) with rule-based logic.
        
        Args:
            signals: Feature dictionary
            risk_score: ML prediction (0-100)
            ml_model: Optional ML model for SHAP
        
        Returns:
            Comprehensive explanation with SHAP + business reasoning
        """
        
        # 1. Try SHAP-based explanation first
        shap_drivers = self.generate_shap_explanation(signals, ml_model)
        
        # 2. Generate rule-based reasons (always available as fallback)
        rule_reasons = []
        
        if signals.get("sentiment_score", 0) < -0.2:
            rule_reasons.append(self.business_map["sentiment_score"])
        
        if signals.get("engagement_velocity", 0) < -0.2:
            rule_reasons.append(self.business_map["engagement_velocity"])
            
        if signals.get("comment_fatigue", 0) > 0.4:
            rule_reasons.append(self.business_map["comment_fatigue"])
            
        if signals.get("influencer_ratio", 0) < 0.3:
            rule_reasons.append(self.business_map["influencer_ratio"])
        
        # Fallback if no specific triggers
        if not rule_reasons and risk_score > 50:
            rule_reasons.append("Combined signal degradation detected across multiple metrics")
        
        # 3. Determine Primary Driver
        if shap_drivers:
            primary_driver = shap_drivers[0]["label"]
            top_signals = [d["label"] for d in shap_drivers[:3]]
        else:
            primary_driver = rule_reasons[0] if rule_reasons else "Stable Trend Dynamics"
            top_signals = rule_reasons[:3]
        
        # 4. Determine Recommended Action
        action = self._recommend_action(risk_score)
        
        # 5. Construct natural language summary
        summary_text = self._build_summary(risk_score, primary_driver, top_signals, shap_drivers)
        
        return {
            "primary_driver": primary_driver,
            "xai_explanation": summary_text,
            "recommended_action": action,
            "top_signals": top_signals,
            "shap_drivers": shap_drivers,  # NEW: Include SHAP data
            "explanation_method": "shap" if shap_drivers else "rule-based"
        }
    
    def _recommend_action(self, risk_score: float) -> str:
        """Determine recommended action based on risk level."""
        if risk_score > 85:
            return "Immediate Exit / Stop Spend"
        elif risk_score > 70:
            return "Prepare Exit Strategy"
        elif risk_score > 40:
            return "Pivot Content Strategy"
        else:
            return "Scale Campaign / Increase Spend"
    
    def _build_summary(
        self, 
        risk_score: float, 
        primary_driver: str, 
        top_signals: List[str],
        shap_drivers: List[Dict[str, Any]]
    ) -> str:
        """Build natural language explanation."""
        
        summary = "Analysis complete. "
        
        if risk_score > 50:
            if shap_drivers:
                # Use SHAP-informed summary
                top_contributor = shap_drivers[0]
                summary += f"Mathematical analysis identifies {primary_driver.lower()} as the primary risk factor "
                summary += f"(SHAP contribution: {abs(top_contributor['shap_value']):.2f}). "
            else:
                summary += f"Primary risk factor is {primary_driver.lower()}. "
            
            if len(top_signals) > 1:
                summary += f"Additional factors include: {', '.join(top_signals[1:]).lower()}."
        else:
            summary += "Trend appears stable with healthy engagement metrics."
        
        return summary


# Global Instance
xai_layer = ExplainabilityLayer()
