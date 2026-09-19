
import cv2
import numpy as np


def regular_spacing(positions):
    """
    Check whether positions are approximately evenly spaced.
    Return the average spacing or None.
    """

    positions = sorted(set(int(p) for p in positions))

    if len(positions) < 4:
        return None

    gaps = np.diff(positions).astype(float)

    mean_gap = float(np.mean(gaps))

    if mean_gap < 6:
        return None

    variation = float(np.std(gaps) / mean_gap)

    if variation <= 0.20:
        return round(mean_gap, 2)

    return None


def group_nearby_positions(positions, max_gap=3):
    """Combine nearby pixel positions into single line locations."""

    if len(positions) == 0:
        return []

    groups = [[int(positions[0])]]

    for position in positions[1:]:
        position = int(position)

        if position - groups[-1][-1] <= max_gap:
            groups[-1].append(position)
        else:
            groups.append([position])

    return [
        int(round(np.mean(group)))
        for group in groups
    ]


def find_grid_spacing(gray):
    """
    Find repeated horizontal and vertical boundaries.

    Repetition in both directions can indicate a grid
    or checkerboard.
    """

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blurred, 50, 150)

    height, width = gray.shape

    column_density = np.count_nonzero(edges, axis=0) / height
    row_density = np.count_nonzero(edges, axis=1) / width

    vertical_positions = np.flatnonzero(column_density >= 0.55)
    horizontal_positions = np.flatnonzero(row_density >= 0.55)

    vertical_positions = group_nearby_positions(
        vertical_positions
    )

    horizontal_positions = group_nearby_positions(
        horizontal_positions
    )

    return (
        regular_spacing(vertical_positions),
        regular_spacing(horizontal_positions),
    )


def find_stripe_spacing(gray):
    """
    Detect regularly spaced dark or light bands.

    Unlike Canny edge detection, this measures the centers
    of bands, avoiding duplicate edges around thick stripes.
    """

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    _, dark_mask = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )

    # Also check light stripes on a dark background.
    light_mask = cv2.bitwise_not(dark_mask)

    for mask in (dark_mask, light_mask):

        # Fraction of each column or row covered by the band.
        column_coverage = np.mean(mask > 0, axis=0)
        row_coverage = np.mean(mask > 0, axis=1)

        vertical_positions = np.flatnonzero(
            column_coverage >= 0.70
        )

        horizontal_positions = np.flatnonzero(
            row_coverage >= 0.70
        )

        vertical_centers = group_nearby_positions(
            vertical_positions,
            max_gap=1,
        )

        horizontal_centers = group_nearby_positions(
            horizontal_positions,
            max_gap=1,
        )

        vertical_spacing = regular_spacing(vertical_centers)
        horizontal_spacing = regular_spacing(horizontal_centers)

        if vertical_spacing is not None:
            return vertical_spacing, None

        if horizontal_spacing is not None:
            return None, horizontal_spacing

    return None, None


def find_repeated_dots(gray):
    """Detect approximately regularly arranged circular blobs."""

    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    _, binary = cv2.threshold(
        blurred,
        0,
        255,
        cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU,
    )

    contours, _ = cv2.findContours(
        binary,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE,
    )

    dots = []

    for contour in contours:

        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)

        if area < 30 or perimeter == 0:
            continue

        circularity = (
            4 * np.pi * area / (perimeter * perimeter)
        )

        if circularity < 0.75:
            continue

        x, y, w, h = cv2.boundingRect(contour)

        if abs(w - h) > max(w, h) * 0.25:
            continue

        dots.append({
            "x": x + w / 2,
            "y": y + h / 2,
            "area": area,
        })

    if len(dots) < 6:
        return False

    areas = np.array([dot["area"] for dot in dots])

    if np.std(areas) / np.mean(areas) > 0.25:
        return False

    def count_coordinate_groups(values, tolerance=8):

        groups = []

        for value in sorted(values):

            if not groups or value - groups[-1][-1] > tolerance:
                groups.append([value])
            else:
                groups[-1].append(value)

        return len(groups)

    rows = count_coordinate_groups(
        [dot["y"] for dot in dots]
    )

    columns = count_coordinate_groups(
        [dot["x"] for dot in dots]
    )

    return rows >= 2 and columns >= 2


def extract_patterns(frame):
    """
    Detect simple repeated geometric structures.

    Supported:
    - Vertical or horizontal stripes
    - Grids or checkerboards
    - Repeated circular elements
    """

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    patterns = []

    # First, look for a grid in both directions.
    grid_vertical, grid_horizontal = find_grid_spacing(gray)

    if (
        grid_vertical is not None
        and grid_horizontal is not None
    ):
        patterns.append({
            "id": f"pattern-{len(patterns) + 1}",
            "label": "grid or checkerboard",
            "patternType": "grid",
            "verticalSpacing": grid_vertical,
            "horizontalSpacing": grid_horizontal,
        })

    else:
        # Look for regularly spaced stripes.
        stripe_vertical, stripe_horizontal = find_stripe_spacing(
            gray
        )

        if stripe_vertical is not None:
            patterns.append({
                "id": f"pattern-{len(patterns) + 1}",
                "label": "vertical stripes",
                "patternType": "stripes",
                "orientation": "vertical",
                "spacing": stripe_vertical,
            })

        elif stripe_horizontal is not None:
            patterns.append({
                "id": f"pattern-{len(patterns) + 1}",
                "label": "horizontal stripes",
                "patternType": "stripes",
                "orientation": "horizontal",
                "spacing": stripe_horizontal,
            })

    # Look for repeated circular elements.
    if find_repeated_dots(gray):
        patterns.append({
            "id": f"pattern-{len(patterns) + 1}",
            "label": "repeated circular elements",
            "patternType": "dots",
        })

    return patterns