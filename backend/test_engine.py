from trend_engine import analyze_trend_real
import sys

print("Testing Real Data Engine...")
try:
    result = analyze_trend_real("Bitcoin")
    if result:
        print("SUCCESS! Data received:")
        print(f"Risk Score: {result['insight']['riskScore']}")
        print(f"Summary: {result['insight']['summary']}")
    else:
        print("FAILURE: returned None")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
