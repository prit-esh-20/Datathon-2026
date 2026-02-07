from feather_client import feather

class ExplainabilityLayer:
    def __init__(self):
        self.weights = {
            "fatigue_keyword_ratio": 40.0,
            "engagement_decay_rate": 30.0,
            "format_repetition_score": 15.0,
            "trend_age": 10.0,
            "engagement_per_view": -10.0,
            "comment_sentiment_score": -15.0
        }

    def get_feature_contributions(self, request_id):
        """Rank features by contribution to the risk score"""
        features = feather.get_features(request_id)
        contributions = []
        
        for name, weight in self.weights.items():
            val = features.get(name, 0)
            # normalize for comparison
            if name == "trend_age": val = min(1.0, val / 30)
            elif name == "comment_sentiment_score": val = (val + 1) / 2
            
            # positive weights contribute to collapse, negative weights reduce it
            # For "Primary Driver", we look at the highest positive contribution
            contribution = val * weight
            contributions.append({
                "feature": name,
                "contribution": contribution,
                "value": features.get(name, 0)
            })
            
        # Sort by absolute contribution or just positive ones? User says "Primary Collapse Driver"
        # Usually fatigue or decay
        sorted_contribs = sorted(contributions, key=lambda x: x["contribution"], reverse=True)
        
        return {
            "primaryDriver": sorted_contribs[0]["feature"],
            "featureBreakdown": sorted_contribs
        }

class GenExplanationModule:
    """Tone: business-friendly, simple, transparent"""
    def __init__(self):
        self.explanations = {
            "fatigue_keyword_ratio": "Audience fatigue is the main bottleneck. Comments indicate high repetition frustration.",
            "engagement_decay_rate": "Engagement velocity is decelerating faster than organic growth can sustain.",
            "format_repetition_score": "Content format has reached saturation. Viewers are seeking novelty elsewhere.",
            "trend_age": "Trend lifecycle is reaching late maturity. Diminishing returns expected.",
            "engagement_per_view": "Low interaction density suggests interest is passive rather than active.",
            "comment_sentiment_score": "Rising critical sentiment in the community is eroding brand trust."
        }

    def generate(self, primary_driver, risk_score):
        base = self.explanations.get(primary_driver, "Trend is showing signs of natural saturation.")
        if risk_score > 75:
            prefix = "Critical Alert: "
        elif risk_score > 40:
            prefix = "Monitor Status: "
        else:
            prefix = "Growth Outlook: "
            
        return f"{prefix}{base}"

class RecommendationEngine:
    """Map primary driver -> ONE action"""
    def __init__(self):
        self.actions = {
            "fatigue_keyword_ratio": "Inject high-novelty content or change format immediately.",
            "engagement_decay_rate": "Halt scaling efforts. Focus on core retention strategy.",
            "format_repetition_score": "Pivot to a sub-trend or hybrid format to reset audience interest.",
            "trend_age": "Prepare exit strategy. Divert budget to emerging trends.",
            "engagement_per_view": "Improve engagement loops with interactive or community-focused content.",
            "comment_sentiment_score": "Address critical feedback directly or pause promotional spend."
        }

    def get_action(self, primary_driver):
        return self.actions.get(primary_driver, "Assess impact and adjust channel allocation.")

# Global instances
xai = ExplainabilityLayer()
gen = GenExplanationModule()
recommend = RecommendationEngine()
