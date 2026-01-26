# Upload Code to GitHub using GitHub Desktop

Your repository exists but is empty. Follow these steps to upload your code.

---

## Step 1: Download GitHub Desktop

1. Go to: **https://desktop.github.com/**
2. Click "Download for macOS"
3. Open the downloaded file and install
4. Launch GitHub Desktop

---

## Step 2: Sign In

1. Click "Sign in to GitHub.com"
2. Enter your credentials:
   - Username: **proyoproject**
   - Password: (your GitHub password)
3. Click "Sign in"

---

## Step 3: Clone Your Repository

1. In GitHub Desktop, click **"File"** → **"Clone Repository"**
2. Click the **"GitHub.com"** tab
3. Look for: **Proyo-Linkedin-Extension**
4. Select it
5. Choose where to clone: Click "Choose..." and select Desktop (or any folder)
6. Click **"Clone"**

This will download the empty repository to your computer.

---

## Step 4: Copy Your Code Into the Repository

1. Open Finder
2. Navigate to where you cloned the repo (e.g., Desktop/Proyo-Linkedin-Extension)
3. You'll see an empty folder (or just .git folder)
4. Now go to: `/Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
5. Select ALL files and folders
6. **Copy** them (Cmd+C)
7. Go back to the cloned repo folder (Desktop/Proyo-Linkedin-Extension)
8. **Paste** everything (Cmd+V)

---

## Step 5: Review Changes in GitHub Desktop

1. Go back to GitHub Desktop
2. You'll see a list of all the new files on the left side
3. **IMPORTANT:** Scroll through and verify that `backend/.env` is NOT in the list
   - It should be automatically ignored (gray color or not shown)
   - If you see it, DO NOT proceed - let me know

---

## Step 6: Commit the Changes

1. At the bottom left, you'll see:
   - "Summary" field
   - "Description" field
2. In Summary, type: **Initial commit: Proyo Job Saver**
3. In Description, type (optional):
   ```
   - Chrome extension with LinkedIn job detection
   - Backend API with Airtable integration
   - Complete documentation
   ```
4. Click the blue **"Commit to main"** button

---

## Step 7: Push to GitHub

1. After committing, you'll see a button at the top: **"Push origin"**
2. Click it
3. Wait 10-30 seconds while it uploads

---

## Step 8: Verify on GitHub

1. Go to: **https://github.com/proyoproject/Proyo-Linkedin-Extension**
2. Refresh the page
3. You should see all your files!
4. **IMPORTANT:** Check that `backend/.env` is NOT visible
5. You should see folders like:
   - backend/
   - icons/
   - Files like manifest.json, README.md, etc.

---

## ✅ Success!

Your code is now on GitHub!

**Next Steps:**
1. Follow [DEPLOY.md](DEPLOY.md) to deploy to Render
2. Update `sidepanel.js` with your Render URL
3. Load extension in Chrome

---

## Troubleshooting

**"backend/.env" appears in the changes:**
- This file contains your API token and should NOT be uploaded
- It should be ignored automatically by .gitignore
- If you see it, STOP and contact me

**"Repository not found":**
- Make sure you're signed in as proyoproject
- Verify the repo exists: https://github.com/proyoproject/Proyo-Linkedin-Extension

**"Permission denied":**
- Make sure you're logged into the correct GitHub account
- You need to be the owner or have write access to the repo

---

## Alternative: Web Upload

If GitHub Desktop doesn't work, see [WEB_UPLOAD_GUIDE.md](WEB_UPLOAD_GUIDE.md)
