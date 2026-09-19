
import cv2
import numpy as np

from visual_features import extract_visual_features


# Create a white test image.
image = np.full((400, 600, 3), 255, dtype=np.uint8)

# Red square.
cv2.rectangle(
    image,
    (50, 100),
    (200, 250),
    (0, 0, 255),
    -1,
)

# Blue circle.
cv2.circle(
    image,
    (420, 175),
    75,
    (255, 0, 0),
    -1,
)

# Black diagonal line.
cv2.line(
    image,
    (250, 300),
    (350, 380),
    (0, 0, 0),
    3,
)

# Run all five feature detectors.
results = extract_visual_features(image)


print("\n===== CONTOURS =====")
print("Contours found:", results["contour_count"])


print("\n===== SHAPES =====")
print("Shapes detected:", results["shape_count"])

for shape in results["shapes"]:
    print(shape["label"], shape["bbox"])


print("\n===== COLORS =====")
print("Dominant colors:", results["color_count"])

for color in results["colors"]:
    print(color["hex"], "Coverage:", color["coverage"])


print("\n===== LINES =====")
print("Lines detected:", results["line_count"])

for line in results["lines"]:
    print(
        line["orientation"],
        "Start:", line["start"],
        "End:", line["end"],
    )


print("\n===== TEXTURES =====")
print("Texture regions:", results["texture_count"])

for texture in results["textures"]:
    print(
        texture["id"],
        texture["label"],
        "Edge density:", texture["edgeDensity"],
        "Contrast:", texture["contrast"],
    )


print("\n===== PATTERNS =====")
print("Patterns detected:", results["pattern_count"])

for pattern in results["patterns"]:
    print(pattern["label"], pattern["patternType"])


# Show the original image and detected shapes.
cv2.imshow("Original Image", image)

cv2.imshow(
    "Combined Detection",
    results["annotated_frame"],
)

print("\nClick an image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()