#!/bin/bash

# Proyo Job Saver - Icon Generator Script
# This script creates simple placeholder icons using ImageMagick
# Install ImageMagick first: brew install imagemagick

echo "🎨 Creating Proyo Job Saver icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "Install it with: brew install imagemagick"
    echo ""
    echo "Alternatively, create icons manually:"
    echo "  - icon16.png (16x16 pixels)"
    echo "  - icon48.png (48x48 pixels)"
    echo "  - icon128.png (128x128 pixels)"
    echo ""
    echo "Use any design tool or online icon generator:"
    echo "  - https://favicon.io/"
    echo "  - https://realfavicongenerator.net/"
    exit 1
fi

# Create icons directory if it doesn't exist
mkdir -p icons

# Generate 16x16 icon
convert -size 16x16 xc:black \
    -fill white \
    -font "Arial-Bold" \
    -pointsize 12 \
    -gravity center \
    -annotate +0+0 "P" \
    icons/icon16.png

# Generate 48x48 icon
convert -size 48x48 xc:black \
    -fill white \
    -font "Arial-Bold" \
    -pointsize 36 \
    -gravity center \
    -annotate +0+0 "P" \
    icons/icon48.png

# Generate 128x128 icon
convert -size 128x128 xc:black \
    -fill white \
    -font "Arial-Bold" \
    -pointsize 96 \
    -gravity center \
    -annotate +0+0 "P" \
    icons/icon128.png

echo "✅ Icons created successfully!"
echo ""
echo "Generated files:"
echo "  - icons/icon16.png"
echo "  - icons/icon48.png"
echo "  - icons/icon128.png"
echo ""
echo "You can now load the extension in Chrome!"
