import cv2


def capture_photo():
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("ERROR: Could not open the webcam.")
        return

    print("Photo mode started.")
    print("Press SPACE to capture a photo, or Q to quit.")

    try:
        while True:
            success, frame = camera.read()

            if not success or frame is None:
                print("ERROR: Could not read a frame.")
                break

            cv2.putText(
                frame,
                "SPACE: Capture  |  Q: Quit",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
            )

            cv2.imshow("Vision - Photo Mode", frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("q"):
                break

            if key == 32:  # Space bar
                # Read a fresh frame without the instruction text.
                success, photo = camera.read()

                if not success or photo is None:
                    print("ERROR: Could not capture photo.")
                    continue

                saved = cv2.imwrite("captured_photo.jpg", photo)

                if saved:
                    print("Photo saved as captured_photo.jpg")
                else:
                    print("ERROR: Could not save photo.")

    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("Photo mode closed.")


if __name__ == "__main__":
    capture_photo()