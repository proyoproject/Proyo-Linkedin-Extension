# Getting Started with Proyo Job Saver

Welcome! Your complete LinkedIn Job Saver Chrome Extension system has been built. This document will help you get started.

## What Has Been Built

### ✅ Chrome Extension (Complete)

A fully functional Chrome extension with:
- Automatic LinkedIn job detection using MutationObserver
- Side panel UI with email authentication
- Real-time job data extraction from LinkedIn
- One-click job saving to Airtable
- Status tracking and duplicate prevention
- Comprehensive logging for debugging

**Files created:**
- [manifest.json](manifest.json) - Extension configuration (Manifest V3)
- [content.js](content.js) - LinkedIn page job detection with multiple fallback selectors
- [sidepanel.html](sidepanel.html) - Side panel UI layout
- [sidepanel.js](sidepanel.js) - Side panel logic and state management
- [sidepanel.css](sidepanel.css) - Styling with Inter font and design system
- [background.js](background.js) - Service worker for message passing

### ✅ Backend API (Complete)

A production-ready Express.js API with:
- POST endpoint to save jobs to Airtable
- Input validation and sanitization
- Duplicate job detection
- Comprehensive logging and error handling
- Health check endpoint
- CORS configuration for Chrome extension

**Files created:**
- [backend/index.js](backend/index.js) - Express server with Airtable integration
- [backend/package.json](backend/package.json) - Dependencies (Express, Airtable, CORS, dotenv)
- [backend/.env.example](backend/.env.example) - Environment variable template

### ✅ Documentation (Complete)

Comprehensive guides for every step:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - **START HERE** - Complete step-by-step setup
- [README.md](README.md) - Chrome extension documentation
- [backend/README.md](backend/README.md) - Backend deployment and Airtable setup
- [PROJECT_README.md](PROJECT_README.md) - Full project overview and architecture
- [QUICK_START.md](QUICK_START.md) - Quick reference for daily use
- [icons/README.md](icons/README.md) - Icon creation instructions

### ✅ Additional Tools

- [create-icons.sh](create-icons.sh) - Bash script to generate icons (requires ImageMagick)
- [create-icons.py](create-icons.py) - Python script to generate icons (requires Pillow)
- [.gitignore](.gitignore) - Git ignore rules for Node.js projects
- [icons/icon.svg](icons/icon.svg) - SVG template for icon creation

## What You Need to Do Next

### Step 1: Create Extension Icons ⚠️ REQUIRED

The extension needs three PNG icon files. **Choose one method:**

**Option A: Use Online Generator** (Easiest - 2 minutes)
1. Go to https://favicon.io/favicon-generator/
2. Text: "P", Background: Black, Text: White
3. Download and rename files to `icon16.png`, `icon48.png`, `icon128.png`
4. Move to `icons/` directory

**Option B: Run Icon Script** (If you have ImageMagick)
```bash
./create-icons.sh
```

**Option C: Manual** (Use any image you have temporarily)
1. Take any 3 PNG files
2. Rename to `icon16.png`, `icon48.png`, `icon128.png`
3. Place in `icons/` directory
4. Replace with proper icons later

See [icons/README.md](icons/README.md) for more options.

### Step 2: Setup Airtable (15 minutes)

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) **Step 1** to:
1. Create Airtable base called "Proyo Jobs"
2. Create "Jobs" table with 8 specific fields
3. Get API key (Personal Access Token)
4. Get Base ID

**Result:** You'll have API key and Base ID saved somewhere safe.

### Step 3: Deploy Backend (15 minutes)

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) **Step 2** to:
1. Push code to GitHub
2. Deploy to Render (free tier)
3. Add environment variables (API key, Base ID)
4. Get your backend URL

**Result:** Backend running at `https://your-app.onrender.com/api/health`

### Step 4: Configure Extension (2 minutes)

