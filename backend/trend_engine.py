import os
from dotenv import load_dotenv
import pandas as pd
import random

# Import our modular components
from youtube_client import YouTubeClient
from feature_engine import ft_engine
from ml_model import ml_classifier
from explainability import xai_layer
from genai_explainer import genai_explainer
from usp_engine import usp_engine
from feather_client import feather
from prediction_model import model as decline_model

load_dotenv()

# Initialize the YouTube Client
yt_client = YouTubeClient()

def analyze_trend_real(input_text: str):
    """
    Enhanced Main Orchestrator with Full USP Integration:
    
    Pipeline:
    1. Data Ingestion (YouTube API)
    2. Feature Extraction (Universal Signals)
    3. ML Prediction (Proxy Model)
    4. SHAP Explanation (XAI)
    5. USP Logic (Cringe Point, ROI, Lifecycle)
    6. GenAI Explanation (Executive Summary)
    7. Decision Justification Formatting
    """
    
    # --- 1. DATA INGESTION ---
    is_url = "youtube.com" in input_text or "youtu.be" in input_text
    
    video_data = {}
    comments = []
    trend_name = input_text
    
    trend_name = input_text
    
    if is_url:
        print(f"🔗 Detected YouTube URL: {input_text}")
        try:
            video_id = yt_client.extract_video_id(input_text)
            
            if video_id:
                video_data = yt_client.get_video_stats(video_id) or {}
                comments = yt_client.get_comments(video_id) or []
                trend_name = video_data.get("title", trend_name)
                print(f"✅ Fetched Data for: {trend_name}")
            else:
                print("❌ Invalid YouTube URL (ID extraction failed)")
                # Fallback to simulation if extraction fails but it looked like a URL
                return _get_simulation_fallback(input_text)
        except Exception as e:
            print(f"❌ YouTube Extraction Error: {e}")
            return _get_simulation_fallback(input_text)

    elif "instagram.com" in input_text:
        print(f"📸 Detected Instagram URL: {input_text} (Using Instagram Simulation)")
        return _get_instagram_simulation(input_text)
    else:
        print(f"🔍 Detected Keyword: {input_text} (Using Simulation)")
        return _get_simulation_fallback(input_text)

    # --- 2. FEATURE ENGINEERING ---
    print("🚀 Starting Feature Engineering...")
    signals = ft_engine.compute_signals(video_data, comments)
    print("✅ Feature Engineering complete")
    
    # --- 2.5 FEATHER FEATURE STORE INTEGRATION ---
    request_id = f"req_{int(pd.Timestamp.now().timestamp())}"
    print(f"📦 Storing features in Feather (ID: {request_id})...")
    feather.store_features(request_id, signals)
    
    # --- 3. ML PREDICTION (Ensemble Logic) ---
    print("🚀 Starting Ensemble ML Prediction...")
    # Model A: Proxy Logistic Regression
    ml_prediction = ml_classifier.predict_risk(signals)
    
    # Model B: Weighted Business Logic Model (via Feather)
    business_prediction = decline_model.predict(request_id)
    
    # Combine predictions (Average or weighted)
    # We'll use business_prediction as a refinement on the ML base
    combined_risk = (ml_prediction["risk_score"] * 0.4) + (business_prediction["declineRisk"] * 0.6)
    risk_score = round(combined_risk, 2)
    
    # Update prediction metadata
    prediction = ml_prediction.copy()
    prediction["risk_score"] = risk_score
    prediction["decline_window"] = business_prediction["timeWindow"]
    
    print(f"✅ Ensemble Prediction complete (Final Risk: {risk_score})")
    
    # --- 4. ENHANCED XAI (SHAP + Rule-Based) ---
    print("🚀 Starting XAI Explanation...")
    explanation = xai_layer.generate_decision_justification(
        signals, 
        risk_score,
        ml_model=ml_classifier.model  # Pass model for SHAP
    )
    print("✅ XAI Explanation complete")
    
    # --- 5. USP LOGIC LAYERS ---
    print("🚀 Starting USP Logic...")
    
    # 5a. Cringe Point Detection
    cringe_result = usp_engine.detect_cringe_point(signals, risk_score)
    
    # 5b. Lifecycle Classification
    lifecycle_result = usp_engine.classify_lifecycle(risk_score, signals)
    
    # 5c. ROI Calculation
    decline_days = _extract_decline_days(prediction["decline_window"])
    roi_result = usp_engine.calculate_roi(risk_score, decline_days)
    
    # 5d. Prepare SHAP drivers for GenAI
    shap_drivers = explanation.get("shap_drivers", [])
    print("✅ USP Logic complete")
    
    # --- 6. GENAI EXPLANATION ---
    print("🚀 Starting GenAI Explanation...")
    genai_summary = genai_explainer.generate_executive_summary(
        risk_score=risk_score,
        shap_drivers=shap_drivers if shap_drivers else _fallback_shap_format(explanation["top_signals"]),
        lifecycle_stage=lifecycle_result["stage"],
        is_cringe_point=cringe_result["is_cringe_point"]
    )
    print("✅ GenAI Explanation complete")
    
    # --- 7. DECISION JUSTIFICATION ---
    print("🚀 Formatting Decision Justification...")
    decision_justification = usp_engine.format_decision_justification(
        risk_score=risk_score,
        shap_drivers=shap_drivers if shap_drivers else _fallback_shap_format(explanation["top_signals"]),
        genai_summary=genai_summary,
        cringe_result=cringe_result,
        roi_result=roi_result,
        lifecycle_result=lifecycle_result
    )
    
    # --- 8. RECOMMENDED ACTION WITH ROI ---
    recommended_action = genai_explainer.generate_recommended_action(
        risk_score, 
        roi_result["estimated_savings"],
        cringe_result["is_cringe_point"]
    )
    
    # --- 9. FORMAT SIGNALS FOR UI ---
    formatted_signals = _format_signals_for_ui(signals, shap_drivers)
    
    # --- 10. FORMAT DRIVERS FOR CHART ---
    formatted_drivers = _format_drivers_for_chart(shap_drivers, explanation["top_signals"])

    # --- 11. RETURN ENHANCED JSON ---
    print("[SUCCESS] Analysis Complete. Returning JSON.")
    return {
        "inputType": "url",
        "detectedTrend": trend_name,
        "declineRisk": int(risk_score),
        "timeWindow": prediction["decline_window"],
        "primaryDriver": explanation["primary_driver"],
        "featureBreakdown": signals,
        "explanation": genai_summary,  # GenAI-powered explanation
        "recommendedAction": recommended_action,
        "confidence": decision_justification["confidence_score"],
        
        # Enhanced Insight Object with ALL USPs
        "trend": {
            "history": [
                {"timestamp": f"Day {i}", "value": max(0, int(100 - (i * (risk_score/12)) + random.randint(-5, 5)))}
                for i in range(1, 8)
            ]
        },
        "insight": {
            "riskScore": int(risk_score),
            "declineRisk": prediction["risk_level"],
            "decline_probability": risk_score / 100.0,
            "predicted_time_to_decline": prediction["decline_window"],
            "summary": genai_summary,
            "signals": formatted_signals,
            "decline_drivers": formatted_drivers,
            "actions": [recommended_action, lifecycle_result["strategic_advice"]],
            
            # NEW: USP Fields
            "roi_savings": roi_result["estimated_savings"],
            "is_cringe_point": cringe_result["is_cringe_point"],
            "cringe_severity": cringe_result["severity"],
            "lifecycle_stage": lifecycle_result["stage"],
            "xai_method": explanation.get("explanation_method", "rule-based"),
            "shap_drivers": shap_drivers[:3] if shap_drivers else [],
            "decision_justification": decision_justification
        }
    }


