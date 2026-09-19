
import cv2
import numpy as np


def bgr_to_hex(bgr):
    """Convert an OpenCV BGR color into a HEX color string."""

    b, g, r = [int(value) for value in bgr]

    return f"#{r:02X}{g:02X}{b:02X}"


def extract_dominant_colors(frame, num_colors=5):
    """
    Find prominent colors in an image using K-means clustering.

    Returns color IDs, HEX values, and approximate image coverage.
    """

    # Resize large images to make clustering faster.
    height, width = frame.shape[:2]

    scale = min(1.0, 200 / max(height, width))

    if scale < 1.0:
        resized = cv2.resize(
            frame,
            None,
            fx=scale,
            fy=scale,
            interpolation=cv2.INTER_AREA,
        )
    else:
        resized = frame.copy()

    # Convert the image into a list of BGR pixels.
    pixels = resized.reshape(-1, 3).astype(np.float32)

    cluster_count = min(num_colors, len(pixels))

    if cluster_count <= 0:
        return []

    # Find groups of similar colors.
    criteria = (
        cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER,
        30,
        0.2,
    )

    _, labels, centers = cv2.kmeans(
        pixels,
        cluster_count,
        None,
        criteria,
        3,
        cv2.KMEANS_PP_CENTERS,
    )

    # Count the pixels in each color group.
    counts = np.bincount(
        labels.flatten(),
        minlength=cluster_count,
    )

    # Sort colors by coverage, largest first.
    color_order = np.argsort(counts)[::-1]

    colors = []

    for index in color_order:
        center = np.clip(
            centers[index],
            0,
            255,
        ).astype(np.uint8)

        coverage = float(counts[index] / len(pixels))

        colors.append({
            "id": f"color-{len(colors) + 1}",
            "hex": bgr_to_hex(center),
            "coverage": round(coverage, 3),
        })

    return colors