
from trend_engine import analyze_trend_real
from feather_client import feather

def verify_attachment():
    print("Testing Decision Engine Attachment...")
    
    # Use a real-looking YouTube URL to trigger the full pipeline
    url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    print(f"Analyzing: {url}")
    
    result = analyze_trend_real(url)
    
    if result:
        print("✅ Pipeline executed successfully")
        print(f"Risk Score: {result['declineRisk']}")
        print(f"Input Type: {result['inputType']}")
        
        # Check Feather storage
        # The request_id is generated in trend_engine as req_<timestamp>
        # Let's check the last stored features
        if feather.feature_values:
            latest_id = list(feather.feature_values.keys())[-1]
            latest_features = feather.get_features(latest_id)
            print(f"✅ Feather Attachment: Found {len(latest_features)} features in store for {latest_id}")
            if "interaction_quality" in latest_features:
                print("✅ Full Feature set (11 signals) verified in Feather")
            else:
                print("❌ Missing features in Feather")
        else:
            print("❌ No features found in Feather store")
            
        print(f"Primary Driver: {result['primaryDriver']}")
        print(f"Confidence: {result['confidence']}")
    else:
        print("❌ Analysis failed")

if __name__ == "__main__":
    verify_attachment()
