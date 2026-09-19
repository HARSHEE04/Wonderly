
import cv2
import json
from pathlib import Path
from datetime import datetime

from scene_analysis import analyze_image


# Store results inside the computer_vision folder.
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "photo_results"


def main():
    """Capture a photograph and automatically generate SceneAnalysis."""

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Open the webcam.
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("Error: Could not open the webcam.")
        return

    print("Camera opened successfully.")
    print("Press SPACE to capture and analyze a photo.")
    print("Press Q to quit.")

    try:
        while True:
            success, frame = camera.read()

            if not success:
                print("Error: Could not read a frame from the webcam.")
                break

            cv2.imshow("Wonderly - Photo Mode", frame)

            key = cv2.waitKey(1) & 0xFF

            # Press Q to quit.
            if key == ord("q"):
                break

            # Press SPACE to capture and analyze the image.
            if key == 32:

                # Use a timestamp to avoid overwriting old captures.
                timestamp = datetime.now().strftime(
                    "%Y%m%d_%H%M%S_%f"
                )

                image_path = OUTPUT_DIR / f"photo_{timestamp}.jpg"
                json_path = OUTPUT_DIR / f"scene_{timestamp}.json"

                # Save the original photograph.
                saved = cv2.imwrite(str(image_path), frame)

                if not saved:
                    print("Error: Could not save the photograph.")
                    continue

                print(f"\nPhoto saved: {image_path.name}")
                print("Analyzing photograph...")

                try:
                    # Run your existing five OpenCV feature detectors.
                    scene_analysis = analyze_image(str(image_path))

                    # Save the structured data as a JSON file.
                    with open(
                        json_path,
                        "w",
                        encoding="utf-8",
                    ) as output_file:
                        json.dump(
                            scene_analysis,
                            output_file,
                            indent=2,
                        )

                    print(f"SceneAnalysis saved: {json_path.name}")

                    # Show a quick summary of detected features.
                    print("\n===== SCENE ANALYSIS =====")

                    for category in (
                        "colors",
                        "shapes",
                        "lines",
                        "textures",
                        "patterns",
                    ):
                        print(
                            f"{category.capitalize()}: "
                            f"{len(scene_analysis[category])}"
                        )

                    print("==========================\n")

                except Exception as error:
                    print(f"Analysis failed: {error}")

    finally:
        # Always release the camera when the program exits.
        camera.release()
        cv2.destroyAllWindows()

        print("Photo mode stopped.")


if __name__ == "__main__":
    main()