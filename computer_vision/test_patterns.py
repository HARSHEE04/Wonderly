
import cv2
import numpy as np

from pattern_features import extract_patterns


def show_result(name, image):
    """Run pattern detection and print the results."""

    patterns = extract_patterns(image)

    print(f"\n===== {name} =====")
    print("Patterns detected:", len(patterns))

    for pattern in patterns:
        print(pattern["label"], pattern["patternType"])

    cv2.imshow(name, image)


# TEST 1: Vertical stripes.
stripes = np.full((300, 300, 3), 255, dtype=np.uint8)

for x in range(20, 280, 30):
    cv2.line(
        stripes,
        (x, 0),
        (x, 299),
        (0, 0, 0),
        3,
    )

show_result("Vertical Stripes", stripes)


# TEST 2: Checkerboard.
checkerboard = np.full((300, 300, 3), 255, dtype=np.uint8)

for y in range(0, 300, 30):
    for x in range(0, 300, 30):
        if (x // 30 + y // 30) % 2 == 0:
            checkerboard[y:y + 30, x:x + 30] = (0, 0, 0)

show_result("Checkerboard", checkerboard)


# TEST 3: Repeated dots.
dots = np.full((300, 300, 3), 255, dtype=np.uint8)

for y in range(40, 280, 50):
    for x in range(40, 280, 50):
        cv2.circle(
            dots,
            (x, y),
            8,
            (0, 0, 0),
            -1,
        )

show_result("Repeated Dots", dots)


# TEST 4: Plain white background.
plain = np.full((300, 300, 3), 255, dtype=np.uint8)

show_result("Plain Background", plain)


print("\nClick an image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()