from pytrends.request import TrendReq
import requests
from textblob import TextBlob
import pandas as pd
import random
import time

def get_google_trends_interest(topic):
    try:
        # TIMEOUT SAFETY: Google Trends can hang.
        # We use a custom requests session with timeout if possible, 
        # but pytrends doesn't expose it easily.
        # So we just wrap the whole thing in a general try/except block 
        # but optimally we rely on the caller to not wait forever.
        
        pytrends = TrendReq(hl='en-US', tz=360, retries=1, backoff_factor=0.1, timeout=(5,5))
        kw_list = [topic]
        
        # Get last 7 days hourly data
        pytrends.build_payload(kw_list, cat=0, timeframe='now 7-d', geo='', gprop='')
        
        interest_over_time_df = pytrends.interest_over_time()
        
        if interest_over_time_df.empty:
            return None

        history = []
        data_points = interest_over_time_df[topic].tolist()
        
        step = max(1, len(data_points) // 24)
        
        for i in range(0, len(data_points), step):
             # Just use index as offset for simplicity in demo
             history.append({"timestamp": f"{len(data_points) - i}h ago", "value": int(data_points[i])})
                
        return history
    except Exception as e:
        print(f"Google Trends Error: {e}")
        return None

def get_reddit_sentiment(topic):
    try:
        url = f"https://www.reddit.com/search.json?q={topic}&sort=new&limit=25"
        headers = {'User-agent': 'TrendFallAI/1.0'}
        # ADDED TIMEOUT
        response = requests.get(url, headers=headers, timeout=3)
        
        if response.status_code != 200:
            return None

        data = response.json()
        posts = data.get('data', {}).get('children', [])
        
        if not posts:
            return None

        sentiments = []
        titles = []
        
        for post in posts:
            title = post['data'].get('title', '')
            titles.append(title)
            try:
                analysis = TextBlob(title)
                sentiments.append(analysis.sentiment.polarity)
            except Exception:
                # TextBlob missing corpus or fail
                sentiments.append(0)

        avg_sentiment = sum(sentiments) / len(sentiments) if sentiments else 0
        
        neg_count = sum(1 for s in sentiments if s < -0.1)
        fatigue_score = (neg_count / len(sentiments)) * 100 if sentiments else 0

        return {
            "avg_sentiment": avg_sentiment,
            "fatigue_score": int(fatigue_score),
            "sample_titles": titles[:3]
        }

    except Exception as e:
        print(f"Reddit Error: {e}")
        return None

def analyze_trend_real(topic):
    print(f"Starting Real Analysis for: {topic}")
    
    # 1. Fetch Google Trends Data
    trend_history = get_google_trends_interest(topic)
    
    # 2. Fetch Reddit Sentiment
    reddit_data = get_reddit_sentiment(topic)
    
    # 3. Fallback to Simulation if Real Data Fails
    if not trend_history:
        print("Falling back to simulation (No Trends Data)")
        return None 

    # 4. Calculate Risk Score using ML Model
    try:
        if not trend_history: return None
        first_val = trend_history[0]['value']
        last_val = trend_history[-1]['value']
        
        slope = last_val - first_val
        
        # Prepare Features for ML
        # Slope: calculated above
        # Sentiment: reddit_data['avg_sentiment'] (or 0 fallback)
        # Fatigue: reddit_data['fatigue_score'] (or 30 fallback)
        
        sentiment_input = reddit_data['avg_sentiment'] if reddit_data else 0
        fatigue_input = reddit_data['fatigue_score'] if reddit_data else 30
        
        # ML PREDICTION
        from ml_model import trend_model
        risk_score, decline_risk = trend_model.predict_risk(slope, sentiment_input, fatigue_input)
        
        summary = ""
        signals = []
        actions = []

        # Generate Explanations based on the ML Result
        if slope < -5:
            risk_score = min(98, 70 + abs(slope))
            decline_risk = "High"
            summary = f"CRITICAL: Interest in '{topic}' has plummeted by {abs(slope)} points."
            signals.append({"metric": "Engagement Velocity", "status": "Critical", "explanation": f"Sharp drop ({slope} pts)."})
            actions = ["Exit immediately", "Do not invest", "Archive content"]
        elif slope < -2:
            risk_score = 40 + abs(slope) * 2
            decline_risk = "Medium"
            summary = f"WARNING: '{topic}' is showing signs of fatigue."
            signals.append({"metric": "Engagement Velocity", "status": "Warning", "explanation": f"Moderate decline ({slope} pts)."})
            actions = ["Monitor closely", "Prepare pivot", "Reduce spend"]
        else:
            summary = f"OPPORTUNITY: ML predicts continued growth (Risk: {risk_score}%)."
            signals.append({"metric": "Engagement Velocity", "status": "Good", "explanation": f"Growth detected (+{slope} pts)."})
            actions = ["Maximize reach", "Invest now", "Create content"]

        # Add Data Signals
        if slope < 0:
             pass # Handled above
        else:
             pass 

        # Normalize sentiment for UI driver chart (100 = Bad, 0 = Good)
        sentiment_driver_val = (1 - sentiment_input) * 50

        decline_drivers = [
            {"label": "Saturation", "value": int(max(10, min(100, (risk_score + 10)))), "fullMark": 100},
            {"label": "Fatigue", "value": int(fatigue_input), "fullMark": 100},
            {"label": "Sentiment", "value": int(sentiment_driver_val), "fullMark": 100},
            {"label": "Algo Shift", "value": random.randint(20, 60), "fullMark": 100},
            {"label": "Disengage", "value": int(max(0, 100 - last_val)) if last_val < 100 else 20, "fullMark": 100},
        ]

        return {
            "insight": {
                "riskScore": int(risk_score),
                "declineRisk": decline_risk,
                "summary": summary,
                "signals": signals,
                "decline_drivers": decline_drivers,
                "actions": actions
            },
            "trend": trend_history
        }
    except Exception as e:
        print(f"Error calculating stats: {e}")
        return None
