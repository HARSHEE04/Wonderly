"""
End-to-end walkthrough (see prior run for context):
  1. Generate a random test image.
  2. Run it through the real OpenCV feature extraction (scene_analysis.py).
  3. Create a session, attach scene analysis (challenge recommendation).
  4. Fetch OpenAI-generated learning content (the "knowledge section").
  5. Fetch the OpenAI-generated creative challenge (the "challenge section").
"""
import json
import random

import cv2
import numpy as np
import requests

from scene_analysis import analyze_image

BACKEND_URL = "http://localhost:4000"
IMAGE_PATH = "e2e_test.jpg"


def make_random_image():
    random.seed()
    img = np.full((400, 600, 3), 255, dtype=np.uint8)

    for _ in range(random.randint(2, 4)):
        color = tuple(random.randint(0, 255) for _ in range(3))
        shape = random.choice(["rectangle", "circle", "line"])
        if shape == "rectangle":
            pt1 = (random.randint(0, 400), random.randint(0, 250))
            pt2 = (pt1[0] + random.randint(50, 150), pt1[1] + random.randint(50, 150))
            cv2.rectangle(img, pt1, pt2, color, -1)
        elif shape == "circle":
            center = (random.randint(100, 500), random.randint(100, 300))
            radius = random.randint(30, 90)
            cv2.circle(img, center, radius, color, -1)
        else:
            pt1 = (random.randint(0, 600), random.randint(0, 400))
            pt2 = (random.randint(0, 600), random.randint(0, 400))
            cv2.line(img, pt1, pt2, color, random.randint(2, 6))

    cv2.imwrite(IMAGE_PATH, img)
    return IMAGE_PATH


def main():
    path = make_random_image()

    scene_analysis = analyze_image(path)
    with open("_e2e_scene.json", "w") as f:
        json.dump(scene_analysis, f, indent=2)

    session_res = requests.post(
        f"{BACKEND_URL}/api/sessions",
        json={"userId": "demo-user", "mode": "creative"},
        timeout=15,
    )
    session_res.raise_for_status()
    session_id = session_res.json()["data"]["id"]

    scene_res = requests.post(
        f"{BACKEND_URL}/api/sessions/{session_id}/scene-analysis",
        json=scene_analysis,
        timeout=15,
    )
    scene_res.raise_for_status()

    learning_res = requests.post(
        f"{BACKEND_URL}/api/learning/content",
        json={"sessionId": session_id},
        timeout=30,
    )
    learning_res.raise_for_status()
    with open("_e2e_learning.json", "w") as f:
        json.dump(learning_res.json()["data"], f, indent=2)

    challenge_res = requests.post(
        f"{BACKEND_URL}/api/sessions/{session_id}/creative-challenge",
        json={},
        timeout=30,
    )
    challenge_res.raise_for_status()
    with open("_e2e_challenge.json", "w") as f:
        json.dump(challenge_res.json()["data"], f, indent=2)

    print("done")


if __name__ == "__main__":
    main()