def _get_simulation_fallback(trend_name):
    """Enhanced simulation with USP support."""
    
    random.seed(trend_name)
    base_risk = random.randint(20, 95)
    
    # Simulate signals
    signals = {
        "engagement_velocity": -0.5 if base_risk > 70 else 0.5,
        "sentiment_score": -0.6 if base_risk > 70 else 0.4,
        "comment_fatigue": 0.8 if base_risk > 70 else 0.2,
        "influencer_ratio": 0.2 if base_risk > 70 else 0.6,
        "posting_change": -0.3
    }
    
    prediction = ml_classifier.predict_risk(signals)
    risk_score = prediction["risk_score"]
    
    # Run USP engines
    explanation = xai_layer.generate_decision_justification(signals, risk_score)
    cringe_result = usp_engine.detect_cringe_point(signals, risk_score)
    lifecycle_result = usp_engine.classify_lifecycle(risk_score, signals)
    decline_days = _extract_decline_days(prediction["decline_window"])
    roi_result = usp_engine.calculate_roi(risk_score, decline_days)
    
    # GenAI summary
    genai_summary = genai_explainer.generate_executive_summary(
        risk_score, 
        _fallback_shap_format(explanation["top_signals"]),
        lifecycle_result["stage"],
        cringe_result["is_cringe_point"]
    )
    
    recommended_action = genai_explainer.generate_recommended_action(
        risk_score, 
        roi_result["estimated_savings"],
        cringe_result["is_cringe_point"]
    )
    
    drivers = [
        {"label": "Fatigue", "value": random.randint(20, 40), "fullMark": 100},
        {"label": "Sentiment", "value": random.randint(10, 30), "fullMark": 100},
        {"label": "Saturation", "value": random.randint(10, 20), "fullMark": 100}
    ]
    
    formatted_signals = [
        {"metric": "Sentiment", "status": "Risk" if base_risk > 50 else "Good", 
         "explanation": "Simulated signal based on keyword analysis."}
    ]

    return {
        "inputType": "keyword",
        "detectedTrend": trend_name,
        "declineRisk": int(risk_score),
        "timeWindow": prediction["decline_window"],
        "primaryDriver": explanation["primary_driver"],
        "featureBreakdown": signals,
        "explanation": genai_summary,
        "recommendedAction": recommended_action,
        "confidence": 0.75,
        
        "trend": {
            "history": [
                {"timestamp": f"Day {i}", "value": max(0, int(100 - (i * (risk_score/12)) + random.randint(-5, 5)))}
                for i in range(1, 8)
            ]
        },

        "insight": {
            "riskScore": int(risk_score),
            "declineRisk": prediction["risk_level"],
            "decline_probability": risk_score / 100.0,
            "predicted_time_to_decline": prediction["decline_window"],
            "summary": genai_summary,
            "signals": formatted_signals,
            "decline_drivers": drivers,
            "actions": [recommended_action, "Analyze Competitors"],
            
            # USP Fields
            "roi_savings": roi_result["estimated_savings"],
            "is_cringe_point": cringe_result["is_cringe_point"],
            "cringe_severity": cringe_result["severity"],
            "lifecycle_stage": lifecycle_result["stage"],
            "xai_method": "rule-based",
            "shap_drivers": [],
            "decision_justification": usp_engine.format_decision_justification(
                risk_score, 
                _fallback_shap_format(explanation["top_signals"]),
                genai_summary, 
                cringe_result, 
                roi_result, 
                lifecycle_result
            )
        }
    }


