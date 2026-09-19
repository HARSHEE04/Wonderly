
import cv2
import numpy as np

from visual_features import extract_visual_features


# STEP 1: Create a white test image.
image = np.full(
    (400, 600, 3),
    255,
    dtype=np.uint8,
)

# STEP 2: Draw a red square.
cv2.rectangle(
    image,
    (50, 100),
    (200, 250),
    (0, 0, 255),
    -1,
)

# STEP 3: Draw a blue circle.
cv2.circle(
    image,
    (420, 175),
    75,
    (255, 0, 0),
    -1,
)

# STEP 4: Draw a black diagonal line.
cv2.line(
    image,
    (250, 300),
    (350, 380),
    (0, 0, 0),
    3,
)

# STEP 5: Run the combined feature extractor.
results = extract_visual_features(image)


# STEP 6: Display contour results.
print("\n===== CONTOURS =====")
print("Contours found:", results["contour_count"])


# STEP 7: Display shape results.
print("\n===== SHAPES =====")
print("Shapes detected:", results["shape_count"])

for shape in results["shapes"]:
    print(
        shape["label"],
        shape["bbox"],
    )


# STEP 8: Display dominant colors.
print("\n===== COLORS =====")
print("Dominant colors:", results["color_count"])

for color in results["colors"]:
    print(
        color["hex"],
        "Coverage:",
        color["coverage"],
    )


# STEP 9: Display detected lines.
print("\n===== LINES =====")
print("Lines detected:", results["line_count"])

for line in results["lines"]:
    print(
        line["orientation"],
        "Start:",
        line["start"],
        "End:",
        line["end"],
    )


# STEP 10: Draw detected lines on the annotated image.
annotated = results["annotated_frame"].copy()

for line in results["lines"]:

    start = (
        line["start"]["x"],
        line["start"]["y"],
    )

    end = (
        line["end"]["x"],
        line["end"]["y"],
    )

    # Draw detected line segments in yellow.
    cv2.line(
        annotated,
        start,
        end,
        (0, 255, 255),
        2,
    )


# STEP 11: Display the results.
cv2.imshow(
    "Original Image",
    image,
)

cv2.imshow(
    "Combined Shape Color and Line Detection",
    annotated,
)

print("\nClick an image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()