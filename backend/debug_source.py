import inspect
import sys
import os

# Set encoding to utf-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

try:
    import trend_engine
    print(f"File: {trend_engine.__file__}")
    print("Source of _get_simulation_fallback:")
    print(inspect.getsource(trend_engine._get_simulation_fallback))
    
    # Also verify the return value directly
    res = trend_engine._get_simulation_fallback("test")
    print("\nResult Keys:", list(res.keys()))
    if "trend" in res:
        print("TREND KEY FOUND!")
    else:
        print("TREND KEY MISSING!")
except Exception as e:
    print(f"Error: {e}")
