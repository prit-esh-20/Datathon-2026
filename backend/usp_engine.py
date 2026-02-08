"""
USP Engine for TrendFall AI
Implements the 4 Secondary USPs:
1. Cringe Point Detection (Early Exit Advantage)
2. ROI Calculator (Explainable ROI Engine)
3. Lifecycle Classifier (Trend Lifecycle Governance)
4. Decision Justification Formatter
"""

from typing import Dict, Any, List


class USPEngine:
    """
    Contains all specialized USP logic for Decision Justification Engine™
    """
    
    def __init__(self):
        # Default CPM for ROI calculations (Cost Per 1000 impressions in ₹)
        self.default_cpm = 500
        self.default_daily_impressions = 50000
    
    def detect_cringe_point(self, signals: Dict[str, float], risk_score: float) -> Dict[str, Any]:
        """
        🔥 USP #1: Cringe Point™ Detection (Early Exit Advantage)
        
        Detects when a trend is still VISIBLE but continuing is DAMAGING.
        This is different from decline detection - it's reputation risk detection.
        
        Logic:
        - High engagement BUT negative sentiment = Cringe Point
        - People are watching/talking, but negatively
        
        Returns:
            {
                "is_cringe_point": bool,
                "explanation": str,
                "severity": "low" | "medium" | "high"
            }
        """
        
        engagement = signals.get("engagement_velocity", 0)
        sentiment = signals.get("sentiment_score", 0)
        fatigue = signals.get("comment_fatigue", 0)
        
        # Cringe Point Logic:
        # Scenario: Engagement is high (people watching) BUT sentiment is very negative
        # OR fatigue is high (content feels forced/overdone)
        
        is_cringe = False
        severity = "low"
        explanation = "Trend reputation is stable."
        
        # Critical Cringe: High visibility + Very negative sentiment
        if engagement > 0.3 and sentiment < -0.4:
            is_cringe = True
            severity = "high"
            explanation = "Audience is actively engaged BUT sentiment is hostile. Continuing risks brand credibility."
        
        # Medium Cringe: Content fatigue despite traffic
        elif fatigue > 0.6 and risk_score > 60:
            is_cringe = True
            severity = "medium"
            explanation = "Content saturation detected. Audience perceives this trend as 'overdone' or 'cringe'."
        
        # Low Cringe: Subtle reputation erosion
        elif sentiment < -0.3 and risk_score > 50:
            is_cringe = True
            severity = "low"
            explanation = "Negative sentiment building. Early signs of audience backlash."
        
        return {
            "is_cringe_point": is_cringe,
            "explanation": explanation,
            "severity": severity
        }
    
    def calculate_roi(
        self, 
        risk_score: float, 
        decline_window_days: int,
        daily_budget: float = None
    ) -> Dict[str, Any]:
        """
        💰 USP #2: Explainable ROI Engine
        
        Converts XAI signals into financial impact.
        Calculates money saved by exiting early.
        
        Formula:
        - If risk > threshold, campaign should stop
        - Savings = (days saved) × (daily spend) × (probability of waste)
        
        Args:
            risk_score: 0-100 decline risk
            decline_window_days: Days until predicted collapse
            daily_budget: Optional custom budget (₹/day)
        
        Returns:
            {
                "estimated_savings": float (in ₹),
                "calculation_basis": str,
                "confidence": float
            }
        """
        
        # Default daily budget calculation
        if not daily_budget:
            # Assume CPM of ₹500 and 50k impressions/day
            daily_budget = (self.default_cpm / 1000) * self.default_daily_impressions
        
        # Convert risk score to waste probability
        waste_probability = risk_score / 100.0
        
        # Days that would be wasted if campaign continues
        days_at_risk = decline_window_days if decline_window_days > 0 else 1
        
        # Calculate potential savings
        total_at_risk = daily_budget * days_at_risk
        estimated_savings = total_at_risk * waste_probability
        
        # Determine calculation basis
        if risk_score >= 85:
            basis = f"Critical risk detected. Continuing {days_at_risk} more days would waste {waste_probability:.0%} of spend."
        elif risk_score >= 70:
            basis = f"High decline probability. {days_at_risk}-day exposure carries {waste_probability:.0%} waste risk."
        elif risk_score >= 40:
            basis = f"Medium risk. Partial budget optimization recommended over {days_at_risk} days."
        else:
            basis = "Low risk. Campaign ROI is protected."
        
        # Confidence based on data quality (simplified for demo)
        confidence = 0.92 if risk_score > 60 else 0.85
        
        return {
            "estimated_savings": round(estimated_savings, 2),
            "calculation_basis": basis,
            "confidence": confidence,
            "daily_budget_assumed": round(daily_budget, 2),
            "days_at_risk": days_at_risk
        }
    
    def classify_lifecycle(self, risk_score: float, signals: Dict[str, float]) -> Dict[str, Any]:
        """
        🔄 USP #3: Trend Lifecycle Governance (Birth → Zombie)
        
        Classifies trends into 5 lifecycle stages:
        - Birth: New, growing
        - Growth: Accelerating
        - Peak: Maximum saturation
        - Decay: Active decline
        - Zombie: Still visible, but no value (CRITICAL INSIGHT)
        
        Returns:
            {
                "stage": str,
                "description": str,
                "strategic_advice": str
            }
        """
        
        engagement = signals.get("engagement_velocity", 0)
        sentiment = signals.get("sentiment_score", 0)
        
        # Lifecycle Logic
        if risk_score >= 85:
            # Zombie: High visibility but hollow engagement
            stage = "Zombie"
            description = "Trend is visible but carries no strategic value. Engagement is artificial or low-quality."
            advice = "Immediate exit. This trend damages more than it benefits."
        
        elif risk_score >= 70:
            # Decay: Active falling
            stage = "Decay"
            description = "Trend is actively declining. Audience interest is waning."
            advice = "Prepare exit within 3-5 days. Salvage remaining value."
        
        elif risk_score >= 40:
            # Peak: Saturation point
            stage = "Peak"
            description = "Trend has reached maximum saturation. Further growth unlikely."
            advice = "Harvest current value but avoid additional investment."
        
        elif engagement > 0.3 and sentiment > 0.2:
            # Growth: Healthy acceleration
            stage = "Growth"
            description = "Trend is accelerating with positive momentum."
            advice = "Scale investment strategically. High ROI window."
        
        else:
            # Birth: New/emerging
            stage = "Birth"
            description = "Trend is emerging. Early indicators are forming."
            advice = "Monitor closely. Test small campaigns before committing."
        
        return {
            "stage": stage,
            "description": description,
            "strategic_advice": advice
        }
    
    def format_decision_justification(
        self,
        risk_score: float,
        shap_drivers: List[Dict[str, Any]],
        genai_summary: str,
        cringe_result: Dict[str, Any],
        roi_result: Dict[str, Any],
        lifecycle_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        🎯 USP #4: Decision Justification Formatter
        
        Combines all USPs into a single, auditable decision record.
        This is what makes the system a "Decision Justification Engine™"
        
        Returns:
            Comprehensive justification object for enterprise use
        """
        
        # Build evidence chain
        evidence = {
            "technical_signals": shap_drivers[:3],
            "business_interpretation": genai_summary,
            "reputation_risk": {
                "is_critical": cringe_result["is_cringe_point"],
                "severity": cringe_result["severity"],
                "explanation": cringe_result["explanation"]
            },
            "financial_impact": {
                "estimated_savings": roi_result["estimated_savings"],
                "confidence": roi_result["confidence"],
                "basis": roi_result["calculation_basis"]
            },
            "lifecycle_context": {
                "stage": lifecycle_result["stage"],
                "strategic_advice": lifecycle_result["strategic_advice"]
            }
        }
        
        # Determine final recommendation
        if risk_score >= 85 or cringe_result["is_cringe_point"]:
            recommendation = "STOP CAMPAIGN IMMEDIATELY"
            justification = f"Decision supported by: {risk_score:.0f}% decline risk, {cringe_result['severity']} reputation risk, and ₹{roi_result['estimated_savings']:,.0f} potential savings."
        elif risk_score >= 70:
            recommendation = "PREPARE EXIT STRATEGY"
            justification = f"High decline probability ({risk_score:.0f}%) indicates trend is in {lifecycle_result['stage']} phase. Exit within 3-5 days to optimize ROI."
        elif risk_score >= 40:
            recommendation = "PIVOT CONTENT STRATEGY"
            justification = f"Moderate risk detected. Trend is at {lifecycle_result['stage']}. Adjust creative approach to extend lifecycle."
        else:
            recommendation = "SCALE STRATEGICALLY"
            justification = f"Trend shows healthy indicators ({100-risk_score:.0f}% stability). {lifecycle_result['stage']} phase presents growth opportunity."
        
        return {
            "recommendation": recommendation,
            "justification": justification,
            "evidence": evidence,
            "confidence_score": roi_result["confidence"],
            "decision_timestamp": "real-time"  # In production, use actual timestamp
        }


# Global instance
usp_engine = USPEngine()
