from PIL import Image, ImageDraw
import sys

def remove_white_bg(input_path, output_path):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Flood fill from the corners
        corners = [(0, 0), (img.width - 1, 0), (0, img.height - 1), (img.width - 1, img.height - 1)]
        
        for corner in corners:
            target_color = img.getpixel(corner)
            if target_color[0] > 220 and target_color[1] > 220 and target_color[2] > 220:
                ImageDraw.floodfill(img, xy=corner, value=(255, 255, 255, 0), thresh=50)
                
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path} -> {output_path}")
    except Exception as e:
        print(f"Failed to process {input_path}: {e}")

remove_white_bg('src/assets/start.jpeg', 'src/assets/start_transparent.png')
remove_white_bg('src/assets/exit.jpeg', 'src/assets/exit_transparent.png')
