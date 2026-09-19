import time

import cv2


def main():
    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("ERROR: Could not open the webcam.")
        return

    print("Camera opened. Press Q in the video window to quit.")

    frame_count = 0
    fps_start = time.perf_counter()
    measured_fps = 0.0

    try:
        while True:
            success, frame = camera.read()

            if not success or frame is None:
                print("ERROR: Could not read a frame from the webcam.")
                break

            # Measure how many frames we actually process per second.
            frame_count += 1
            elapsed = time.perf_counter() - fps_start

            if elapsed >= 1.0:
                measured_fps = frame_count / elapsed
                frame_count = 0
                fps_start = time.perf_counter()

            # Display the latest measured FPS on the video.
            cv2.putText(
                frame,
                f"FPS: {measured_fps:.1f}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 255, 0),
                2,
            )

            cv2.imshow("Vision - Live Camera", frame)

            # The video window must be selected for Q to register.
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()
        print("Camera closed cleanly.")


if __name__ == "__main__":
    main()