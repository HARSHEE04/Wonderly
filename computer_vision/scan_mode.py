import time
from pathlib import Path

import cv2

from visual_features import extract_visual_features


SAMPLE_INTERVAL_SECONDS = 2.0
BLUR_THRESHOLD = 100.0
DUPLICATE_THRESHOLD = 5.0

# Accepted frames and their annotated versions will be saved here.
OUTPUT_DIR = Path(__file__).resolve().parent / "scan_results"


def calculate_sharpness(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(gray, cv2.CV_64F).var()


def calculate_frame_difference(frame_a, frame_b):
    size = (160, 120)

    small_a = cv2.resize(frame_a, size)
    small_b = cv2.resize(frame_b, size)

    gray_a = cv2.cvtColor(small_a, cv2.COLOR_BGR2GRAY)
    gray_b = cv2.cvtColor(small_b, cv2.COLOR_BGR2GRAY)

    difference = cv2.absdiff(gray_a, gray_b)
    return cv2.mean(difference)[0]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not camera.isOpened():
        print("ERROR: Could not open the webcam.")
        return

    print("Vision scan started.")
    print("Press Q in the camera window to quit.")
    print(f"Results will be saved in: {OUTPUT_DIR}")

    last_sample_time = time.perf_counter()
    last_accepted_frame = None

    sample_count = 0
    accepted_count = 0
    blurry_count = 0
    duplicate_count = 0

    latest_status = "Waiting for first sample..."

    try:
        while True:
            success, frame = camera.read()

            if not success or frame is None:
                print("ERROR: Could not read a frame.")
                break

            now = time.perf_counter()

            if now - last_sample_time >= SAMPLE_INTERVAL_SECONDS:
                last_sample_time = now
                sample_count += 1

                # Keep an untouched copy for analysis.
                selected_frame = frame.copy()

                # STEP 1: Reject blurry frames.
                sharpness = calculate_sharpness(selected_frame)

                if sharpness < BLUR_THRESHOLD:
                    blurry_count += 1
                    latest_status = "REJECTED: BLURRY"

                    print(
                        f"Frame #{sample_count}: BLURRY "
                        f"(sharpness={sharpness:.1f})"
                    )

                else:
                    # STEP 2: Reject frames similar to the last
                    # accepted frame.
                    if last_accepted_frame is None:
                        difference = None
                    else:
                        difference = calculate_frame_difference(
                            selected_frame,
                            last_accepted_frame,
                        )

                    if (
                        difference is not None
                        and difference < DUPLICATE_THRESHOLD
                    ):
                        duplicate_count += 1
                        latest_status = "REJECTED: DUPLICATE"

                        print(
                            f"Frame #{sample_count}: DUPLICATE "
                            f"(difference={difference:.1f})"
                        )

                    else:
                        # STEP 3: Extract features from a sharp,
                        # sufficiently distinct frame.
                        features = extract_visual_features(
                            selected_frame
                        )

                        # STEP 4: Save the original and annotated
                        # versions for inspection.
                        accepted_count += 1

                        original_path = (
                            OUTPUT_DIR
                            / f"frame_{accepted_count:03d}.jpg"
                        )
                        annotated_path = (
                            OUTPUT_DIR
                            / f"frame_{accepted_count:03d}_contours.jpg"
                        )

                        original_saved = cv2.imwrite(
                            str(original_path),
                            selected_frame,
                        )
                        annotated_saved = cv2.imwrite(
                            str(annotated_path),
                            features["annotated_frame"],
                        )

                        if not original_saved or not annotated_saved:
                            print(
                                "WARNING: Could not save one or both "
                                "images."
                            )

                        # Only accepted frames become the new
                        # duplicate-detection reference.
                        last_accepted_frame = selected_frame.copy()
                        latest_status = "ACCEPTED: FEATURES EXTRACTED"

                        print(
                            f"Frame #{sample_count}: ACCEPTED | "
                            f"sharpness={sharpness:.1f} | "
                            f"contours={features['contour_count']}"
                        )
                        print(f"  Original: {original_path.name}")
                        print(f"  Annotated: {annotated_path.name}")

            # Display statistics without modifying the image
            # used for analysis.
            cv2.putText(
                frame,
                f"Selected: {sample_count}  Accepted: {accepted_count}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )

            cv2.putText(
                frame,
                f"Blurry: {blurry_count}  Duplicate: {duplicate_count}",
                (20, 75),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 0),
                2,
            )

            cv2.putText(
                frame,
                latest_status,
                (20, 110),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 255, 255),
                2,
            )

            cv2.imshow("Vision - Continuous Scan", frame)

            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

    finally:
        camera.release()
        cv2.destroyAllWindows()

        print("\nScan stopped.")
        print(f"Total frames selected: {sample_count}")
        print(f"Accepted: {accepted_count}")
        print(f"Rejected as blurry: {blurry_count}")
        print(f"Rejected as duplicates: {duplicate_count}")


if __name__ == "__main__":
    main()