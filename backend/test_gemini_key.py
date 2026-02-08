import os
import google.generativeai as genai
from dotenv import load_dotenv

def test_gemini():
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    
    print(f"Testing API Key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")
    
    if not api_key:
        print("Error: GEMINI_API_KEY not found in .env")
        return

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content("Say 'Gemini Integration Successful'")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gemini()