1. Open [sidepanel.js](sidepanel.js) in a text editor
2. Find **line 17**:
   ```javascript
   backendUrl: 'https://proyo-job-backend.onrender.com'
   ```
3. Replace with YOUR backend URL from Step 3
4. Save the file

### Step 5: Load Extension in Chrome (2 minutes)

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (top-right toggle)
4. Click "Load unpacked"
5. Select the `proyo-extension-2026` folder
6. Pin the extension (click puzzle icon, then pin icon)

### Step 6: Test Everything (5 minutes)

Follow [SETUP_GUIDE.md](SETUP_GUIDE.md) **Step 4** to:
1. Click extension icon
2. Enter your email
3. Go to LinkedIn Jobs
4. Click on a job listing
5. Save the job
6. Check Airtable to see it saved

**Result:** Job appears in your Airtable base! 🎉

## Estimated Total Setup Time

- Icons: 2-5 minutes
- Airtable: 15 minutes
- Backend deployment: 15 minutes
- Extension setup: 5 minutes
- Testing: 5 minutes

**Total: 40-50 minutes**

## Documentation Map

Here's when to use each document:

| Document | When to Use It |
|----------|----------------|
| **[GETTING_STARTED.md](GETTING_STARTED.md)** | **You are here - read this first!** |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | **Follow this for complete step-by-step setup** |
| [README.md](README.md) | Extension details, troubleshooting, development |
| [backend/README.md](backend/README.md) | Backend deployment, API docs, Airtable setup |
| [PROJECT_README.md](PROJECT_README.md) | Architecture, features, project overview |
| [QUICK_START.md](QUICK_START.md) | Quick reference after setup is complete |
| [icons/README.md](icons/README.md) | Multiple ways to create extension icons |

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      YOUR CHROME BROWSER                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  LinkedIn Jobs Page                                     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ content.js                                        │  │  │
│  │  │ • Detects job selection with MutationObserver    │  │  │
│  │  │ • Extracts: title, company, location, desc, URL  │  │  │
│  │  │ • Multiple fallback selectors                    │  │  │
│  │  └────────────────┬─────────────────────────────────┘  │  │
│  │                   │ Messages                            │  │
│  │                   ▼                                     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ background.js (Service Worker)                   │  │  │
│  │  │ • Message relay between content & panel          │  │  │
│  │  └────────────────┬─────────────────────────────────┘  │  │
│  │                   │ Messages                            │  │
│  │                   ▼                                     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ Side Panel (sidepanel.html + sidepanel.js)       │  │  │
│  │  │ • Email authentication (stored locally)          │  │  │
│  │  │ • Display job details                            │  │  │
│  │  │ • Status selection                               │  │  │
│  │  │ • Save button with duplicate prevention          │  │  │
│  │  └────────────────┬─────────────────────────────────┘  │  │
│  └───────────────────┼──────────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────────┘
                        │ POST /api/jobs
                        │ HTTPS
                        ▼
       ┌─────────────────────────────────────┐
       │  RENDER.COM (Backend)               │
       │  ┌───────────────────────────────┐  │
       │  │ Express.js Server             │  │
       │  │ • Input validation            │  │
       │  │ • Duplicate detection         │  │
       │  │ • Error handling              │  │
       │  │ • Logging                     │  │
       │  └───────────┬───────────────────┘  │
       └──────────────┼──────────────────────┘
                      │ Airtable API
                      │ HTTPS
                      ▼
         ┌─────────────────────────────┐
         │  AIRTABLE.COM (Database)    │
         │  ┌───────────────────────┐  │
         │  │ Jobs Table            │  │
         │  │ • Job Title           │  │
         │  │ • Company Name        │  │
         │  │ • Location            │  │
         │  │ • Description         │  │
         │  │ • Email               │  │
         │  │ • Status              │  │
         │  │ • Added Date          │  │
         │  │ • Job URL             │  │
         │  └───────────────────────┘  │
         └─────────────────────────────┘
