
import cv2
import json
import sys

from visual_features import extract_visual_features


def to_scene_analysis(results):
    """
    Convert actual OpenCV detections into Wonderly's
    SceneAnalysis format.

    Keep the output limited to the fields currently
    defined in the backend's TypeScript contract.
    """

    # COLORS
    colors = []

    for color in results["colors"]:
        colors.append({
            "id": color["id"],
            "hex": color["hex"],
        })

    # SHAPES
    shapes = []

    for shape in results["shapes"]:
        shapes.append({
            "id": shape["id"],
            "label": shape["label"],
        })

    # TEXTURES
    textures = []

    for texture in results["textures"]:
        textures.append({
            "id": texture["id"],
            "label": texture["label"],
        })

    # LINES
    lines = []

    for line in results["lines"]:
        lines.append({
            "id": line["id"],
            "label": line["orientation"],
            "orientation": line["orientation"],
        })

    # PATTERNS
    patterns = []

    for pattern in results["patterns"]:
        patterns.append({
            "id": pattern["id"],
            "label": pattern["label"],
            "patternType": pattern["patternType"],
        })

    # Assemble Wonderly's SceneAnalysis object.
    scene_analysis = {
        "colors": colors,
        "shapes": shapes,
        "textures": textures,
        "lines": lines,
        "patterns": patterns,

        # Object recognition is handled separately by the AI.
        # We do not invent semantic object detections.
        "semanticObjects": [],
    }

    return scene_analysis


def analyze_image(image_path):
    """Load an actual image and produce SceneAnalysis."""

    frame = cv2.imread(image_path)

    if frame is None:
        raise FileNotFoundError(
            f"Could not open image: {image_path}"
        )

    # Run your existing five feature detectors.
    results = extract_visual_features(frame)

    # Convert their results to the backend format.
    scene_analysis = to_scene_analysis(results)

    return scene_analysis


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print(
            "Usage: python scene_analysis.py "
            "<image_path>"
        )
        sys.exit(1)

    image_path = sys.argv[1]

    try:
        scene_analysis = analyze_image(image_path)

    except (FileNotFoundError, cv2.error) as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)

    # Print valid JSON.
    print(
        json.dumps(
            scene_analysis,
            indent=2,
        )
    )