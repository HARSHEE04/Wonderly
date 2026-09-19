
import cv2
import numpy as np

from texture_features import extract_textures


# Create an image with four different regions.
image = np.full((400, 400, 3), 255, dtype=np.uint8)

# Top-left: plain white region.

# Top-right: many vertical black lines.
for x in range(210, 400, 10):
    cv2.line(
        image,
        (x, 0),
        (x, 199),
        (0, 0, 0),
        2,
    )

# Bottom-left: gray region.
image[200:400, 0:200] = (120, 120, 120)

# Bottom-right: black-and-white checkerboard.
for y in range(200, 400, 20):
    for x in range(200, 400, 20):
        if ((x - 200) // 20 + (y - 200) // 20) % 2 == 0:
            image[y:y + 20, x:x + 20] = (0, 0, 0)

# Extract texture measurements.
textures = extract_textures(image)

print("Texture regions:", len(textures))

for texture in textures:
    print(
        texture["id"],
        texture["label"],
        "Edge density:",
        texture["edgeDensity"],
        "Contrast:",
        texture["contrast"],
    )

cv2.imshow("Texture Test Image", image)

print("Click the image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()