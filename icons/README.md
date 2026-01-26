# Extension Icons

This directory needs three PNG icon files for the Chrome extension:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

## Quick Setup

### Option 1: Use Online Icon Generator (Easiest)

1. Go to [Favicon.io](https://favicon.io/favicon-generator/)
2. Choose "Text" generator
3. Enter text: `P`
4. Choose black background (#000000) and white text (#FFFFFF)
5. Download the generated icons
6. Rename and copy to this directory:
   - `favicon-16x16.png` → `icon16.png`
   - `favicon-32x32.png` → resize to 48x48 → `icon48.png`
   - `android-chrome-192x192.png` → resize to 128x128 → `icon128.png`

### Option 2: Use the SVG Template

An `icon.svg` file is provided in this directory. You can:

1. Open it in any graphics editor (Figma, Sketch, Inkscape, etc.)
2. Export as PNG in three sizes:
   - 16x16px → `icon16.png`
   - 48x48px → `icon48.png`
   - 128x128px → `icon128.png`

### Option 3: Online SVG to PNG Converter

1. Use the provided `icon.svg` file
2. Go to [CloudConvert](https://cloudconvert.com/svg-to-png)
3. Upload `icon.svg`
4. Set width to 16, convert and download as `icon16.png`
5. Repeat for 48px and 128px

### Option 4: Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd ..  # Go to project root
./create-icons.sh
```

### Option 5: Use Python Script (Command Line)

If you have Python and Pillow installed:

```bash
pip install pillow
cd ..  # Go to project root
python3 create-icons.py
```

### Option 6: Use Your Own Design

Create your own icon design in any graphics software:
- Size: 128x128px minimum
- Format: PNG with transparency
- Export in three sizes: 16px, 48px, 128px
- Save as `icon16.png`, `icon48.png`, `icon128.png`

## Required Files

Once you have the icons, this directory should contain:

```
icons/
├── icon16.png   (16x16 pixels)
├── icon48.png   (48x48 pixels)
├── icon128.png  (128x128 pixels)
├── icon.svg     (SVG template - optional)
└── README.md    (this file)
```

## Testing Icons

After creating the icons:

1. Go to `chrome://extensions/` in Chrome
2. Enable "Developer mode"
3. Load the extension
4. Check if the icon appears correctly in the toolbar

## Icon Design Tips

- Keep it simple and recognizable at small sizes
- Use high contrast (black background, white text works well)
- Test at 16x16px to ensure it's still readable
- PNG format with transparency is recommended
- Square shape (1:1 aspect ratio)

## Temporary Workaround

If you want to quickly test the extension without proper icons, you can:

1. Create any 3 PNG files (even blank ones)
2. Name them `icon16.png`, `icon48.png`, `icon128.png`
3. Place them in this directory
4. The extension will load (icons just won't look good)

Later, replace them with proper icons following the options above.
