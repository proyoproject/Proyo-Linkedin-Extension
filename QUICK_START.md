# Quick Start Guide

**Already set everything up? Here's your quick reference.**

## URLs

- **Backend Health Check:** `https://proyo-job-backend.onrender.com/api/health`
- **Airtable:** [https://airtable.com](https://airtable.com)
- **Chrome Extensions:** `chrome://extensions/`
- **LinkedIn Jobs:** [https://www.linkedin.com/jobs/](https://www.linkedin.com/jobs/)

## Daily Workflow

1. Open Chrome and go to LinkedIn Jobs
2. Click Proyo extension icon (side panel opens)
3. Browse and click on job listings
4. Click "Save to Proyo" for jobs you want to track
5. Manage saved jobs in Airtable

## Quick Commands

### Test Backend
```bash
curl https://your-backend.onrender.com/api/health
```

### Reload Extension
1. Go to `chrome://extensions/`
2. Find Proyo Job Saver
3. Click reload icon 🔄

### Check Logs

**Extension Logs:**
- LinkedIn page: F12 → Console → Look for `[Proyo Content]`
- Side panel: Right-click panel → Inspect → Console → Look for `[Proyo Panel]`

**Backend Logs:**
- Render Dashboard → Your Service → Logs tab

## Common Issues - Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Job not detecting | Refresh LinkedIn page |
| Can't save job | Check backend URL in `sidepanel.js` line 17 |
| Side panel won't open | Reload extension at `chrome://extensions/` |
| Backend slow | Render free tier - first request takes 30-60s after sleep |
| "NOT_FOUND" error | Check table name is exactly "Jobs" |

## Key Files to Edit

- `sidepanel.js` line 17 - Backend URL
- `backend/.env` - Airtable credentials (local testing)
- Render dashboard - Environment variables (production)

## Status Options

- Not Applied (default)
- Applied
- Interview
- Rejected
- Offer

## File Structure

```
proyo-extension-2026/
├── manifest.json      # Extension config
├── content.js         # LinkedIn job detection
├── sidepanel.js       # Side panel logic (edit backend URL here!)
├── sidepanel.html     # Side panel UI
├── sidepanel.css      # Styling
├── background.js      # Message passing
├── icons/            # Extension icons (16, 48, 128 px)
└── backend/
    ├── index.js      # Express server
    ├── package.json  # Dependencies
    └── .env          # Local config (not in git)
```

## Need Full Setup?

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for complete step-by-step instructions.

## Documentation

- **Extension Setup:** [README.md](README.md)
- **Backend Setup:** [backend/README.md](backend/README.md)
- **Project Overview:** [PROJECT_README.md](PROJECT_README.md)
- **Complete Setup:** [SETUP_GUIDE.md](SETUP_GUIDE.md)
