#!/bin/bash

# Proyo Job Saver - Push to GitHub Script
# This script safely pushes your code to GitHub without exposing secrets

echo "🚀 Pushing Proyo Job Saver to GitHub..."
echo ""

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
  echo "Initializing git repository..."
  git init
  git branch -M main
fi

# Add all files (sensitive files are excluded by .gitignore)
echo "Adding files to git..."
git add .

# Show what will be committed (check that .env is NOT in the list)
echo ""
echo "Files to be committed:"
git status --short

echo ""
echo "⚠️  IMPORTANT: Check that backend/.env is NOT in the list above!"
echo "   It should be ignored by .gitignore"
echo ""
read -p "Continue with commit? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Commit
  echo "Creating commit..."
  git commit -m "Initial commit: Proyo LinkedIn Job Saver Extension

- Chrome extension with LinkedIn job detection
- Backend API with Airtable integration
- Complete documentation and deployment guides
- Icons and configuration ready for deployment"

  # Add remote if not exists
  if ! git remote | grep -q origin; then
    echo "Adding GitHub remote..."
    git remote add origin https://github.com/proyoproject/Proyo-Linkedin-Extension.git
  fi

  # Push to GitHub
  echo "Pushing to GitHub..."
  git push -u origin main

  echo ""
  echo "✅ Successfully pushed to GitHub!"
  echo ""
  echo "Next steps:"
  echo "1. Go to https://github.com/proyoproject/Proyo-Linkedin-Extension"
  echo "2. Verify your code is there"
  echo "3. Follow DEPLOY.md to deploy to Render"
else
  echo "Push cancelled."
fi