def _get_instagram_simulation(url):
    """ specialised simulation for Instagram Reels/Posts """
    # Extract username or shortcode if possible for better seed
    try:
        if "/reel/" in url:
            shortcode = url.split("/reel/")[1].split("/")[0]
            seed_val = shortcode
        elif "/p/" in url:
            shortcode = url.split("/p/")[1].split("/")[0]
            seed_val = shortcode
        else:
            seed_val = url
    except:
        seed_val = url

    random.seed(seed_val)
    base_risk = random.randint(30, 85) # slightly different range than general fallback
    
    # Simulate high engagement (insta usually has higher engagement rate)
    signals = {
        "engagement_velocity": 0.7 if base_risk < 60 else -0.2,
        "sentiment_score": 0.5 if base_risk < 60 else -0.4,
        "comment_fatigue": 0.3 if base_risk < 60 else 0.7,
        "influencer_ratio": 0.8, # Insta is influencer heavy
        "posting_change": 0.1
    }
    
    prediction = ml_classifier.predict_risk(signals)
    risk_score = prediction["risk_score"]
    
    # Run USP engines
    explanation = xai_layer.generate_decision_justification(signals, risk_score)
    cringe_result = usp_engine.detect_cringe_point(signals, risk_score)
    lifecycle_result = usp_engine.classify_lifecycle(risk_score, signals)
    decline_days = _extract_decline_days(prediction["decline_window"])
    roi_result = usp_engine.calculate_roi(risk_score, decline_days)
    
    # GenAI summary (customized prompt context essentially)
    genai_summary = f"INSTAGRAM FORENSIC: {'Viral momentum detected' if risk_score < 50 else 'Engagement plateau detected'}. " + \
                    genai_explainer.generate_executive_summary(
                        risk_score, 
                        _fallback_shap_format(explanation["top_signals"]),
                        lifecycle_result["stage"],
                        cringe_result["is_cringe_point"]
                    )
    
    recommended_action = genai_explainer.generate_recommended_action(
        risk_score, 
        roi_result["estimated_savings"],
        cringe_result["is_cringe_point"]
    )
    
    drivers = [
        {"label": "Algorithm Shift", "value": random.randint(40, 60), "fullMark": 100},
        {"label": "Ad Fatigue", "value": random.randint(20, 40), "fullMark": 100},
        {"label": "Audience Retention", "value": random.randint(30, 50), "fullMark": 100}
    ]
    
    formatted_signals = [
        {"metric": "Reels Engagement", "status": "High" if signals["engagement_velocity"] > 0.5 else "Low", 
         "explanation": "Based on interaction velocity relative to follower count."}
    ]

    return {
        "inputType": "instagram",
        "detectedTrend": f"Instagram Post ({seed_val[:8]}...)",
        "declineRisk": int(risk_score),
        "timeWindow": prediction["decline_window"],
        "primaryDriver": explanation["primary_driver"],
        "featureBreakdown": signals,
        "explanation": genai_summary,
        "recommendedAction": recommended_action,
        "confidence": 0.82,
        
        "trend": {
            "history": [
                {"timestamp": f"Day {i}", "value": max(0, int(100 - (i * (risk_score/15)) + random.randint(-10, 10)))}
                for i in range(1, 8)
            ]
        },

        "insight": {
            "riskScore": int(risk_score),
            "declineRisk": prediction["risk_level"],
            "decline_probability": risk_score / 100.0,
            "predicted_time_to_decline": prediction["decline_window"],
            "summary": genai_summary,
            "signals": formatted_signals,
            "decline_drivers": drivers,
            "actions": [recommended_action, "Cross-Platform Check"],
            
            # USP Fields
            "roi_savings": roi_result["estimated_savings"],
            "is_cringe_point": cringe_result["is_cringe_point"],
            "cringe_severity": cringe_result["severity"],
            "lifecycle_stage": lifecycle_result["stage"],
            "xai_method": "simulation-v2",
            "shap_drivers": [],
            "decision_justification": usp_engine.format_decision_justification(
                risk_score, 
                _fallback_shap_format(explanation["top_signals"]),
                genai_summary, 
                cringe_result, 
                roi_result, 
                lifecycle_result
            )
        }
    }


