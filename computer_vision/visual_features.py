import cv2


def extract_visual_features(frame):
    """Find edges and contours in an image."""

    # Convert to grayscale and reduce camera noise.
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Detect edges.
    edges = cv2.Canny(blurred, 50, 150)

    # RETR_LIST keeps more contours than RETR_EXTERNAL.
    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_LIST,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    # Keep smaller contours so we can see more image details.
    significant_contours = [
        contour
        for contour in contours
        if cv2.contourArea(contour) >= 20
    ]

    # Draw detected contours on a copy of the photo.
    annotated_frame = frame.copy()

    cv2.drawContours(
        annotated_frame,
        significant_contours,
        -1,
        (0, 255, 0),
        2,
    )

    return {
        "edges": edges,
        "contours": significant_contours,
        "annotated_frame": annotated_frame,
        "contour_count": len(significant_contours),
    }