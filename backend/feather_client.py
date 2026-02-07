import time

class FeatherClient:
    """
    Feather API Emulation Module
    - Register all features in Feather
    - Store feature values per request
    - Serve features from Feather to the model
    Feather is the single source of truth for features.
    """
    def __init__(self):
        # In a real scenario, this would connect to a remote Feature Store (e.g., Feast, Tecton, or custom Feather service)
        self.feature_registry = {}
        self.feature_values = {}

    def register_feature(self, name, description, dtype="float"):
        """Register a feature in the Feather registry"""
        self.feature_registry[name] = {
            "description": description,
            "dtype": dtype,
            "registered_at": time.time()
        }
        print(f"Feather Registry: Registered feature '{name}'")

    def store_features(self, request_id, features):
        """Store feature values for a specific request ID"""
        if request_id not in self.feature_values:
            self.feature_values[request_id] = {}
        
        # Only store registered features
        for k, v in features.items():
            if k in self.feature_registry:
                self.feature_values[request_id][k] = v
        
        print(f"Feather Storage: Stored {len(features)} features for request '{request_id}'")

    def get_features(self, request_id):
        """Serve features from Feather for a specific request ID"""
        return self.feature_values.get(request_id, {})

# Global instance
feather = FeatherClient()

# Initialize registry with mandatory features
feather.register_feature("engagement_velocity", "Rate of change in views/likes over 24h")
feather.register_feature("engagement_decay_rate", "Rate at which engagement is decreasing")
feather.register_feature("engagement_per_view", "Ratio of likes+comments to views")
feather.register_feature("comment_sentiment_score", "Aggregated sentiment from user comments (-1 to 1)")
feather.register_feature("fatigue_keyword_ratio", "Ratio of comments containing 'boring', 'tired', 'again', etc.")
feather.register_feature("format_repetition_score", "Estimated reuse of content format/tropes")
feather.register_feature("trend_age", "Days since the trend/video was published")
feather.register_feature("time_since_peak", "Estimated time in hours since peak engagement")
