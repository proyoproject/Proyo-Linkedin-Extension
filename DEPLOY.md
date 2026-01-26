# 🚀 Easy Deployment Guide - Proyo Job Saver

## Your Configuration (Already Set Up!)

✅ **Airtable Base:** Linkedin Jobs
✅ **Table Name:** Jobs
✅ **Base ID:** `appjicnSkDZEpjFHz`
✅ **API Token:** Already configured
✅ **Icons:** ✓ Copied from favicon_io

---

## Step 1: Push to GitHub ✓ (Will be done automatically)

Your GitHub repository: **https://github.com/proyoproject/Proyo-Linkedin-Extension.git**

---

## Step 2: Deploy to Render (5 minutes)

### Option A: One-Click Deployment (Easiest!)

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account (if not already)
4. Select repository: **Proyo-Linkedin-Extension**
5. Click **"Apply"**

Render will read the `render.yaml` file and create your service automatically!

6. When prompted for environment variables, enter:
   - `AIRTABLE_API_KEY`: Get this from your `backend/.env` file (starts with `pat...`)
   - `AIRTABLE_BASE_ID`: `appjicnSkDZEpjFHz`

7. Click **"Create"** and wait 2-3 minutes for deployment

### Option B: Manual Deployment

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository: **Proyo-Linkedin-Extension**
4. Configure:
   - **Name:** `proyo-job-backend`
   - **Region:** Oregon (or closest to you)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables:

| Key | Value |
|-----|-------|
| `AIRTABLE_API_KEY` | Get from `backend/.env` file (starts with `pat...`) |
| `AIRTABLE_BASE_ID` | `appjicnSkDZEpjFHz` |
| `AIRTABLE_TABLE_NAME` | `Jobs` |
| `NODE_ENV` | `production` |

6. Click **"Create Web Service"**
7. Wait 2-3 minutes for deployment

---

## Step 3: Get Your Backend URL

After deployment completes:

1. You'll see your service URL at the top, like:
   ```
   https://proyo-job-backend.onrender.com
   ```
   or
   ```
   https://proyo-job-backend-abc123.onrender.com
   ```

2. **Copy this URL** - you'll need it in the next step

3. Test it works:
   ```bash
   curl https://YOUR-URL-HERE.onrender.com/api/health
   ```

   Should return:
   ```json
   {"status":"ok","timestamp":"2024-01-26T...","uptime":123.456}
   ```

---

## Step 4: Update Chrome Extension

1. Open `sidepanel.js` in a text editor
2. Find **line 14**:
   ```javascript
   backendUrl: 'REPLACE_WITH_YOUR_RENDER_URL'
   ```
3. Replace with your actual Render URL:
   ```javascript
   backendUrl: 'https://proyo-job-backend-abc123.onrender.com'
   ```
4. Save the file

---

## Step 5: Load Extension in Chrome

1. Open Chrome and go to: `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select folder: `/Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
5. Extension appears in your toolbar!
6. Pin it: Click puzzle icon → Pin "Proyo Job Saver"

---

## Step 6: Test Everything! 🎉

1. Click the Proyo extension icon
2. Side panel opens on the right
3. Enter your Proyo email (e.g., `you@proyo.app`)
4. Click "Continue"
5. Go to https://www.linkedin.com/jobs/
6. Click on any job listing
7. Extension shows job details automatically
8. Click **"💾 Save to Proyo"**
9. Check Airtable - job should appear in your "Jobs" table!

---

## Quick Reference

**Backend Health Check:**
```bash
curl https://YOUR-URL.onrender.com/api/health
```

**Reload Extension After Changes:**
1. Go to `chrome://extensions/`
2. Find "Proyo Job Saver"
3. Click reload icon 🔄

**View Logs:**
- **Extension:** F12 in Chrome → Console → Look for `[Proyo Content]` or `[Proyo Panel]`
- **Backend:** Render Dashboard → Your Service → Logs tab

---

## Environment Variables Summary

For quick reference when setting up Render:

```env
AIRTABLE_API_KEY=your_api_token_from_backend_env_file
AIRTABLE_BASE_ID=appjicnSkDZEpjFHz
AIRTABLE_TABLE_NAME=Jobs
NODE_ENV=production
```

Note: Get your `AIRTABLE_API_KEY` from the `backend/.env` file on your computer.

(PORT is set automatically by Render - don't add it!)

---

## Troubleshooting

**Backend won't start on Render:**
- Check environment variables are set correctly
- View Render logs for error messages
- Verify Base ID and API key are correct

**Extension won't save jobs:**
- Check backend URL in `sidepanel.js` line 14
- Test backend health endpoint
- Check browser console for errors (F12)

**Jobs not appearing in Airtable:**
- Verify table name is exactly "Jobs"
- Check all required fields exist
- View Render logs for Airtable errors

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend health check returns "ok"
- [ ] Extension URL updated in `sidepanel.js`
- [ ] Extension loaded in Chrome
- [ ] Test job saved successfully to Airtable

---

## Next Steps

Once everything is working:

- Save jobs as you browse LinkedIn
- Update job status in Airtable as you apply
- Create custom views in Airtable (e.g., "Applied This Week")
- Set up Airtable automations for follow-up reminders

**Happy job hunting! 💼🚀**
