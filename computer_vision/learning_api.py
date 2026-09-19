import requests

BACKEND_URL = "http://localhost:4000"

def send_to_learning_api(scene_analysis):
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/learning/content",
            json={"sceneAnalysis": scene_analysis},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        print("Connected to Wonderly!")
        return result.get("data", result)

    except requests.RequestException as error:
        print(f"Connection error: {error}")
        return None