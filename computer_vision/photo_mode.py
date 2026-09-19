import cv2
from pathlib import Path

from scene_analysis import analyze_image
from learning_api import send_to_learning_api


# Save captured photos inside Wonderly/computer_vision/photo_results.
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "photo_results"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PHOTO_PATH = OUTPUT_DIR / "captured_photo.jpg"


def capture_photo():
    """Open the camera and return the saved photo path, or None if cancelled."""

    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("Error: Could not open the camera.")
        return None

    print("Photo mode started.")
    print("Press SPACE to capture a photo, or Q to quit.")

    saved_path = None

    try:
        while True:
            success, frame = camera.read()

            if not success:
                print("Error: Could not read a frame from the camera.")
                break

            cv2.imshow("Wonderly - Photo Mode", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord(" "):
                if cv2.imwrite(str(PHOTO_PATH), frame):
                    saved_path = str(PHOTO_PATH)
                    print(f"Photo saved as {PHOTO_PATH}")
                else:
                    print("Error: Could not save the photo.")
                break

            if key == ord("q"):
                print("Photo capture cancelled.")
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()

    return saved_path


def main():
    photo_path = capture_photo()

    if photo_path is None:
        print("Photo mode closed.")
        return

    try:
        # Step 1: Analyze the photo using Wonderly's existing OpenCV code.
        scene_analysis = analyze_image(photo_path)
        print("\nOpenCV analysis completed.")

        # Step 2: Send the analysis to Wonderly's backend.
        print("Sending results to Wonderly...")
        learning_content = send_to_learning_api(scene_analysis)

        # Step 3: Display the backend response.
        if learning_content is None:
            print("Could not retrieve learning content from Wonderly.")
            return

        print("\nWonderly learning content received:")
        print(learning_content)

    except Exception as error:
        print(f"Photo analysis error: {error}")

    finally:
        print("Photo mode closed.")


if __name__ == "__main__":
    main()