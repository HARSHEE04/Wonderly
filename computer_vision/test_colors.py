
import cv2
import numpy as np

from color_features import extract_dominant_colors


# Create a test image with three clearly defined color regions.
image = np.zeros((300, 600, 3), dtype=np.uint8)

# OpenCV uses BGR rather than RGB.
image[:, 0:200] = (0, 0, 255)       # Red
image[:, 200:400] = (0, 255, 0)     # Green
image[:, 400:600] = (255, 0, 0)     # Blue

colors = extract_dominant_colors(image, num_colors=3)

print("Dominant colors:")

for color in colors:
    print(color)

cv2.imshow("Color Test Image", image)

print("Click the image window and press any key to close.")

cv2.waitKey(0)
cv2.destroyAllWindows()