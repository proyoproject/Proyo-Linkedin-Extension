# ✅ Deployment Checklist

Follow this checklist to deploy your Proyo LinkedIn Job Saver.

---

## Pre-Deployment ✓ (Already Done!)

- [x] Chrome extension code created
- [x] Backend API created
- [x] Icons copied from favicon_io
- [x] Airtable credentials configured
- [x] Documentation created
- [x] `.gitignore` configured to protect secrets

---

## Step 1: Install Xcode Tools

- [ ] Open Terminal
- [ ] Run: `xcode-select --install`
- [ ] Wait for installation (5-10 minutes)
- [ ] Verify: `git --version`

---

## Step 2: Push to GitHub

- [ ] Open Terminal
- [ ] Navigate to project: `cd /Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
- [ ] Run push script: `./push-to-github.sh`
- [ ] Review files to be committed (check `backend/.env` is NOT listed)
- [ ] Confirm push
- [ ] Verify on GitHub: https://github.com/proyoproject/Proyo-Linkedin-Extension

---

## Step 3: Deploy to Render

- [ ] Go to https://dashboard.render.com/
- [ ] Click "New +" → "Blueprint" (or "Web Service")
- [ ] Connect GitHub repository: `Proyo-Linkedin-Extension`
- [ ] Add environment variables:
  - [ ] `AIRTABLE_API_KEY`: Get from `backend/.env` file (starts with `pat...`)
  - [ ] `AIRTABLE_BASE_ID`: `appjicnSkDZEpjFHz`
  - [ ] `AIRTABLE_TABLE_NAME`: `Jobs`
  - [ ] `NODE_ENV`: `production`
- [ ] Click "Create" or "Apply"
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy your Render URL (e.g., `https://proyo-job-backend-xyz.onrender.com`)
- [ ] Test health check: `curl YOUR-URL/api/health`

---

## Step 4: Configure Extension

- [ ] Open `sidepanel.js` in text editor
- [ ] Go to line 14
- [ ] Replace `REPLACE_WITH_YOUR_RENDER_URL` with your actual Render URL
- [ ] Save the file

---

## Step 5: Load Extension in Chrome

- [ ] Open Chrome
- [ ] Go to: `chrome://extensions/`
- [ ] Enable "Developer mode" (top-right toggle)
- [ ] Click "Load unpacked"
- [ ] Select folder: `/Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
- [ ] Extension appears in toolbar
- [ ] Click puzzle icon and pin "Proyo Job Saver"

---

## Step 6: Test Everything!

- [ ] Click Proyo extension icon
- [ ] Side panel opens on right
- [ ] Enter your Proyo email
- [ ] Click "Continue"
- [ ] Go to https://www.linkedin.com/jobs/
- [ ] Click on any job listing
- [ ] Extension shows job details
- [ ] Click "💾 Save to Proyo"
- [ ] Button changes to "✓ Saved to Proyo"
- [ ] Open Airtable base "Linkedin Jobs"
- [ ] Verify job appears in "Jobs" table

---

## 🎉 Success!

If all items are checked, your Proyo Job Saver is live and working!

---

## Troubleshooting

**If something doesn't work:**

1. **Extension won't load**
   - Check all 3 icon files exist in `icons/` folder
   - Check `manifest.json` for errors
   - View extension errors in `chrome://extensions/`

2. **Job detection fails**
   - Press F12 on LinkedIn page
   - Check console for `[Proyo Content]` logs
   - Refresh LinkedIn page

3. **Save fails**
   - Check backend URL in `sidepanel.js` line 14
   - Test backend: `curl YOUR-URL/api/health`
   - Check Render logs for errors
   - Verify Airtable credentials in Render

4. **Backend errors**
   - Go to Render Dashboard → Your Service → Logs
   - Check environment variables are set correctly
   - Verify Base ID and API key

---

## Next Steps After Success

- [ ] Save more jobs from LinkedIn
- [ ] Update job status in Airtable as you apply
- [ ] Create custom views in Airtable
- [ ] Set up Airtable automations for reminders
- [ ] Share extension with team members

---

## Files Reference

- **Push to GitHub:** [PUSH_TO_GITHUB.md](PUSH_TO_GITHUB.md)
- **Deploy to Render:** [DEPLOY.md](DEPLOY.md)
- **Troubleshooting:** [README.md](README.md) and [backend/README.md](backend/README.md)
- **Quick Reference:** [QUICK_START.md](QUICK_START.md)

---

**GitHub:** https://github.com/proyoproject/Proyo-Linkedin-Extension
**Your Airtable:** Linkedin Jobs (appjicnSkDZEpjFHz)

Happy job hunting! 💼✨
