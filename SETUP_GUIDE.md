# Proyo Job Saver - Complete Setup Guide

This guide walks you through setting up the entire Proyo Job Saver system from scratch. Follow each step in order.

**Estimated Setup Time:** 30-45 minutes

---

## Table of Contents

1. [Prerequisites](#step-0-prerequisites)
2. [Airtable Setup](#step-1-airtable-setup)
3. [Backend Deployment](#step-2-backend-deployment)
4. [Chrome Extension Setup](#step-3-chrome-extension-setup)
5. [Testing Everything](#step-4-testing-everything)
6. [Troubleshooting](#troubleshooting)

---

## Step 0: Prerequisites

Before you begin, make sure you have:

- [ ] Google Chrome browser installed
- [ ] GitHub account (for code hosting)
- [ ] Airtable account ([Sign up free](https://airtable.com/signup))
- [ ] Render account ([Sign up free](https://render.com))
- [ ] Git installed on your computer
- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))

**Check Node.js version:**
```bash
node --version  # Should be v18.0.0 or higher
```

---

## Step 1: Airtable Setup

### 1.1 Create Airtable Base

1. Log in to [Airtable](https://airtable.com)
2. Click **"Add a base"** or **"Create a base"**
3. Choose **"Start from scratch"**
4. Name your base: **`Proyo Jobs`**
5. Click into the base to open it

### 1.2 Create Jobs Table

1. You'll see a default table - click on the table name (usually "Table 1")
2. Rename it to exactly: **`Jobs`** (case-sensitive!)
3. Delete any default fields except the first one (Name - we'll ignore this)

### 1.3 Add Required Fields

Click the **"+"** button to add each field:

**Field 1: Job Title**
- Type: Single line text
- Click "Create field"

**Field 2: Company Name**
- Type: Single line text
- Click "Create field"

**Field 3: Location**
- Type: Single line text
- Click "Create field"

**Field 4: Description**
- Type: Long text
- Enable rich text formatting: OFF (or ON, your choice)
- Click "Create field"

**Field 5: Email**
- Type: Email
- Click "Create field"

**Field 6: Status**
- Type: Single select
- Add these options (exactly as written):
  - `Not Applied`
  - `Applied`
  - `Interview`
  - `Rejected`
  - `Offer`
- Set default to: `Not Applied`
- Click "Create field"

**Field 7: Added Date**
- Type: Date
- Date format: Local (YYYY-MM-DD)
- Include time: OFF
- Click "Create field"

**Field 8: Job URL**
- Type: URL
- Click "Create field"

**Final table structure:**
```
Name | Job Title | Company Name | Location | Description | Email | Status | Added Date | Job URL
```

### 1.4 Get Airtable API Key

1. Go to [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **"Create new token"** or **"Create token"**
3. Name: `Proyo Job Saver`
4. Under **Scopes**, add:
   - `data.records:read` ✓
   - `data.records:write` ✓
5. Under **Access**, click **"Add a base"**
   - Select your `Proyo Jobs` base
6. Click **"Create token"**
7. **IMPORTANT:** Copy the token immediately - it starts with `pat...`
8. Save it somewhere safe (you'll need it soon)

### 1.5 Get Base ID

1. Go to [https://airtable.com/api](https://airtable.com/api)
2. Click on your **`Proyo Jobs`** base
3. In the introduction section, you'll see: "The ID of this base is **appXXXXXXXXXXXXXX**"
4. Copy this Base ID (starts with `app`)
5. Save it with your API key

**Checkpoint:** You should now have:
- ✓ Airtable base created with Jobs table
- ✓ All 8 fields added correctly
- ✓ API key (starts with `pat...`)
- ✓ Base ID (starts with `app...`)

---

## Step 2: Backend Deployment

### 2.1 Push Code to GitHub

1. Open Terminal/Command Prompt
2. Navigate to the project directory:
   ```bash
   cd /path/to/proyo-extension-2026
   ```

3. Initialize Git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Proyo Job Saver"
   ```

4. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `proyo-job-saver`
   - Privacy: Private (recommended)
   - Click "Create repository"

5. Push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/proyo-job-saver.git
   git push -u origin main
   ```

### 2.2 Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Connect GitHub"** (if not already connected)
5. Find your `proyo-job-saver` repository
6. Click **"Connect"**

**Configure the service:**

**Basic Settings:**
- **Name:** `proyo-job-backend` (or any name you prefer)
- **Region:** Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Instance Type:**
- Choose **"Free"** (or paid for better performance)

**Environment Variables:**

Scroll down to "Environment Variables" section and add these:

| Key                    | Value                                    |
|------------------------|------------------------------------------|
| `AIRTABLE_API_KEY`     | Your API key (starts with `pat...`)     |
| `AIRTABLE_BASE_ID`     | Your Base ID (starts with `app...`)     |
| `AIRTABLE_TABLE_NAME`  | `Jobs`                                   |
| `NODE_ENV`             | `production`                             |

**Do NOT add PORT** - Render sets this automatically

7. Click **"Create Web Service"**
8. Wait 2-3 minutes for deployment to complete
9. Once deployed, you'll see your URL: `https://proyo-job-backend.onrender.com`
10. **Copy this URL** - you'll need it for the Chrome extension

### 2.3 Test Backend

Test your backend is working:

```bash
curl https://proyo-job-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

If you get an error, check:
- Render logs (Dashboard → Your Service → Logs)
- Environment variables are set correctly
- Build completed successfully

**Checkpoint:** You should now have:
- ✓ Code pushed to GitHub
- ✓ Backend deployed on Render
- ✓ Backend URL copied
- ✓ Health check returning "ok"

---

## Step 3: Chrome Extension Setup

### 3.1 Create Extension Icons

You need three PNG icon files. Choose one method:

**Option A: Use Online Generator (Easiest)**

1. Go to [Favicon.io](https://favicon.io/favicon-generator/)
2. Text: `P`
3. Background: Black (#000000)
4. Font Color: White (#FFFFFF)
5. Download ZIP
6. Extract and rename files to `icon16.png`, `icon48.png`, `icon128.png`
7. Move them to `icons/` folder

**Option B: Use Placeholder (Quick Test)**

1. Use any 3 small PNG images you have
2. Rename them to `icon16.png`, `icon48.png`, `icon128.png`
3. Move to `icons/` folder
4. Replace with proper icons later

See [icons/README.md](icons/README.md) for more options.

### 3.2 Configure Backend URL

1. Open `sidepanel.js` in a text editor
2. Find line 17:
   ```javascript
   backendUrl: 'https://proyo-job-backend.onrender.com'
   ```
3. Replace with YOUR Render URL from Step 2.2
4. Save the file

### 3.3 Load Extension in Chrome

1. Open Google Chrome
2. Go to: `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Navigate to and select the `proyo-extension-2026` folder
6. The extension should appear in your list

**Troubleshooting:**
- If you see errors about icons, make sure the 3 PNG files exist
- If manifest errors, check `manifest.json` syntax
- Reload the extension after any changes (click reload icon)

### 3.4 Pin Extension

1. Click the puzzle icon (Extensions) in Chrome toolbar
2. Find "Proyo Job Saver"
3. Click the pin icon 📌 to keep it visible in toolbar

**Checkpoint:** You should now have:
- ✓ Extension icons created
- ✓ Backend URL configured in code
- ✓ Extension loaded in Chrome
- ✓ Extension icon visible in toolbar

---

## Step 4: Testing Everything

### 4.1 Test Extension Opens

1. Click the Proyo Job Saver icon in Chrome toolbar
2. Side panel should open on the right side
3. You should see email entry screen with Proyo logo

**If side panel doesn't open:**
- Right-click extension icon → "Inspect popup"
- Check console for errors
- Try reloading extension

### 4.2 Enter Email

1. In the side panel, enter your email: `your-email@proyo.app`
2. Click "Continue →"
3. Panel should switch to job detection mode
4. You should see "Navigate to LinkedIn Jobs to start saving"

### 4.3 Test Job Detection

1. Open a new tab
2. Go to [LinkedIn Jobs](https://www.linkedin.com/jobs/)
3. Click on any job listing
4. Side panel should automatically update with job details:
   - Job title
   - Company name
   - Location
   - Description preview

**If job doesn't appear:**
- Open DevTools (F12) on LinkedIn page
- Check console for `[Proyo Content]` logs
- Make sure you clicked on an actual job posting
- Try refreshing the LinkedIn page

### 4.4 Save a Job

1. With a job detected, select status: "Not Applied"
2. Click **"💾 Save to Proyo"**
3. Button should change to "✓ Saved to Proyo"
4. Check Airtable - the job should appear in your Jobs table

**If save fails:**
- Check error message in side panel
- Right-click side panel → Inspect → Console
- Check Network tab for failed requests
- Verify backend URL is correct in `sidepanel.js`
- Test backend health endpoint

### 4.5 Test Duplicate Prevention

1. Click on the same job again
2. Button should show "✓ Saved to Proyo" (disabled)
3. Try to save again - should show duplicate error

### 4.6 Test Multiple Jobs

1. Click on 3-5 different job listings
2. Save each one with different statuses
3. Check Airtable - all jobs should appear
4. Verify fields are populated correctly

**Checkpoint:** If all tests pass, your system is working! 🎉

---

## Step 5: Daily Usage

### How to Use

1. Navigate to [LinkedIn Jobs](https://www.linkedin.com/jobs/)
2. Browse job listings
3. Click on a job you're interested in
4. Side panel automatically shows job details
5. Select application status from dropdown
6. Click "Save to Proyo"
7. Job is saved to your Airtable dashboard

### Managing Saved Jobs

1. Open your Airtable base
2. View all saved jobs in the Jobs table
3. Update Status as you apply/interview
4. Add notes in Description field
5. Use filters and views to organize

---

## Troubleshooting

### Extension Issues

**Problem: Side panel won't open**
- Solution: Check extension is enabled in `chrome://extensions/`
- Solution: Reload extension
- Solution: Check for errors in background service worker logs

**Problem: Job not detecting**
- Solution: Refresh LinkedIn page
- Solution: Make sure you're on `linkedin.com/jobs/view/...`
- Solution: Check console logs for errors
- Solution: LinkedIn may have changed their HTML - content.js selectors may need updating

**Problem: "Failed to save" error**
- Solution: Check backend URL in `sidepanel.js` line 17
- Solution: Test backend health: `curl https://your-backend.onrender.com/api/health`
- Solution: Check Render logs for backend errors

### Backend Issues

**Problem: Health check fails**
- Solution: Check Render deployment status
- Solution: View Render logs for errors
- Solution: Verify environment variables are set correctly

**Problem: "Airtable error: NOT_FOUND"**
- Solution: Check `AIRTABLE_TABLE_NAME` is exactly "Jobs"
- Solution: Verify Base ID is correct
- Solution: Make sure API token has access to the base

**Problem: "Airtable error: INVALID_REQUEST"**
- Solution: Check field names in Airtable match exactly
- Solution: Field names are case-sensitive
- Solution: Make sure Status field has all required options

**Problem: Backend is slow (Render free tier)**
- Solution: Render free tier sleeps after 15 min inactivity
- Solution: First request after sleep takes 30-60 seconds
- Solution: Consider upgrading to paid tier ($7/month)

### Airtable Issues

**Problem: Jobs not appearing in Airtable**
- Solution: Refresh Airtable page
- Solution: Check you're in the correct base and table
- Solution: Check backend logs to see if save succeeded

**Problem: Some fields are empty**
- Solution: LinkedIn may not have that data for the job
- Solution: Content script may not be extracting correctly
- Solution: Check browser console logs

---

## Next Steps

### Optional Enhancements

- **Better Icons:** Replace placeholder icons with professional design
- **Custom Statuses:** Add more status options in Airtable
- **Views:** Create filtered views in Airtable (e.g., "Applied This Week")
- **Automation:** Set up Airtable automations for reminders
- **Analytics:** Track application success rate in Airtable

### Sharing with Team

To share with others:

1. They need their own Proyo email
2. They load the same extension
3. Backend is shared - all users save to same Airtable base
4. Filter by Email field to see only your jobs

---

## Support

If you encounter issues not covered here:

1. **Check Logs:**
   - Browser console: F12 on LinkedIn page
   - Side panel console: Right-click side panel → Inspect
   - Backend logs: Render dashboard → Logs tab

2. **Test Components:**
   - Backend health: `curl https://your-backend.onrender.com/api/health`
   - Extension loaded: `chrome://extensions/`
   - Airtable accessible: Open base in browser

3. **Review Documentation:**
   - [Extension README](README.md)
   - [Backend README](backend/README.md)
   - [Project README](PROJECT_README.md)

---

## Success Checklist

- [ ] Airtable base created with Jobs table
- [ ] All 8 fields added correctly
- [ ] API key and Base ID obtained
- [ ] Backend deployed to Render
- [ ] Backend health check passes
- [ ] Extension icons created
- [ ] Backend URL configured in extension
- [ ] Extension loaded in Chrome
- [ ] Email entered in extension
- [ ] Job successfully detected on LinkedIn
- [ ] Job successfully saved to Airtable
- [ ] Job appears in Airtable base

If all items are checked, congratulations! Your Proyo Job Saver is fully operational! 🚀

---

**Need Help?**
- Backend issues: Check Render logs
- Extension issues: Check browser console
- Airtable issues: Verify table schema and API credentials

**Happy job hunting!** 💼
