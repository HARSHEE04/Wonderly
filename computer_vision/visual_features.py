
import cv2
import math

from color_features import extract_dominant_colors
from line_features import extract_lines
from texture_features import extract_textures
from pattern_features import extract_patterns


def classify_shape(contour):
    """Classify a contour using its approximated polygon."""

    perimeter = cv2.arcLength(contour, True)

    if perimeter == 0:
        return "unknown"

    approximation = cv2.approxPolyDP(
        contour,
        0.04 * perimeter,
        True,
    )

    vertices = len(approximation)

    if vertices == 3:
        return "triangle"

    if vertices == 4:
        x, y, w, h = cv2.boundingRect(approximation)

        if h == 0:
            return "unknown"

        aspect_ratio = w / h

        if 0.90 <= aspect_ratio <= 1.10:
            return "square"

        return "rectangle"

    if vertices == 5:
        return "pentagon"

    if vertices == 6:
        return "hexagon"

    area = cv2.contourArea(contour)

    circularity = (
        4 * math.pi * area / (perimeter ** 2)
    )

    if circularity >= 0.80:
        return "circle"

    return "irregular"


def is_duplicate_shape(new_shape, existing_shapes):
    """Check whether a shape has already been detected."""

    new_box = new_shape["bbox"]

    for existing_shape in existing_shapes:

        old_box = existing_shape["bbox"]

        same_position = (
            abs(old_box["x"] - new_box["x"]) <= 5
            and abs(old_box["y"] - new_box["y"]) <= 5
        )

        same_size = (
            abs(old_box["width"] - new_box["width"]) <= 5
            and abs(old_box["height"] - new_box["height"]) <= 5
        )

        if same_position and same_size:
            return True

    return False


def extract_visual_features(frame):
    """
    Extract five categories of visual features:

    1. Shapes
    2. Colors
    3. Lines
    4. Textures
    5. Patterns

    Also returns the original contour data and
    an annotated image for debugging.
    """

    # STEP 1: Prepare the image.

    gray = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2GRAY,
    )

    blurred = cv2.GaussianBlur(
        gray,
        (5, 5),
        0,
    )

    # STEP 2: Detect edges.

    edges = cv2.Canny(
        blurred,
        50,
        150,
    )

    # STEP 3: Find contours.

    contours, _ = cv2.findContours(
        edges,
        cv2.RETR_LIST,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    significant_contours = [
        contour
        for contour in contours
        if cv2.contourArea(contour) >= 20
    ]

    annotated_frame = frame.copy()

    # Draw contour outlines in green.

    cv2.drawContours(
        annotated_frame,
        significant_contours,
        -1,
        (0, 255, 0),
        2,
    )

    # STEP 4: Classify geometric shapes.

    shapes = []

    minimum_shape_area = 500

    for contour in significant_contours:

        area = cv2.contourArea(contour)

        if area < minimum_shape_area:
            continue

        shape_name = classify_shape(contour)

        if shape_name in ("unknown", "irregular"):
            continue

        x, y, w, h = cv2.boundingRect(contour)

        shape = {
            "id": f"shape-{len(shapes) + 1}",
            "label": shape_name,
            "contourId": f"contour-{len(shapes) + 1}",
            "bbox": {
                "x": x,
                "y": y,
                "width": w,
                "height": h,
            },
            "area": area,
        }

        if is_duplicate_shape(shape, shapes):
            continue

        shapes.append(shape)

        # Draw the bounding box in blue.

        cv2.rectangle(
            annotated_frame,
            (x, y),
            (x + w, y + h),
            (255, 0, 0),
            2,
        )

        # Display the shape label in red.

        cv2.putText(
            annotated_frame,
            shape_name,
            (x, max(y - 10, 20)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 0, 255),
            2,
        )

    # STEP 5: Extract dominant colors.

    colors = extract_dominant_colors(
        frame,
        num_colors=5,
    )

    # STEP 6: Detect straight lines.

    lines = extract_lines(frame)

    # STEP 7: Measure visual textures.

    textures = extract_textures(
        frame,
        grid_size=2,
    )

    # STEP 8: Detect repeated visual patterns.

    patterns = extract_patterns(frame)

    # STEP 9: Return all features.

    return {
        "edges": edges,
        "contours": significant_contours,
        "annotated_frame": annotated_frame,
        "contour_count": len(significant_contours),

        "shapes": shapes,
        "shape_count": len(shapes),

        "colors": colors,
        "color_count": len(colors),

        "lines": lines,
        "line_count": len(lines),

        "textures": textures,
        "texture_count": len(textures),

        "patterns": patterns,
        "pattern_count": len(patterns),
    }