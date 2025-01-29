import requests
import json

API_KEY = 'AIzaSyBh-__Kzw-cvPn3ccyb9zKPLvWA1brRSzE'
BASE_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent'

def test_gemini_api():
    url = f"{BASE_URL}?key={API_KEY}"
    
    # Simple test payload
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "Say hello"
                    }
                ]
            }
        ]
    }
    
    try:
        print("Testing Gemini API connection...")
        print(f"URL: {url}")
        print("\nSending request...")
        
        response = requests.post(url, json=payload)
        
        print(f"\nStatus Code: {response.status_code}")
        print("\nResponse Headers:")
        for header, value in response.headers.items():
            print(f"{header}: {value}")
            
        print("\nResponse Body:")
        print(json.dumps(response.json(), indent=2))
        
        if response.status_code == 200:
            print("\n✅ API key is working!")
        else:
            print("\n❌ API key is not working properly")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Connection Error: {str(e)}")
    except json.JSONDecodeError:
        print("\n❌ Error: Invalid JSON response")
        print("Raw response:", response.text)
    except Exception as e:
        print(f"\n❌ Unexpected Error: {str(e)}")

if __name__ == "__main__":
    test_gemini_api()