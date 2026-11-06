import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

print("Starting animation synthesis...")

# 1. Load base clean image
base_rgba = Image.open('assets/login-exception-tower-clean.jpg').convert('RGBA')
W, H = base_rgba.size

# 2. Extract truck sprite with transparent background
# Truck bounding box in original image: x: 180..385, y: 550..715
truck_w = 205
truck_h = 165
truck_crop = base_rgba.crop((180, 550, 385, 715))

# Create road background without the truck
# Road slope: from (430, 470) to (0, 770). Direction vector: dx = -0.77, dy = 0.64
clean_bg = base_rgba.copy()

# Inpaint road area where the truck was:
# Road patch from (280, 480, 440, 580)
clean_road_sample = base_rgba.crop((320, 490, 420, 570))

# We can blend the road patch along the road trajectory to cover the static truck
draw_bg = ImageDraw.Draw(clean_bg)

# Road polygon coordinates in clean_bg
# Road lane runs from top-right (480, 440) to bottom-left (-20, 780)
# Road width is about 120px perpendicular to slope
road_poly = [
    (480, 440), (560, 500),
    (90, 840), (0, 770),
    (0, 680), (380, 410)
]

# Create a clean road texture by tiling road sample
road_surf = Image.new('RGBA', (W, H), (0, 0, 0, 0))
road_draw = ImageDraw.Draw(road_surf)

# Sample asphalt color from road: approx (200, 205, 218)
road_color = (205, 210, 222, 255)
line_color = (255, 255, 255, 220)
curb_color = (180, 185, 198, 255)
guide_cyan = (0, 210, 255, 200)

# Draw asphalt strip over the static truck
for offset in range(-50, 50):
    # Road center line equation: y - 630 = -0.83 * (x - 280) => y = 630 - 0.83*(x - 280)
    pass

# Better approach: mask the truck using alpha mask
# Let's create truck sprite with smooth alpha
truck_sprite = truck_crop.copy()
# Sample background color around truck (asphalt): approx (205, 210, 222)
tr_arr = np.array(truck_sprite)
# Convert pixels close to road color outside the truck silhouette to transparent
# Truck is white, blue logo, black wheels
# Let's inspect truck_sprite directly
truck_sprite.save('assets/truck_sprite.png')

print("Truck sprite saved.")
