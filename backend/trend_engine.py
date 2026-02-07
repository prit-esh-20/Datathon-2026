import os
from dotenv import load_dotenv
from pytrends.request import TrendReq
import requests
from textblob import TextBlob
import pandas as pd
import random
import time

# Load environment variables
load_dotenv()

# Check for API Keys
SERPAPI_KEY = os.getenv("SERPAPI_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Optional: Import official clients if installed
try:
    from serpapi import GoogleSearch
    HAS_SERPAPI_LIB = True
except ImportError:
    HAS_SERPAPI_LIB = False

# Configure Gemini if key is present
HAS_GEMINI = False
if GEMINI_API_KEY and "your_" not in GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        HAS_GEMINI = True
    except ImportError:
        print("Gemini SDK not installed.")
        pass

def generate_gemini_insight(topic, history, news_data, prediction):
    """
    Uses Gemini to generate a human-like summary and action items.
    """
    if not HAS_GEMINI:
        return None, None

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        last_val = history[-1]['value'] if history else 0
        first_val = history[0]['value'] if history else 0
        slope = last_val - first_val
        
        prompt = f"""
        Analyze the following trend data for the topic: "{topic}"
        - Trend Direction (Slope): {slope} (Interest scale 0-100 over 7 days)
        - Current Interest Level: {last_val}
        - Media Sentiment Polarity: {news_data['avg_sentiment'] if news_data else 'Unknown'}
        - Media Fatigue Score: {news_data['fatigue_score'] if news_data else 'Unknown'}%
        - ML Predicted Risk: {prediction['risk_label']} ({prediction['risk_score']}% probability of collapse)
        - Predicted Time to Decline: {prediction['predicted_time_to_decline']}

        Task:
        1. Write a 2-sentence punchy summary explaining why the trend is safe or dying. Be specific (use numbers).
        2. Provide exactly 3 short, strategic action steps for a digital marketer.

        Output Format:
        Summary: [Your 2-sentence summary]
        Actions:| [Action 1] | [Action 2] | [Action 3]
        """
        
        response = model.generate_content(prompt)
        text = response.text
        
        # Parse response
        summary = ""
        actions = []
        
        lines = text.split('\n')
        for line in lines:
            if line.startswith("Summary:"):
                summary = line.replace("Summary:", "").strip()
            if "Actions:|" in line or "Actions:" in line:
                parts = line.split('|')
                # Filter out empty strings and the header
                actions = [p.strip() for p in parts if p.strip() and not p.strip().lower().startswith("actions")]
        
        if not summary or not actions:
            return None, None
            
        return summary, actions[:3]
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None, None

def get_google_trends_interest(topic):
    history = []
    
    # ---------------------------------------------------------
    # STRATEGY 1: Use SerpApi (Reliable & Paid)
    # ---------------------------------------------------------
    if SERPAPI_KEY and HAS_SERPAPI_LIB and "your_" not in SERPAPI_KEY:
        try:
            print(f"Using SerpApi (Trends) for: {topic}")
            params = {
                "engine": "google_trends",
                "q": topic,
                "api_key": SERPAPI_KEY,
                "date": "now 7-d"
            }
            search = GoogleSearch(params)
            results = search.get_dict()
            
            if "interest_over_time" in results:
                timeline = results["interest_over_time"].get("timeline_data", [])
                total_points = len(timeline)
                step = max(1, total_points // 24)
                
                for i in range(0, total_points, step):
                    point = timeline[i]
                    idx = total_points - i
                    val = point.get("values", [{}])[0].get("value", 0)
                    history.append({"timestamp": f"{idx}h ago", "value": int(val)})
                
                if history:
                    return history
        except Exception as e:
            print(f"SerpApi (Trends) Failed: {e}")

    # ---------------------------------------------------------
    # STRATEGY 2: Use Pytrends (Free & Flaky)
    # ---------------------------------------------------------
    try:
        print("Using Pytrends Fallback...")
        # TIMEOUT SAFETY: Google Trends can hang.
        pytrends = TrendReq(hl='en-US', tz=360, retries=1, backoff_factor=0.1, timeout=(5,5))
        kw_list = [topic]
        
        pytrends.build_payload(kw_list, cat=0, timeframe='now 7-d', geo='', gprop='')
        interest_over_time_df = pytrends.interest_over_time()
        
        if interest_over_time_df.empty:
            return None

        if topic not in interest_over_time_df.columns:
             return None

        data_points = interest_over_time_df[topic].tolist()
        step = max(1, len(data_points) // 24)
        
        for i in range(0, len(data_points), step):
             history.append({"timestamp": f"{len(data_points) - i}h ago", "value": int(data_points[i])})
                
        return history
    except Exception as e:
        print(f"Google Trends (Pytrends) Error: {e}")
        return None

def get_news_sentiment(topic):
    """
    Analyzes news headlines to determine sentiment.
    Uses SerpApi (Google News) if available, otherwise mocks it.
    """
    
    # ---------------------------------------------------------
    # STRATEGY 1: Use SerpApi (Google News)
    # ---------------------------------------------------------
    if SERPAPI_KEY and HAS_SERPAPI_LIB and "your_" not in SERPAPI_KEY:
        try:
            print(f"Using SerpApi (News) for: {topic}")
            params = {
                "engine": "google_news",
                "q": topic,
                "api_key": SERPAPI_KEY,
                "gl": "us",
                "hl": "en"
            }
            search = GoogleSearch(params)
            results = search.get_dict()
            
            news_results = results.get("news_results", [])
            
            sentiments = []
            titles = []
            
            for news in news_results[:10]: # Analyze top 10 headlines
                title = news.get("title", "")
                titles.append(title)
                try:
                    analysis = TextBlob(title)
                    sentiments.append(analysis.sentiment.polarity)
                except:
                    pass
            
            if not sentiments: return None
            
            avg_sentiment = sum(sentiments) / len(sentiments)
            
            # Fatigue Logic for News:
            neg_count = sum(1 for s in sentiments if s < -0.1)
            fatigue_score = (neg_count / len(sentiments)) * 100 if sentiments else 30
            
            return {
                "avg_sentiment": avg_sentiment,
                "fatigue_score": int(fatigue_score),
                "sample_titles": titles[:3]
            }

        except Exception as e:
            print(f"SerpApi (News) Failed: {e}")

    # ---------------------------------------------------------
    # STRATEGY 2: Mock Fallback
    # ---------------------------------------------------------
    print("No News API available. Returning None.")
    return None

def analyze_trend_real(topic):
    print(f"Starting Real Analysis for: {topic}")
    
    # 1. Fetch Google Trends Data
    trend_history = get_google_trends_interest(topic)
    
    # 2. Fetch News Sentiment
    news_data = get_news_sentiment(topic)
    
    # 3. Fallback to Simulation if Real Data Fails
    if not trend_history:
        print("Falling back to simulation (No Trends Data)")
        return None 

    # 4. Calculate Risk Score using ML Model
    try:
        last_val = trend_history[-1]['value']
        first_val = trend_history[0]['value']
        slope = last_val - first_val
        
        # Prepare Features for ML
        sentiment_input = news_data['avg_sentiment'] if news_data else 0
        fatigue_input = news_data['fatigue_score'] if news_data else 30
        
        # ML PREDICTION
        from ml_model import trend_model
        prediction = trend_model.predict_risk(slope, sentiment_input, fatigue_input)
        
        # 5. GENERATE AI INSIGHTS
        ai_summary, ai_actions = generate_gemini_insight(topic, trend_history, news_data, prediction)
        
        risk_score = prediction["risk_score"]
        decline_risk = prediction["risk_label"]
        decline_prob = prediction["decline_probability"]
        time_to_decline = prediction["predicted_time_to_decline"]
        
        summary = ai_summary if ai_summary else ""
        signals = []
        actions = ai_actions if ai_actions else []

        # Fallback Template Summary if AI failed
        if not summary:
            if slope < -5:
                # Override risk score if slope is catastrophic
                risk_score = max(risk_score, min(98, 70 + abs(slope)))
                decline_risk = "High" 
                summary = f"CRITICAL: Interest in '{topic}' has plummeted. Probability of collapse: {int(decline_prob*100)}%."
                actions = ["Exit immediately", "Do not invest", "Archive content"]
            elif slope < -2:
                summary = f"WARNING: '{topic}' is showing signs of fatigue. Estimated decline in {time_to_decline}."
                actions = ["Monitor closely", "Prepare pivot", "Reduce spend"]
            else:
                summary = f"OPPORTUNITY: Growth detected. Stability forecast: {time_to_decline}."
                actions = ["Maximize reach", "Invest now", "Create content"]

        # Add Data Signals
        signals.append({"metric": "Engagement Velocity", "status": "Critical" if slope < -5 else "Warning" if slope < -2 else "Good", "explanation": f"{'Growth' if slope >=0 else 'Decline'} of {abs(slope)} pts."})
        
        if news_data:
             if news_data['avg_sentiment'] < -0.1:
                 signals.append({"metric": "News Sentiment", "status": "Bad", "explanation": "Headlines are largely negative."})
             elif news_data['avg_sentiment'] > 0.2:
                 signals.append({"metric": "News Sentiment", "status": "Good", "explanation": "Media coverage is positive."})
             else:
                 signals.append({"metric": "News Sentiment", "status": "Warning", "explanation": "Mixed/Neutral coverage."})

             if news_data['fatigue_score'] > 60:
                  signals.append({"metric": "Media Saturation", "status": "Bad", "explanation": f"High intensity ({int(news_data['fatigue_score'])}% stress)."})
        else:
             signals.append({"metric": "News Sentiment", "status": "Warning", "explanation": "No news data available."})

        # Normalize sentiment for UI driver chart (100 = Bad, 0 = Good)
        sentiment_driver_val = int((1 - sentiment_input) * 50)

        decline_drivers = [
            {"label": "Saturation", "value": int(max(10, min(100, (risk_score + 10)))), "fullMark": 100},
            {"label": "Fatigue", "value": int(fatigue_input), "fullMark": 100},
            {"label": "Sentiment", "value": sentiment_driver_val, "fullMark": 100},
            {"label": "Algo Shift", "value": random.randint(20, 60), "fullMark": 100},
            {"label": "Disengage", "value": int(max(0, 100 - last_val)) if last_val < 100 else 20, "fullMark": 100},
        ]

        return {
            "insight": {
                "riskScore": int(risk_score),
                "declineRisk": decline_risk,
                "decline_probability": decline_prob,
                "predicted_time_to_decline": time_to_decline,
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
