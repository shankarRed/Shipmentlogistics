import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

print("Generating 24-frame animated Control Tower GIF...")

# Load high-res base image
base = Image.open('assets/login-exception-tower-clean.jpg').convert('RGBA')
W, H = base.size

# --- 1. PREPARE CLEAN ROAD (remove static bottom truck so moving trucks can drive over it) ---
# Bottom truck sits between x: 170..390, y: 540..720.
# The road angle: vector dx = -1.15, dy = 1.0 (approx 41 degrees from vertical)
# We can clone clean road from upstream (x: 270..420, y: 470..570) down across the truck area.

clean_bg = base.copy()

# Sample of pristine road with lane dashes and cyan guide line
# From x: 300..430, y: 470..560
road_sample = base.crop((310, 475, 410, 545))

# We can stamp the clean road along the road axis to erase the static truck
# Road slope: y increases by ~0.87 for every -1 in x
for step in range(1, 4):
    shift_x = int(- step * 65)
    shift_y = int(step * 56)
    clean_bg.paste(road_sample, (310 + shift_x, 475 + shift_y))

# Save clean background
clean_bg.save('assets/road_cleaned_bg.png')
print("Clean road background created.")

# --- 2. EXTRACT PRECISE TRUCK SPRITE WITH TRANSPARENT MASK ---
truck_crop = base.crop((175, 545, 385, 715)).convert('RGBA')
tw, th = truck_crop.size

# Create alpha mask for the truck:
# Pixels belonging to truck are:
# - White trailer & cab: high brightness, low saturation
# - Blue logo: (R < 100, B > 140)
# - Dark wheels: (R < 90, G < 95, B < 110)
# Pixels belonging to road: (R ~ 200..235, G ~ 205..235, B ~ 215..245)
# We can use polygon mask of truck boundary for ultra-clean edges
mask_img = Image.new('L', (tw, th), 0)
mask_draw = ImageDraw.Draw(mask_img)

# Truck polygon coordinates within the 210x170 crop:
# Trailer top roof: (35, 15) -> (155, 95)
# Trailer front edge: (155, 95) -> (155, 120)
# Cab roof: (155, 100) -> (175, 110)
# Cab windshield: (175, 110) -> (195, 125)
# Cab bumper: (195, 125) -> (195, 148)
# Cab front wheel: (195, 148) -> (165, 165)
# Trailer bottom/wheels: (165, 165) -> (50, 95)
# Trailer rear: (50, 95) -> (35, 15)
truck_poly = [
    (38, 14), (155, 94), (160, 97), (175, 108), 
    (196, 124), (200, 140), (196, 150), (165, 165),
    (155, 158), (145, 145), (120, 130), (95, 115),
    (75, 102), (48, 85), (40, 78), (35, 15)
]
mask_draw.polygon(truck_poly, fill=255)
# Feather mask slightly for anti-aliased edges
mask_img = mask_img.filter(ImageFilter.GaussianBlur(1.0))

truck_sprite = Image.new('RGBA', (tw, th), (0, 0, 0, 0))
truck_sprite.paste(truck_crop, (0, 0), mask_img)
truck_sprite.save('assets/clean_truck_sprite.png')
print("Clean truck sprite with alpha mask created.")

# --- 3. GENERATE 24 ANIMATION FRAMES ---
NUM_FRAMES = 24
frames = []

# Road trajectory equation:
# Truck moves along vector: dx = -15, dy = 13 per step
# Road line starts at (450, 400) and exits at (-150, 850)
road_total_dist = 600

# Robotic arm position in base image: (470, 430)
# Conveyor scanner position: (625, 395)
# Radar screen: (240, 180, 540, 310)

