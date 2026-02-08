"""
GenAI Explainer Layer for TrendFall AI
Converts XAI outputs into executive-level business explanations using Google Gemini.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv
from typing import Dict, List, Any

load_dotenv()


class GenAIExplainer:
    """
    Decision Justification Engine™ - GenAI Component
    Translates technical XAI signals into natural language business insights.
    """
    
    def __init__(self):
        self.model = None
        self.refresh_key()
    
    def refresh_key(self):
        """Reloads the API key and re-initializes the model."""
        load_dotenv(override=True)
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key or api_key == "your_gemini_api_key_here":
            print("[WARN] GEMINI_API_KEY not configured. Using fallback text generation.")
            self.model = None
        else:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                print(f"[OK] Gemini AI (1.5-Flash) initialized with key: {api_key[:5]}...{api_key[-5:]}")
            except Exception as e:
                print(f"[WARN] Failed to initialize Gemini: {e}")
                self.model = None
    
    def generate_executive_summary(
        self, 
        risk_score: float, 
        shap_drivers: List[Dict[str, Any]], 
        lifecycle_stage: str,
        is_cringe_point: bool
    ) -> str:
        """
        Generates a 2-3 sentence executive summary explaining the decline risk.
        
        Args:
            risk_score: Decline risk score (0-100)
            shap_drivers: SHAP feature attributions with business labels
            lifecycle_stage: Birth/Growth/Peak/Decay/Zombie
            is_cringe_point: Whether reputation damage is imminent
        
        Returns:
            Natural language explanation
        """
        
        # Prepare context for LLM
        drivers_text = ", ".join([f"{d['label']} (impact: {d['contribution']:.1%})" for d in shap_drivers[:3]])
        
        prompt = f"""You are an AI analyst for marketing executives. Generate a clear, professional 2-3 sentence summary.

CONTEXT:
- Trend Decline Risk: {risk_score:.0f}/100
- Lifecycle Stage: {lifecycle_stage}
- Critical Reputation Risk: {'YES' if is_cringe_point else 'NO'}
- Primary Drivers: {drivers_text}

TASK: Explain WHY this trend is at risk and WHEN decision-makers should act.

RULES:
- Be concise and authoritative
- Focus on business impact, not technical details
- Suggest timing (e.g., "within 48 hours", "this week")
- Use phrases like "driven by", "indicated by", "suggests"
- NO jargon, NO hedge words like "maybe" or "possibly"

SUMMARY:"""

        if self.model:
            try:
                response = self.model.generate_content(prompt)
                return response.text.strip()
            except Exception as e:
                print(f"⚠️ GenAI Error: {e}. Using fallback.")
                return self._fallback_summary(risk_score, shap_drivers, lifecycle_stage, is_cringe_point)
        else:
            return self._fallback_summary(risk_score, shap_drivers, lifecycle_stage, is_cringe_point)
    
    def _fallback_summary(
        self, 
        risk_score: float, 
        shap_drivers: List[Dict[str, Any]], 
        lifecycle_stage: str,
        is_cringe_point: bool
    ) -> str:
        """Enhanced rule-based summary when GenAI is unavailable."""
        
        top_driver = shap_drivers[0]['label'] if shap_drivers else "signal degradation"
        
        if risk_score >= 85:
            urgency = "immediate action required within 24 hours"
        elif risk_score >= 70:
            urgency = "exit strategy should be prepared within 3-5 days"
        elif risk_score >= 40:
            urgency = "content pivot recommended within 1-2 weeks"
        else:
            urgency = "monitoring recommended, trend remains stable"
        
        cringe_warning = " Campaign continuation risks brand reputation damage." if is_cringe_point else ""
        
        return f"This trend is in {lifecycle_stage} phase with {risk_score:.0f}% decline risk, primarily driven by {top_driver}.{cringe_warning} Analysis indicates {urgency}."
    
    def generate_recommended_action(self, risk_score: float, roi_savings: float, is_cringe_point: bool) -> str:
        """
        Generates specific, actionable recommendation.
        
        Returns:
            Action statement (e.g., "Stop Campaign Immediately")
        """
        
        if risk_score >= 85 or is_cringe_point:
            return f"Stop Campaign Immediately (Est. Savings: ₹{roi_savings:,.0f})"
        elif risk_score >= 70:
            return "Prepare Exit Strategy - Reduce Spend by 70%"
        elif risk_score >= 40:
            return "Pivot Content Strategy - Test Alternative Formats"
        else:
            return "Scale Investment - Trend is Healthy"


# Global instance
genai_explainer = GenAIExplainer()
