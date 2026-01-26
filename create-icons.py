#!/usr/bin/env python3
"""
Proyo Job Saver - Icon Generator (Python version)
Creates simple placeholder icons using PIL/Pillow
Install: pip install pillow
"""

import os
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("❌ Pillow library is not installed.")
    print("Install it with: pip install pillow")
    print("")
    print("Alternatively, create icons manually:")
    print("  - icon16.png (16x16 pixels)")
    print("  - icon48.png (48x48 pixels)")
    print("  - icon128.png (128x128 pixels)")
    print("")
    print("Use any design tool or online icon generator:")
    print("  - https://favicon.io/")
    print("  - https://realfavicongenerator.net/")
    exit(1)

def create_icon(size, output_path):
    """Create a simple icon with letter 'P' on black background"""
    # Create black background
    img = Image.new('RGB', (size, size), color='black')
    draw = ImageDraw.Draw(img)

    # Calculate font size (roughly 75% of image size)
    font_size = int(size * 0.75)

    # Try to use a default system font
    try:
        # Try different font paths for different systems
        font_paths = [
            '/System/Library/Fonts/Helvetica.ttc',  # macOS
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',  # Linux
            'C:\\Windows\\Fonts\\Arial.ttf',  # Windows
        ]

        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, font_size)
                break

        if font is None:
            # Use default font as fallback
            font = ImageFont.load_default()
    except:
        # Use default font if everything fails
        font = ImageFont.load_default()

    # Draw white 'P' centered
    text = "P"

    # Get text bounding box for centering
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Calculate position to center text
    position = ((size - text_width) // 2 - bbox[0], (size - text_height) // 2 - bbox[1])

    # Draw the text
    draw.text(position, text, fill='white', font=font)

    # Save the image
    img.save(output_path)
    print(f"✅ Created: {output_path}")

def main():
    print("🎨 Creating Proyo Job Saver icons...")
    print()

    # Create icons directory
    icons_dir = Path('icons')
    icons_dir.mkdir(exist_ok=True)

    # Create icons in different sizes
    sizes = [(16, 'icon16.png'), (48, 'icon48.png'), (128, 'icon128.png')]

    for size, filename in sizes:
        output_path = icons_dir / filename
        create_icon(size, output_path)

    print()
    print("✅ Icons created successfully!")
    print()
    print("Generated files:")
    print("  - icons/icon16.png")
    print("  - icons/icon48.png")
    print("  - icons/icon128.png")
    print()
    print("You can now load the extension in Chrome!")

if __name__ == '__main__':
    main()