for f in range(NUM_FRAMES):
    phase = f / NUM_FRAMES
    frame = clean_bg.copy()
    draw = ImageDraw.Draw(frame, 'RGBA')
    
    # -------------------------------------------------------------
    # A. ANIMATED TRUCKS DRIVING ON THE HIGHWAY
    # -------------------------------------------------------------
    # Two trucks loop along the highway road
    for truck_idx in [0, 1]:
        # Offset each truck by half a cycle
        t_phase = (phase + truck_idx * 0.5) % 1.0
        
        # Start high on the road and drive down to bottom-left off-screen
        # Start: (360, 400), End: (-120, 780)
        start_x, start_y = 350, 410
        end_x, end_y = -100, 770
        
        tx = int(start_x + (end_x - start_x) * t_phase)
        ty = int(start_y + (end_y - start_y) * t_phase)
        
        # Draw headlight beam onto road in front of the truck
        headlight_x = tx + 195
        headlight_y = ty + 140
        beam_poly = [
            (headlight_x, headlight_y),
            (headlight_x + 55, headlight_y + 35),
            (headlight_x + 35, headlight_y + 55)
        ]
        # Soft glowing headlight cone
        draw.polygon(beam_poly, fill=(255, 255, 220, 45))
        draw.ellipse((headlight_x - 3, headlight_y - 3, headlight_x + 3, headlight_y + 3), fill=(255, 255, 240, 230))
        
        # Paste truck sprite
        frame.paste(truck_sprite, (tx, ty), truck_sprite)
    
    # -------------------------------------------------------------
    # B. ANIMATED ROBOTIC SORTING ARM & MOVING CONVEYOR PACKAGES
    # -------------------------------------------------------------
    # Robotic arm base is at (470, 440)
    # The arm pivots with sinusoidal motion
    arm_angle = math.sin(phase * 2 * math.pi) * 0.35
    arm_base_x, arm_base_y = 472, 445
    
    # Arm joint 1:
    j1_len = 38
    j1_x = int(arm_base_x + j1_len * math.cos(-1.8 + arm_angle * 0.5))
    j1_y = int(arm_base_y + j1_len * math.sin(-1.8 + arm_angle * 0.5))
    
    # Arm joint 2 (forearm extending to claw):
    j2_len = 42
    j2_x = int(j1_x + j2_len * math.cos(0.5 + arm_angle))
    j2_y = int(j1_y + j2_len * math.sin(0.5 + arm_angle))
    
    # Draw articulated robot arm
    draw.line([(arm_base_x, arm_base_y), (j1_x, j1_y)], fill=(235, 240, 248, 255), width=6)
    draw.line([(j1_x, j1_y), (j2_x, j2_y)], fill=(215, 225, 238, 255), width=4)
    # Joint bearings
    draw.ellipse((arm_base_x-5, arm_base_y-5, arm_base_x+5, arm_base_y+5), fill=(100, 115, 135, 255))
    draw.ellipse((j1_x-4, j1_y-4, j1_x+4, j1_y+4), fill=(70, 85, 110, 255))
    draw.ellipse((j2_x-3, j2_y-3, j2_x+3, j2_y+3), fill=(0, 210, 255, 255)) # Glowing cyan sensor on claw
    
    # Robot laser guidance beam
    laser_alpha = int(120 + 90 * math.sin(phase * 4 * math.pi))
    draw.line([(j2_x, j2_y), (j2_x + 8, j2_y + 14)], fill=(0, 230, 255, laser_alpha), width=2)
    
    # Conveyor belt packages sliding smoothly along belt:
    # Belt runs from (430, 480) down-left to (340, 540)
    for p_idx in range(4):
        p_phase = (phase + p_idx * 0.25) % 1.0
        bx = int(430 + (320 - 430) * p_phase)
        by = int(475 + (545 - 475) * p_phase)
        # Draw 3D package box
        draw.polygon([(bx, by), (bx+12, by-7), (bx+20, by-3), (bx+8, by+4)], fill=(220, 190, 150, 255))
        draw.polygon([(bx, by), (bx+8, by+4), (bx+8, by+14), (bx, by+10)], fill=(190, 160, 120, 255))
        draw.polygon([(bx+8, by+4), (bx+20, by-3), (bx+20, by+7), (bx+8, by+14)], fill=(170, 140, 105, 255))
        # Blue telemetry RFID tag on package
        draw.ellipse((bx+7, by+2, bx+11, by+6), fill=(0, 170, 255, 220))
        
    # -------------------------------------------------------------
    # C. ELECTRONIC SCANNER WITH SCANNING LASER BEAM
    # -------------------------------------------------------------
    # Scanner tunnel arch at (620, 375, 655, 435)
    scanner_scan_pos = math.sin(phase * 2 * math.pi) * 16
    scan_y1 = int(380 + scanner_scan_pos)
    scan_y2 = int(420 + scanner_scan_pos)
    
    # Vertical glowing cyan laser beam inside scanner
    draw.line([(628, scan_y1), (648, scan_y2)], fill=(0, 240, 255, 200), width=3)
    draw.line([(628, scan_y1), (648, scan_y2)], fill=(255, 255, 255, 230), width=1)
    
    # Scanner status indicator HUD LED (Blinking Cyan & Green)
    hud_color = (0, 230, 120, 255) if math.sin(phase * 3 * math.pi) > 0 else (0, 190, 255, 255)
    draw.ellipse((605, 395, 613, 403), fill=hud_color)
    
    # -------------------------------------------------------------
    # D. AUTONOMOUS AGV ROBOT ON FACTORY FLOOR
    # -------------------------------------------------------------
    # Small AGV bot moves back and forth near (370, 560) to (420, 530)
    agv_t = (math.sin(phase * 2 * math.pi) + 1) * 0.5
    agv_x = int(365 + (415 - 365) * agv_t)
    agv_y = int(570 + (535 - 570) * agv_t)
    
    # Draw AGV bot (isometric disc with chassis)
    draw.ellipse((agv_x - 12, agv_y - 6, agv_x + 12, agv_y + 6), fill=(70, 85, 105, 255))
    draw.ellipse((agv_x - 10, agv_y - 8, agv_x + 10, agv_y + 4), fill=(240, 245, 252, 255))
    # Blinking amber warning strobe beacon on top
    beacon_color = (255, 170, 0, 255) if (f % 4 < 2) else (180, 100, 0, 180)
    draw.ellipse((agv_x - 3, agv_y - 12, agv_x + 3, agv_y - 6), fill=beacon_color)
    
    # -------------------------------------------------------------
    # E. CONTROL TOWER RADAR & EXCEPTION TELEMETRY DISPLAY
    # -------------------------------------------------------------
    # Panoramic control room screen center: approx (320, 215)
    # Draw rotating cyan radar beam sweep
    radar_cx, radar_cy = 310, 210
    radar_radius = 45
    radar_angle = phase * 2 * math.pi
    radar_tx = radar_cx + radar_radius * math.cos(radar_angle)
    radar_ty = radar_cy + (radar_radius * 0.55) * math.sin(radar_angle)
    
    # Radar sweep line
    draw.line([(radar_cx, radar_cy), (radar_tx, radar_ty)], fill=(0, 240, 255, 180), width=2)
    # Pulsing radar blip at sweep tip
    blip_alpha = int(140 + 100 * math.sin(phase * 6 * math.pi))
    draw.ellipse((radar_tx - 4, radar_ty - 4, radar_tx + 4, radar_ty + 4), fill=(0, 255, 200, blip_alpha))
    
    # Digital signs "PACKAGE EXCEPTION" pulse with amber warning glow
    sign_glow = int(120 + 100 * math.sin(phase * 2 * math.pi))
    # Sign 1: approx (145, 520)
    draw.rectangle([140, 518, 160, 532], outline=(255, 160, 0, sign_glow), width=2)
    # Sign 2: approx (315, 435)
    draw.rectangle([315, 435, 335, 450], outline=(255, 160, 0, sign_glow), width=2)
    
    # -------------------------------------------------------------
    # F. DOCKED TRUCKS STATUS BEACONS
    # -------------------------------------------------------------
    # Lower docked truck at (700, 520): cargo door transfer light
    dock_light = (0, 240, 120, 240) if (f % 6 < 3) else (0, 160, 255, 240)
    draw.ellipse((712, 545, 718, 551), fill=dock_light)
    
    # Convert RGBA to RGB for GIF palette optimization
    # Ensure background blending
    bg_rgb = Image.new("RGB", (W, H), (255, 255, 255))
    bg_rgb.paste(frame, mask=frame.split()[3])
    
    # Downscale slightly for super-fast web load while maintaining ultra crisp quality (e.g. 1080px wide)
    # Or keep at 1200px
    target_w = 1200
    target_h = int(H * (target_w / W))
    frame_opt = bg_rgb.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Quantize to 128 colors with palette for fast load and small file size
    frame_quant = frame_opt.quantize(colors=128, method=Image.Quantize.MEDIANCUT)
    frames.append(frame_quant)
    print(f"Frame {f+1}/{NUM_FRAMES} rendered.")

# Save optimized animated GIF
gif_path = 'assets/login-exception-tower.gif'
frames[0].save(
    gif_path,
    save_all=True,
    append_images=frames[1:],
    duration=75, # 75ms per frame = ~13 fps, super smooth
    loop=0,
    optimize=True
)

print(f"Animated GIF successfully generated and saved to {gif_path}!")
