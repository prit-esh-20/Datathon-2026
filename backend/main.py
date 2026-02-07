from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import random
from trend_engine import analyze_trend_real

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
    summary: str
    signals: List[Signal]
    actions: List[str]

class TrendData(BaseModel):
    timestamp: str
    value: int

class AnalysisResponse(BaseModel):
    insight: Insight
    trend: List[TrendData]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_trend(request: TrendRequest):
    # 1. Try Real Data Analysis
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
