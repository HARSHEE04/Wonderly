
import cv2
import numpy as np


def extract_textures(frame, grid_size=2):
    """
    Measure visual texture in regions of an image.

    Returns edge density, contrast, and bounding boxes.
    """

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    height, width = gray.shape

    textures = []

    # Divide the image into a grid of regions.
    for row in range(grid_size):
        for col in range(grid_size):

            x1 = col * width // grid_size
            y1 = row * height // grid_size

            x2 = (col + 1) * width // grid_size
            y2 = (row + 1) * height // grid_size

            region = gray[y1:y2, x1:x2]

            if region.size == 0:
                continue

            # Reduce noise before measuring edges.
            blurred = cv2.GaussianBlur(
                region,
                (5, 5),
                0,
            )

            edges = cv2.Canny(
                blurred,
                50,
                150,
            )

            # Fraction of pixels that belong to edges.
            edge_density = float(
                np.count_nonzero(edges) / edges.size
            )

            # Standard deviation of pixel brightness.
            contrast = float(np.std(region))

            # Simple descriptive classification.
            if edge_density >= 0.10:
                label = "high visual detail"
            elif edge_density >= 0.03:
                label = "moderate visual detail"
            else:
                label = "low visual detail"

            textures.append({
                "id": f"texture-{len(textures) + 1}",
                "label": label,
                "edgeDensity": round(edge_density, 4),
                "contrast": round(contrast, 2),
                "bbox": {
                    "x": x1,
                    "y": y1,
                    "width": x2 - x1,
                    "height": y2 - y1,
                },
            })

    return textures