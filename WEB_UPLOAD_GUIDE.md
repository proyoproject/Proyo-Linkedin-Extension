# Upload Code to GitHub via Web Browser

Upload your code directly through GitHub website - no software needed!

---

## ⚠️ IMPORTANT: Exclude These Files

**DO NOT upload:**
- `backend/.env` - Contains your API token!
- `.DS_Store` files
- `node_modules/` folder (if it exists)

---

## Method 1: Drag and Drop (Easiest)

### Step 1: Go to Your Repository

Go to: **https://github.com/proyoproject/Proyo-Linkedin-Extension**

### Step 2: Prepare Files

1. Open Finder
2. Go to: `/Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
3. Create a new folder on your Desktop called `github-upload`
4. Copy ALL files and folders to `github-upload` EXCEPT:
   - ❌ `backend/.env` (IMPORTANT!)
   - ❌ `.DS_Store`
   - ❌ `node_modules/` (if exists)
   - ❌ `favicon_io/` (you don't need this - icons are already in icons/ folder)

### Step 3: Upload Main Files First

1. On GitHub, click **"uploading an existing file"** or **"Add file"** → **"Upload files"**
2. Drag these files from `github-upload` into the browser:
   - `manifest.json`
   - `background.js`
   - `content.js`
   - `sidepanel.html`
   - `sidepanel.js`
   - `sidepanel.css`
   - `render.yaml`
   - All `.md` files (README, DEPLOY, etc.)
   - All `.sh` and `.py` files
   - `.gitignore`
3. Scroll down
4. Commit message: **Add extension files**
5. Click **"Commit changes"**

### Step 4: Upload Folders

Now upload folders one by one:

**Upload icons folder:**
1. Click **"Add file"** → **"Upload files"**
2. Drag the entire `icons/` folder
3. Commit message: **Add icons**
4. Click **"Commit changes"**

**Upload backend folder:**
1. Click **"Add file"** → **"Upload files"**
2. From `backend/` folder, drag:
   - `index.js`
   - `package.json`
   - `.env.example` (NOT `.env`!)
   - `README.md`
3. **IMPORTANT:** Make sure you're dragging from `backend/` so they go into a `backend/` folder on GitHub
4. Commit message: **Add backend files**
5. Click **"Commit changes"**

---

## Method 2: Upload as ZIP (Alternative)

### Step 1: Create Clean ZIP

1. Open Finder
2. Go to: `/Users/erturkpoyrazmba/Desktop/proyo-extension-2026`
3. Create a folder called `proyo-clean`
4. Copy ALL files EXCEPT:
   - ❌ `backend/.env`
   - ❌ `.DS_Store`
   - ❌ `node_modules/`
   - ❌ `favicon_io/`
5. Right-click `proyo-clean` → **Compress**
6. You'll get `proyo-clean.zip`

### Step 2: Extract and Upload

1. Extract `proyo-clean.zip` to see the files
2. Go to: https://github.com/proyoproject/Proyo-Linkedin-Extension
3. Click **"Add file"** → **"Upload files"**
4. Drag all the extracted files and folders into the browser
5. Commit message: **Initial commit: Proyo Job Saver**
6. Click **"Commit changes"**

---

## ✅ Verify Upload

After uploading, check:

1. Go to: https://github.com/proyoproject/Proyo-Linkedin-Extension
2. You should see:
   - ✅ `manifest.json`
   - ✅ `background.js`, `content.js`, `sidepanel.js`, etc.
   - ✅ `backend/` folder with `index.js` and `package.json`
   - ✅ `icons/` folder with PNG files
   - ✅ `.gitignore`
   - ✅ Documentation files (.md files)
3. **IMPORTANT:** Make sure you DON'T see:
   - ❌ `backend/.env` (should NOT be there!)
   - ❌ `.DS_Store`

---

## 🔒 Security Check

**CRITICAL:** After upload, verify `backend/.env` is NOT on GitHub:

1. Go to: https://github.com/proyoproject/Proyo-Linkedin-Extension/tree/main/backend
2. You should see:
   - ✅ `.env.example` (template file - OK to upload)
   - ✅ `index.js`
   - ✅ `package.json`
   - ✅ `README.md`
3. You should NOT see:
   - ❌ `.env` (this contains your API token!)

If you accidentally uploaded `.env`:
1. Click on it
2. Click the trash icon (🗑️) to delete it
3. Commit the deletion immediately

---

## Expected File Structure on GitHub

```
Proyo-Linkedin-Extension/
├── .gitignore
├── manifest.json
├── background.js
├── content.js
├── sidepanel.html
├── sidepanel.js
├── sidepanel.css
├── render.yaml
├── All .md files (README, DEPLOY, etc.)
├── create-icons.sh
├── create-icons.py
├── push-to-github.sh
├── backend/
│   ├── .env.example ✅
│   ├── index.js
│   ├── package.json
│   └── README.md
│   (NO .env file!)
└── icons/
    ├── icon16.png
    ├── icon48.png
    ├── icon128.png
    ├── icon.svg
    └── README.md
```

---

## Next Steps

Once code is on GitHub:

1. ✅ Verify files are uploaded correctly
2. ✅ Verify `backend/.env` is NOT there
3. 📖 Follow [DEPLOY.md](DEPLOY.md) to deploy to Render
4. 🔧 Update `sidepanel.js` with your Render URL
5. 🚀 Load extension in Chrome!

---

## Need Help?

If web upload is confusing, try:
- **[GITHUB_DESKTOP_GUIDE.md](GITHUB_DESKTOP_GUIDE.md)** - Visual app (easier!)
- Or let me know what error you're getting
