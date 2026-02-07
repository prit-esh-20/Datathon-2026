from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time
import random

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
        decay = i * 40 if seed % 2 == 0 else i * -10 # Decline or Growth based on seed
        value = max(0, base_value - decay + noise)
        history.append({"timestamp": f"{i}h ago", "value": int(value)})
    
    history.reverse()

    if seed % 2 == 0: # Bad Trend
        return {
            "insight": {
                "riskScore": 88,
                "declineRisk": "High",
                "summary": f"Decline risk is HIGH. Engagement velocity for '{request.topic}' has dropped significantly.",
                "signals": [
                    {"metric": "Engagement Drop", "status": "Critical", "explanation": "Velocity below recovery threshold."},
                    {"metric": "Audience Fatigue", "status": "Warning", "explanation": "Negative sentiment rising."}
                ],
                "actions": ["Stop ad spend immediately", "Pivot content strategy", "Exit trend"]
            },
            "trend": history
        }
    else: # Good Trend
        return {
             "insight": {
                "riskScore": 12,
                "declineRisk": "Low",
                "summary": f"Decline risk is LOW. '{request.topic}' is showing healthy organic growth.",
                "signals": [
                    {"metric": "Engagement Drop", "status": "Normal", "explanation": "Growth is steady."},
                    {"metric": "Audience Fatigue", "status": "Normal", "explanation": "Sentiment is positive."}
                ],
                "actions": ["Scale up content", " engage with influencers", "Ride the wave"]
            },
            "trend": history
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
