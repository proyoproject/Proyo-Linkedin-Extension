# Proyo Job Saver Chrome Extension

A Chrome extension that allows users to save LinkedIn job listings to Airtable via a backend API.

## Features

- 🔍 Automatically detects LinkedIn job listings
- 💾 Saves job details to Airtable
- 📊 Track job application status
- 🎨 Clean, professional UI with side panel
- ⚡ Real-time job detection with MutationObserver

## Architecture

```
Chrome Extension → Backend API (Render) → Airtable
```

## Prerequisites

Before you begin, ensure you have:

1. **Google Chrome** (version 88 or later)
2. **Backend API** deployed on Render (see backend README)
3. **Airtable account** with the Jobs table configured

## Installation

### Step 1: Create Extension Icons

The extension requires icon files in the `icons/` directory. Create three PNG files:

- `icon16.png` (16x16 pixels)
- `icon48.png` (48x48 pixels)
- `icon128.png` (128x128 pixels)

You can:
- Create simple icons with the letter "P" on a black background
- Use an online icon generator
- Use any PNG images you prefer

**Quick icon creation with ImageMagick** (if installed):

```bash
# Install ImageMagick first if needed: brew install imagemagick

convert -size 16x16 xc:black -fill white -pointsize 12 -gravity center -annotate +0+0 "P" icons/icon16.png
convert -size 48x48 xc:black -fill white -pointsize 36 -gravity center -annotate +0+0 "P" icons/icon48.png
convert -size 128x128 xc:black -fill white -pointsize 96 -gravity center -annotate +0+0 "P" icons/icon128.png
```

### Step 2: Configure Backend URL

Open `sidepanel.js` and update the backend URL:

```javascript
// Line 17 in sidepanel.js
backendUrl: 'https://your-app-name.onrender.com' // Replace with your Render URL
```

### Step 3: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `proyo-extension-2026` directory
5. The extension should now appear in your extensions list

### Step 4: Pin the Extension

1. Click the puzzle icon (Extensions) in Chrome toolbar
2. Find "Proyo Job Saver"
3. Click the pin icon to keep it visible

## Usage

### First Time Setup

1. Click the Proyo Job Saver extension icon in Chrome toolbar
2. The side panel will open on the right side of your browser
3. Enter your Proyo email address (e.g., `user@proyo.app`)
4. Click **Continue →**

### Saving Jobs

1. Navigate to [LinkedIn Jobs](https://www.linkedin.com/jobs/)
2. Click on any job listing
3. The side panel will automatically detect and display the job details
4. Select a status from the dropdown (default: "Not Applied")
5. Click **💾 Save to Proyo**
6. The button will change to **✓ Saved to Proyo** when successful

### Status Options

- **Not Applied** - Default status for new jobs
- **Applied** - You've submitted an application
- **Interview** - Scheduled or completed interview
- **Rejected** - Application was rejected
- **Offer** - Received a job offer

## Troubleshooting

### Extension Not Detecting Jobs

1. **Refresh LinkedIn page** - Try refreshing the job listing page
2. **Check console logs** - Open DevTools (F12) and check for `[Proyo Content]` logs
3. **Verify URL** - Make sure you're on `linkedin.com/jobs/view/` or similar
4. **LinkedIn DOM changes** - LinkedIn updates their HTML structure frequently. If selectors fail, check content.js logs to see which selectors are working.

### Save Button Not Working

1. **Check backend URL** - Verify `sidepanel.js` has correct backend URL
2. **Check backend status** - Visit `https://your-backend.onrender.com/api/health`
3. **Check network tab** - Open DevTools → Network tab → Look for failed requests
4. **Check console logs** - Look for `[Proyo Panel]` error messages

### Side Panel Not Opening

1. **Check extension is enabled** - Go to `chrome://extensions/`
2. **Reload extension** - Click the reload icon on the extension card
3. **Check permissions** - Extension needs `sidePanel` permission (already in manifest.json)

### Email Not Saving

The email is stored in `chrome.storage.local`. To reset:

1. Open DevTools (F12)
2. Go to Application tab → Storage → Local Storage
3. Find `chrome-extension://[your-extension-id]`
4. Delete `proyoEmail` key
5. Refresh side panel

## Development

### Project Structure

```
proyo-extension-2026/
├── manifest.json          # Extension configuration (Manifest V3)
├── background.js          # Service worker for message passing
├── content.js             # LinkedIn page job detection
├── sidepanel.html         # Side panel UI structure
├── sidepanel.js           # Side panel logic and state management
├── sidepanel.css          # Styling with Inter font
├── icons/                 # Extension icons (16, 48, 128)
└── README.md             # This file
```

### Key Technologies

- **Manifest V3** - Latest Chrome extension format
- **Side Panel API** - Modern Chrome extension UI
- **MutationObserver** - Real-time DOM change detection
- **Chrome Storage API** - Persistent email storage
- **Chrome Messaging API** - Communication between components

### Logging

All components include comprehensive logging:

- **Content Script**: `[Proyo Content]` - Job detection and extraction
- **Background Script**: `[Proyo Background]` - Message relay
- **Side Panel**: `[Proyo Panel]` - UI state and API calls

To view logs, open DevTools (F12) in:
- **LinkedIn page** for content script logs
- **Side panel** for panel logs (right-click panel → Inspect)
- **Extension service worker** for background logs (chrome://extensions → Details → Service worker)

### LinkedIn Selector Resilience

The content script includes multiple fallback selectors for each data field:

```javascript
const SELECTORS = {
  jobTitle: [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    'h1.t-24.t-bold',
    // ... more fallbacks
  ],
  // ... other fields
};
```

If LinkedIn changes their DOM structure, update these selectors in `content.js`.

## Security Notes

- Email is stored locally in Chrome storage (not synced)
- No passwords are stored
- Backend handles authentication to Airtable
- Job data is sent via HTTPS to backend API

## Support

For issues or questions:
1. Check the console logs (see Logging section)
2. Verify backend is running (`/api/health` endpoint)
3. Ensure Airtable is configured correctly

## License

Private project for Proyo
