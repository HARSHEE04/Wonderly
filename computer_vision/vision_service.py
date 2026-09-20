
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

import cv2
import numpy as np

from visual_features import extract_visual_features
from scene_analysis import to_scene_analysis


HOST = "127.0.0.1"
PORT = 8001

BACKEND_URL = "http://127.0.0.1:4000"

MAX_IMAGE_BYTES = 10 * 1024 * 1024


def send_to_backend(session_id, scene_analysis):
    """
    Send real OpenCV analysis to an existing backend session.

    Flutter will create the session and provide its ID.
    """

    url = (
        f"{BACKEND_URL}/api/sessions/"
        f"{session_id}/scene-analysis"
    )

    request = Request(
        url,
        data=json.dumps(scene_analysis).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    with urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


class VisionHandler(BaseHTTPRequestHandler):

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")

        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json",
        )

        self.send_header(
            "Content-Length",
            str(len(body)),
        )

        # Local Flutter web development.
        self.send_header(
            "Access-Control-Allow-Origin",
            "*",
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS",
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, X-Session-Id",
        )

        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*",
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS",
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type, X-Session-Id",
        )

        self.end_headers()

    def do_POST(self):

        if self.path != "/analyze":
            self.send_json(
                404,
                {
                    "success": False,
                    "error": "Unknown endpoint",
                },
            )
            return

        # Flutter sends the session ID in this header.
        session_id = self.headers.get(
            "X-Session-Id",
            "",
        ).strip()

        if not session_id:
            self.send_json(
                400,
                {
                    "success": False,
                    "error": "Missing X-Session-Id header",
                },
            )
            return

        try:
            content_length = int(
                self.headers.get("Content-Length", "0")
            )

        except ValueError:
            self.send_json(
                400,
                {
                    "success": False,
                    "error": "Invalid Content-Length",
                },
            )
            return

        if (
            content_length <= 0
            or content_length > MAX_IMAGE_BYTES
        ):
            self.send_json(
                400,
                {
                    "success": False,
                    "error": "Invalid image size",
                },
            )
            return

        try:
            # STEP 1: Receive and decode the image.
            image_bytes = self.rfile.read(content_length)

            image_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8,
            )

            frame = cv2.imdecode(
                image_array,
                cv2.IMREAD_COLOR,
            )

            if frame is None:
                self.send_json(
                    400,
                    {
                        "success": False,
                        "error": "Could not decode image",
                    },
                )
                return

            print(f"Analyzing image for session: {session_id}")

            # STEP 2: Run your existing five OpenCV detectors.
            features = extract_visual_features(frame)

            # STEP 3: Convert detections to SceneAnalysis JSON.
            scene_analysis = to_scene_analysis(features)

            print("OpenCV analysis complete.")

            # STEP 4: Submit the real analysis to Harsheta's backend.
            backend_response = send_to_backend(
                session_id,
                scene_analysis,
            )

            if backend_response.get("success") is False:
                raise RuntimeError(
                    "Backend did not accept scene analysis"
                )

            print("SceneAnalysis sent to backend successfully.")

            # STEP 5: Return both results to Flutter.
            self.send_json(
                200,
                {
                    "success": True,
                    "sceneAnalysis": scene_analysis,
                    "backendResponse": backend_response,
                },
            )

        except HTTPError as error:
            print(f"Backend HTTP error: {error.code}")

            self.send_json(
                502,
                {
                    "success": False,
                    "error": (
                        f"Backend rejected the request "
                        f"(HTTP {error.code})"
                    ),
                },
            )

        except URLError as error:
            print(f"Backend connection error: {error}")

            self.send_json(
                502,
                {
                    "success": False,
                    "error": "Could not connect to Node.js backend",
                },
            )

        except Exception as error:
            print(f"Vision service error: {error}")

            self.send_json(
                500,
                {
                    "success": False,
                    "error": "Image analysis or submission failed",
                },
            )


if __name__ == "__main__":

    server = HTTPServer(
        (HOST, PORT),
        VisionHandler,
    )

    print("Wonderly Vision service started.")
    print(f"Listening at http://{HOST}:{PORT}/analyze")
    print(f"Backend: {BACKEND_URL}")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()

    except KeyboardInterrupt:
        print("\nStopping Vision service.")

    finally:
        server.server_close()