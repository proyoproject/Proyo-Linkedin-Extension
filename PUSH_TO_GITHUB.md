# Push to GitHub Instructions

Your code is ready to push to: **https://github.com/proyoproject/Proyo-Linkedin-Extension.git**

## ⚠️ First: Install Xcode Command Line Tools

Git on macOS requires Xcode Command Line Tools. Install them:

```bash
xcode-select --install
```

A popup will appear - click "Install" and wait 5-10 minutes.

After installation, verify git works:
```bash
git --version
```

---

## Option 1: Use the Automated Script (Easiest!)

Once Xcode tools are installed:

```bash
cd /Users/erturkpoyrazmba/Desktop/proyo-extension-2026
./push-to-github.sh
```

The script will:
1. Initialize git repository
2. Show you what will be committed
3. Ask for confirmation
4. Commit and push to GitHub

**Important:** Make sure `backend/.env` is NOT in the files list!

---

## Option 2: Manual Push (Step-by-Step)

If you prefer to do it manually:

### Step 1: Initialize Git

```bash
cd /Users/erturkpoyrazmba/Desktop/proyo-extension-2026
git init
git branch -M main
```

### Step 2: Add Remote

```bash
git remote add origin https://github.com/proyoproject/Proyo-Linkedin-Extension.git
```

### Step 3: Check What Will Be Committed

```bash
git status
```

**⚠️ IMPORTANT:** Make sure these are NOT listed:
- `backend/.env` (contains your API token!)
- `.DS_Store` files

These should be excluded by `.gitignore` automatically.

### Step 4: Add Files

```bash
git add .
```

### Step 5: Commit

```bash
git commit -m "Initial commit: Proyo LinkedIn Job Saver Extension

- Chrome extension with LinkedIn job detection
- Backend API with Airtable integration
- Complete documentation and deployment guides
- Icons and configuration ready for deployment"
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

You may be prompted for your GitHub username and password/token.

---

## After Pushing to GitHub

1. Go to: https://github.com/proyoproject/Proyo-Linkedin-Extension
2. Verify your code is there
3. Check that `backend/.env` is NOT visible (it should be ignored)
4. Proceed with deployment using [DEPLOY.md](DEPLOY.md)

---

## Troubleshooting

**"xcode-select: command not found"**
- Install Xcode Command Line Tools: `xcode-select --install`

**"Permission denied"**
- You may need to authenticate with GitHub
- Use a Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

**"Failed to push"**
- Check you have access to the repository
- Verify the repository exists: https://github.com/proyoproject/Proyo-Linkedin-Extension
- Try: `git remote -v` to verify the URL is correct

---

## Security Check ✅

Before pushing, verify these files are in `.gitignore`:

- ✅ `backend/.env` - Contains your Airtable API token
- ✅ `.DS_Store` - macOS system files
- ✅ `node_modules/` - Dependencies (will be installed on Render)

The `.gitignore` file is already configured correctly!

---

## Next Steps

After successfully pushing to GitHub:

1. **Deploy to Render** - Follow [DEPLOY.md](DEPLOY.md)
2. **Update Extension** - Add your Render URL to `sidepanel.js`
3. **Test Everything** - Load extension in Chrome and save a job!

**Questions?** Check [DEPLOY.md](DEPLOY.md) for the complete deployment guide.
