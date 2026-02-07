from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import random
from trend_engine import analyze_trend_real
import re
from youtube_client import YouTubeClient
from feature_engine import FeatureEngine
from prediction_model import model
from explainability import xai, gen, recommend
import uuid

yt_client = YouTubeClient()
ft_engine = FeatureEngine()

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TrendRequest(BaseModel):
    topic: str
    timeWindow: Optional[str] = "48h"

class Signal(BaseModel):
    metric: str
    status: str
    explanation: str

class Insight(BaseModel):
    riskScore: int
    declineRisk: str
    decline_probability: float
    predicted_time_to_decline: str
    summary: str
    signals: List[Signal]
    actions: List[str]
    decline_drivers: Optional[List[dict]] = None

class TrendData(BaseModel):
    timestamp: str
    value: int

class AnalysisResponse(BaseModel):
    insight: Insight
    trend: List[TrendData]
    # Extension fields
    primaryDriver: Optional[str] = None
    explanation: Optional[str] = None
    recommendedAction: Optional[str] = None
    featureBreakdown: Optional[List[dict]] = None

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_trend(request: TrendRequest):
    # 1. YouTube specialized analysis
    youtube_match = re.search(r"(?:v=|\/|be\/)([a-zA-Z0-9_-]{11})", request.topic)
    if youtube_match:
        video_id = youtube_match.group(1)
        request_id = str(uuid.uuid4())
        
        # Data Acquisition
        metadata = yt_client.get_video_metadata(video_id)
        if metadata:
            comments = yt_client.get_video_comments(video_id)
            
            # Feature Engineering (Stores in Feather)
            ft_engine.process_and_register(request_id, metadata, comments)
            
            # Prediction (From Feather)
            pred = model.predict(request_id)
            
            # Explainability
            explanations = xai.get_feature_contributions(request_id)
            primary_driver = explanations["primaryDriver"]
            expl_text = gen.generate(primary_driver, pred["declineRisk"])
            action = recommend.get_action(primary_driver)
            
            # Create final response
            return {
                "insight": {
                    "riskScore": pred["declineRisk"],
                    "declineRisk": "High" if pred["declineRisk"] > 75 else "Medium" if pred["declineRisk"] > 40 else "Low",
                    "decline_probability": pred["declineRisk"] / 100.0,
                    "predicted_time_to_decline": f"< {pred['timeWindow']}",
                    "summary": expl_text,
                    "signals": [
                        {"metric": d["feature"].replace("_", " ").title(), 
                         "status": "Critical" if d["contribution"] > 15 else "Warning" if d["contribution"] > 5 else "Normal", 
                         "explanation": f"{gen.explanations.get(d['feature'], 'Feature impact on trend stability.')} (Score Impact: {d['contribution']:.1f})"}
                        for d in explanations["featureBreakdown"]
                    ],
                    "decline_drivers": [
                        {"label": d["feature"].replace("_", " ").title(), "value": int(min(100, max(0, d["value"] * 100 if d["value"] < 1 else d["value"]))), "fullMark": 100}
                        for d in explanations["featureBreakdown"][:5]
                    ],
                    "actions": [action, "Review audience segment", "Audit content format"]
                },
                "trend": [
                    {"timestamp": f"{i}h ago", "value": int(1000 * (1 - (i * pred['declineRisk']/2000)))}
                    for i in range(24, 0, -1)
                ],
                "primaryDriver": primary_driver,
                "explanation": expl_text,
                "recommendedAction": action,
                "featureBreakdown": explanations["featureBreakdown"]
            }

    # 2. Try Real Data Analysis (Existing)
    try:
        real_data = analyze_trend_real(request.topic)
        if real_data:
            return real_data
    except Exception as e:
        print(f"Real analysis failed, falling back: {e}")

    # 2. Fallback to Simulation (Previous Logic)
    # Simulate processing delay
    time.sleep(1.5)
    
    topic = request.topic.lower()
    
    # Deterministic Mock Logic based on topic string length for demo variety
    seed = len(topic)
    random.seed(seed)
    
    # Generate Mock Data
    history = []
    base_value = 1000
    for i in range(24):
        noise = random.randint(-50, 50)
        # Creating a decline curve
        # Make it less binary
        decay_factor = random.randint(30, 50) if seed % 2 == 0 else random.randint(-15, -5)
        decay = i * decay_factor
        value = max(0, base_value - decay + noise)
        history.append({"timestamp": f"{i}h ago", "value": int(value)})
    
    history.reverse()

    scenario = seed % 3
    
    # Generate dynamic numbers for simulation to make it feel "real"
    velocity_drop = random.randint(15, 45)
    fatigue_level = random.randint(60, 90)

    if scenario == 0: # Bad Trend (High Risk)
        risk_score = 80 + random.randint(0, 15)
        return {
            "insight": {
                "riskScore": risk_score,
                "declineRisk": "High",
                "decline_probability": 0.85,
                "predicted_time_to_decline": "< 24 Hours",
                "summary": f"Decline risk is HIGH. Engagement velocity has plummeted by -{velocity_drop}% (Simulated).",
                "signals": [
                    {"metric": "Engagement Velocity", "status": "Critical", "explanation": f"Dropped by {velocity_drop}% in 24h."},
                    {"metric": "Audience Fatigue", "status": "Warning", "explanation": f"Fatigue level at {fatigue_level}% (High)."}
                ],
                "decline_drivers": [
                    {"label": "Saturation", "value": 90, "fullMark": 100},
                    {"label": "Fatigue", "value": fatigue_level, "fullMark": 100},
                    {"label": "Sentiment", "value": 30, "fullMark": 100},
                    {"label": "Algo Shift", "value": 60, "fullMark": 100},
                    {"label": "Disengage", "value": 95, "fullMark": 100},
                ],
                "actions": ["Stop ad spend immediately", "Pivot content strategy", "Exit trend"]
            },
            "trend": history
        }
    elif scenario == 1: # Stagnant Trend (Medium Risk)
        risk_score = 40 + random.randint(0, 20)
        return {
            "insight": {
                "riskScore": risk_score,
                "declineRisk": "Medium",
                "decline_probability": 0.45,
                "predicted_time_to_decline": "3-7 Days",
                "summary": f"Decline risk is MEDIUM. Engagement is flat (0% growth).",
                "signals": [
                    {"metric": "Engagement Velocity", "status": "Warning", "explanation": "Stagnant (0-2% growth)."},
                    {"metric": "Audience Fatigue", "status": "Fair", "explanation": "Moderate fatigue detected."}
                ],
                 "decline_drivers": [
                    {"label": "Saturation", "value": 60, "fullMark": 100},
                    {"label": "Fatigue", "value": 45, "fullMark": 100},
                    {"label": "Sentiment", "value": 50, "fullMark": 100},
                    {"label": "Algo Shift", "value": 40, "fullMark": 100},
                    {"label": "Disengage", "value": 30, "fullMark": 100},
                ],
                "actions": ["Refresh creatives", "Run contest", "A/B test new angles"]
            },
            "trend": history
        }
    else: # Good Trend (Low Risk)
        risk_score = 10 + random.randint(0, 20)
        return {
             "insight": {
                "riskScore": risk_score,
                "declineRisk": "Low",
                "decline_probability": 0.10,
                "predicted_time_to_decline": "Stable (> 30 Days)",
                "summary": f"Decline risk is LOW. '{request.topic}' is showing healthy organic growth (Simulated).",
                "signals": [
                    {"metric": "Engagement Drop", "status": "Normal", "explanation": "Growth is steady."},
                    {"metric": "Audience Fatigue", "status": "Normal", "explanation": "Sentiment is positive."}
                ],
                "decline_drivers": [
                    {"label": "Saturation", "value": 20, "fullMark": 100},
                    {"label": "Fatigue", "value": 15, "fullMark": 100},
                    {"label": "Sentiment", "value": 90, "fullMark": 100},
                    {"label": "Algo Shift", "value": 10, "fullMark": 100},
                    {"label": "Disengage", "value": 5, "fullMark": 100},
                ],
                "actions": ["Scale up content", "Engage with influencers", "Ride the wave"]
            },
            "trend": history
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
