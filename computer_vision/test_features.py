import cv2

from visual_features import extract_visual_features


def main():
    # Load the photo you captured earlier.
    frame = cv2.imread("captured_photo.jpg")

    if frame is None:
        print("ERROR: Could not find captured_photo.jpg")
        print("Make sure the photo is inside your Vision folder.")
        return

    # Extract visual features.
    features = extract_visual_features(frame)

    print(f"Contours found: {features['contour_count']}")

    # Display the original photo, edges, and detected contours.
    cv2.imshow("1 - Original Photo", frame)
    cv2.imshow("2 - Detected Edges", features["edges"])
    cv2.imshow(
        "3 - Detected Contours",
        features["annotated_frame"],
    )

    print("Click an image window and press any key to close.")
    cv2.waitKey(0)
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()