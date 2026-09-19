
import cv2
import math


def classify_line_orientation(x1, y1, x2, y2):
    """Classify a line using its angle."""

    angle = math.degrees(
        math.atan2(y2 - y1, x2 - x1)
    )

    # Normalize the angle to the range 0–180 degrees.
    angle = angle % 180

    if angle <= 10 or angle >= 170:
        return "horizontal"

    if 80 <= angle <= 100:
        return "vertical"

    return "diagonal"


def extract_lines(frame, min_line_length=40):
    """
    Detect straight line segments using the Hough Line Transform.

    Returns line IDs, orientations, and pixel coordinates.
    """

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY,
    )

    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0,
    )

    edges = cv2.Canny(
        blurred,
        50,
        150,
    )

    detected_lines = cv2.HoughLinesP(
        edges,
        rho=1,
        theta=math.pi / 180,
        threshold=50,
        minLineLength=min_line_length,
        maxLineGap=10,
    )

    lines = []

    if detected_lines is None:
        return lines

    for detected_line in detected_lines:

        x1, y1, x2, y2 = [
            int(value)
            for value in detected_line[0]
        ]

        orientation = classify_line_orientation(
            x1, y1, x2, y2
        )

        lines.append({
            "id": f"line-{len(lines) + 1}",
            "label": orientation,
            "orientation": orientation,
            "start": {
                "x": x1,
                "y": y1,
            },
            "end": {
                "x": x2,
                "y": y2,
            },
        })

    return lines