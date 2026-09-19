
import time
import json
from pathlib import Path
from datetime import datetime

import cv2

from visual_features import extract_visual_features
from scene_analysis import to_scene_analysis


SAMPLE_INTERVAL_SECONDS = 2.0
BLUR_THRESHOLD = 100.0
DUPLICATE_THRESHOLD = 5.0

# Save accepted frames, annotations, and JSON in one folder.
OUTPUT_DIR = Path(__file__).resolve().parent / "scan_results"


def calculate_sharpness(frame):
    """Measure image sharpness using Laplacian variance."""

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    return cv2.Laplacian(
        gray,
        cv2.CV_64F,
    ).var()


def calculate_frame_difference(frame_a, frame_b):
    """Measure pixel differences between two frames."""

    size = (160, 120)

    small_a = cv2.resize(frame_a, size)
    small_b = cv2.resize(frame_b, size)

    gray_a = cv2.cvtColor(
        small_a,
        cv2.COLOR_BGR2GRAY,
    )

    gray_b = cv2.cvtColor(
        small_b,
        cv2.COLOR_BGR2GRAY,
    )

    difference = cv2.absdiff(
        gray_a,
        gray_b,
    )

    return cv2.mean(difference)[0]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    camera = cv2.VideoCapture(
        0,
        cv2.CAP_DSHOW,
    )

    if not camera.isOpened():
        print("ERROR: Could not open the webcam.")
        return

    print("Wonderly continuous scan started.")
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
                sharpness = calculate_sharpness(
                    selected_frame
                )

                if sharpness < BLUR_THRESHOLD:

                    blurry_count += 1
                    latest_status = "REJECTED: BLURRY"

                    print(
                        f"Frame #{sample_count}: BLURRY "
                        f"(sharpness={sharpness:.1f})"
                    )

                else:

                    # STEP 2: Reject frames similar to the
                    # last accepted frame.
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

                        # STEP 3: Extract all five visual
                        # feature categories.
                        features = extract_visual_features(
                            selected_frame
                        )

                        # STEP 4: Convert the extracted features
                        # to Wonderly's SceneAnalysis format.
                        scene_analysis = to_scene_analysis(
                            features
                        )

                        # STEP 5: Create unique filenames
                        # so previous captures are not overwritten.
                        timestamp = datetime.now().strftime(
                            "%Y%m%d_%H%M%S_%f"
                        )

                        frame_id = (
                            f"frame_{timestamp}_"
                            f"{accepted_count + 1:03d}"
                        )

                        original_path = (
                            OUTPUT_DIR / f"{frame_id}.jpg"
                        )

                        annotated_path = (
                            OUTPUT_DIR
                            / f"{frame_id}_contours.jpg"
                        )

                        json_path = (
                            OUTPUT_DIR
                            / f"{frame_id}_scene.json"
                        )

                        # STEP 6: Save the original photograph.
                        original_saved = cv2.imwrite(
                            str(original_path),
                            selected_frame,
                        )

                        # Save the annotated image for debugging.
                        annotated_saved = cv2.imwrite(
                            str(annotated_path),
                            features["annotated_frame"],
                        )

                        if not original_saved or not annotated_saved:

                            print(
                                "WARNING: Could not save one or "
                                "both images."
                            )

                            latest_status = "ERROR: IMAGE SAVE FAILED"
                            continue

                        # STEP 7: Save the JSON corresponding
                        # to this exact accepted frame.
                        try:

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

                        except OSError as error:

                            print(
                                f"ERROR: Could not save JSON: {error}"
                            )

                            latest_status = "ERROR: JSON SAVE FAILED"
                            continue

                        # STEP 8: Update the duplicate reference
                        # only after saving the frame and JSON.
                        last_accepted_frame = selected_frame.copy()

                        accepted_count += 1

                        latest_status = (
                            "ACCEPTED: IMAGE + JSON SAVED"
                        )

                        print(
                            f"\nFrame #{sample_count}: ACCEPTED | "
                            f"sharpness={sharpness:.1f}"
                        )

                        print(
                            f"  Shapes: "
                            f"{len(scene_analysis['shapes'])}"
                        )

                        print(
                            f"  Colors: "
                            f"{len(scene_analysis['colors'])}"
                        )

                        print(
                            f"  Lines: "
                            f"{len(scene_analysis['lines'])}"
                        )

                        print(
                            f"  Textures: "
                            f"{len(scene_analysis['textures'])}"
                        )

                        print(
                            f"  Patterns: "
                            f"{len(scene_analysis['patterns'])}"
                        )

                        print(
                            f"  Original: {original_path.name}"
                        )

                        print(
                            f"  Annotated: {annotated_path.name}"
                        )

                        print(
                            f"  SceneAnalysis: {json_path.name}\n"
                        )

            # Display statistics without modifying
            # the image used for analysis.
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

            cv2.imshow(
                "Wonderly - Continuous Scan",
                frame,
            )

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