```

## Key Features

### Chrome Extension Features

- ✅ **Real-time Job Detection** - Uses MutationObserver to detect when you view a job
- ✅ **Multiple Fallback Selectors** - Resilient to LinkedIn's frequent DOM changes
- ✅ **Email-based Sessions** - Stored locally, no account system needed
- ✅ **One-Click Save** - Simple button to save jobs to Airtable
- ✅ **Status Tracking** - Track: Not Applied, Applied, Interview, Rejected, Offer
- ✅ **Duplicate Prevention** - Won't save the same job twice
- ✅ **Side Panel UI** - Modern Chrome side panel (not old-style popup)
- ✅ **Comprehensive Logging** - Debug logs for every action

### Backend Features

- ✅ **Express.js API** - Fast, lightweight Node.js server
- ✅ **Airtable Integration** - Direct API connection to your Airtable base
- ✅ **Input Validation** - Email format, required fields, sanitization
- ✅ **Security** - XSS prevention, CORS configuration, environment variables
- ✅ **Error Handling** - Graceful errors with user-friendly messages
- ✅ **Health Check** - `/api/health` endpoint for monitoring
- ✅ **Comprehensive Logging** - Every request, response, and error logged

## Technology Stack

**Frontend:**
- Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript (no frameworks)
- Chrome APIs: storage, tabs, sidePanel, runtime
- Inter font from Google Fonts

**Backend:**
- Node.js 18+
- Express.js 4
- Airtable API
- Hosted on Render

**Database:**
- Airtable (no-code database)

## Next Steps After Setup

Once everything is working:

1. **Daily Use:**
   - Browse LinkedIn Jobs
   - Click on interesting listings
   - Save with one click
   - Track in Airtable

2. **Organize in Airtable:**
   - Create custom views (e.g., "Applied This Week")
   - Set up automations (e.g., follow-up reminders)
   - Add custom fields if needed
   - Export data for analysis

3. **Share with Team:**
   - Each person enters their own email
   - All jobs save to shared Airtable base
   - Filter by Email to see only your jobs

4. **Customize:**
   - Add more status options in Airtable
   - Modify extension styling in `sidepanel.css`
   - Add custom fields to Airtable
   - Create Airtable automations

## Support & Troubleshooting

### Quick Fixes

| Problem | Solution |
|---------|----------|
| Extension won't load | Check icons exist, reload extension at `chrome://extensions/` |
| Job not detecting | Refresh LinkedIn, check console logs |
| Save fails | Check backend URL in `sidepanel.js`, test health endpoint |
| Backend slow | Render free tier sleeps - first request takes 30-60s |

### Where to Get Help

1. **Check console logs** - Press F12 in Chrome
2. **Test backend** - `curl https://your-backend.onrender.com/api/health`
3. **Review documentation** - See relevant README files
4. **Check Render logs** - Dashboard → Your Service → Logs

### Important Configuration

**Don't forget to update:**
- ✅ `sidepanel.js` line 17 - Your backend URL
- ✅ Render environment variables - Airtable credentials
- ✅ Create extension icons - Required for Chrome

## Success Checklist

Before using the extension, ensure:

- [ ] Extension icons created (16, 48, 128 px PNG files)
- [ ] Airtable base created with Jobs table
- [ ] All 8 Airtable fields added correctly
- [ ] Airtable API key obtained
- [ ] Backend deployed to Render
- [ ] Environment variables set in Render
- [ ] Backend health check returns "ok"
- [ ] `sidepanel.js` line 17 updated with your backend URL
- [ ] Extension loaded in Chrome without errors
- [ ] Extension icon visible in Chrome toolbar

## Ready to Start?

👉 **Go to [SETUP_GUIDE.md](SETUP_GUIDE.md) and follow Step 1!**

The setup guide walks you through everything step-by-step with screenshots and troubleshooting tips.

Good luck with your job search! 🚀💼
