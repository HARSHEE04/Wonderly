
import cv2
import numpy as np

from visual_features import extract_visual_features


# Create a blank white test image.
image = np.full((600, 900, 3), 255, dtype=np.uint8)

# Draw a filled triangle.
triangle = np.array(
    [[100, 200], [200, 50], [300, 200]],
    dtype=np.int32,
)

cv2.fillPoly(image, [triangle], (0, 0, 0))

# Draw a filled square.
cv2.rectangle(
    image,
    (380, 70),
    (530, 220),
    (0, 0, 0),
    -1,
)

# Draw a filled rectangle.
cv2.rectangle(
    image,
    (600, 80),
    (850, 200),
    (0, 0, 0),
    -1,
)

# Draw a filled circle.
cv2.circle(
    image,
    (200, 420),
    100,
    (0, 0, 0),
    -1,
)

# Extract visual features.
results = extract_visual_features(image)

print("Contours found:", results["contour_count"])
print("Shapes found:", results["shape_count"])

for shape in results["shapes"]:
    print(shape["label"], shape["bbox"])

cv2.imshow("Original Shapes", image)
cv2.imshow("Detected Shapes", results["annotated_frame"])

print("Click an image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()