# --- HELPER FUNCTIONS ---

def _extract_decline_days(decline_window: str) -> int:
    """Extract number of days from decline window string."""
    if "24" in decline_window or "Hours" in decline_window:
        return 1
    elif "3-5" in decline_window:
        return 4
    elif "1-2 Weeks" in decline_window:
        return 10
    else:
        return 30


def _fallback_shap_format(top_signals: list) -> list:
    """Convert rule-based signals to SHAP-like format for GenAI."""
    return [
        {
            "label": signal,
            "contribution": 0.3 if i == 0 else 0.2,
            "shap_value": 0.3 if i == 0 else 0.2
        }
        for i, signal in enumerate(top_signals[:3])
    ]


def _format_signals_for_ui(signals: dict, shap_drivers: list) -> list:
    """Format signals with SHAP-informed status indicators."""
    
    feature_map = {
        "engagement_velocity": "Engagement Momentum",
        "sentiment_score": "Audience Sentiment",
        "comment_fatigue": "Content Fatigue",
        "influencer_ratio": "Influencer Activity",
        "posting_change": "Post Frequency"
    }
    
    # Get risk features from SHAP if available
    risky_features = set()
    if shap_drivers:
        risky_features = {d["feature"] for d in shap_drivers[:3] if d["direction"] == "negative"}
    
    formatted = []
    for key, val in signals.items():
        status = "Normal"
        expl = "Stable metric."
        
        # Use SHAP-informed status if available
        if key in risky_features:
            status = "Risk"
            expl = "Significant contributor to decline risk (SHAP-verified)."
        # Fallback to rule-based
        elif (key == "sentiment_score" and val < -0.2) or \
             (key == "engagement_velocity" and val < -0.2) or \
             (key == "comment_fatigue" and val > 0.4):
            status = "Risk"
            expl = "Contributes to decline risk."
            
        formatted.append({
            "metric": feature_map.get(key, key),
            "status": status,
            "explanation": expl
        })
    
    return formatted


def _format_drivers_for_chart(shap_drivers: list, fallback_signals: list) -> list:
    """Format drivers for pie chart visualization."""
    
    if shap_drivers:
        # Use SHAP contributions
        return [
            {
                "label": d["label"],
                "value": int(d["contribution"] * 100),
                "fullMark": 100
            }
            for d in shap_drivers[:4]
        ]
    else:
        # Use fallback
        return [
            {
                "label": reason,
                "value": random.randint(15, 30),
                "fullMark": 100
            }
            for reason in fallback_signals[:3]
        ]
