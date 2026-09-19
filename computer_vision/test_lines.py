
import cv2
import numpy as np

from line_features import extract_lines


# Create a blank white image.
image = np.full(
    (500, 700, 3),
    255,
    dtype=np.uint8,
)

# Draw one horizontal line.
cv2.line(
    image,
    (50, 100),
    (300, 100),
    (0, 0, 0),
    3,
)

# Draw one vertical line.
cv2.line(
    image,
    (400, 50),
    (400, 300),
    (0, 0, 0),
    3,
)

# Draw one diagonal line.
cv2.line(
    image,
    (100, 400),
    (300, 250),
    (0, 0, 0),
    3,
)

# Detect lines.
lines = extract_lines(image)

print("Lines detected:", len(lines))

for line in lines:
    print(
        line["orientation"],
        line["start"],
        line["end"],
    )

# Draw detected lines on a copy of the image.
annotated = image.copy()

for line in lines:

    start = (
        line["start"]["x"],
        line["start"]["y"],
    )

    end = (
        line["end"]["x"],
        line["end"]["y"],
    )

    cv2.line(
        annotated,
        start,
        end,
        (0, 0, 255),
        2,
    )

cv2.imshow("Original Lines", image)

cv2.imshow("Detected Lines", annotated)

print("Click an image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()