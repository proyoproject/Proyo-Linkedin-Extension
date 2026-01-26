# Proyo Job Saver - Backend API

Express.js backend API that saves LinkedIn job data to Airtable. Designed to be deployed on Render.

## Features

- 🔒 Input validation and sanitization
- 🚦 CORS enabled for Chrome extension
- 📊 Comprehensive logging
- ✅ Health check endpoint
- 🔄 Duplicate job detection
- ⚡ Fast response times

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Airtable
- **Hosting**: Render (or any Node.js hosting)

## Prerequisites

Before deploying, you need:

1. **Airtable Account** - [Sign up here](https://airtable.com/signup)
2. **Render Account** - [Sign up here](https://render.com) (or use another hosting service)
3. **Node.js 18+** installed locally (for testing)

## Setup Instructions

### Part 1: Configure Airtable

#### Step 1: Create Airtable Base

1. Log in to [Airtable](https://airtable.com)
2. Click **"Add a base"** → **"Start from scratch"**
3. Name it: `Proyo Jobs` (or any name you prefer)

#### Step 2: Create Jobs Table

1. Rename the default table to **`Jobs`** (case-sensitive!)
2. Add the following fields:

| Field Name   | Field Type       | Configuration                                           |
|--------------|------------------|---------------------------------------------------------|
| Job Title    | Single line text | -                                                       |
| Company Name | Single line text | -                                                       |
| Location     | Single line text | -                                                       |
| Description  | Long text        | Enable rich text formatting (optional)                  |
| Email        | Email            | -                                                       |
| Status       | Single select    | Options: "Not Applied", "Applied", "Interview", "Rejected", "Offer" |
| Added Date   | Date             | Date format: Local (YYYY-MM-DD)                        |
| Job URL      | URL              | -                                                       |

**Important Notes:**
- Field names must match exactly (including spaces and capitalization)
- Status options must match exactly (case-sensitive)
- The first column "Name" will be auto-created by Airtable - you can ignore or hide it

#### Step 3: Get Airtable API Credentials

**Get API Key (Personal Access Token):**

1. Go to [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click **"Create new token"**
3. Name it: `Proyo Job Saver`
4. Add these scopes:
   - `data.records:read`
   - `data.records:write`
5. Add access to your base:
   - Click **"Add a base"**
   - Select `Proyo Jobs` base
6. Click **"Create token"**
7. Copy the token (starts with `pat...`) - **save it securely!**

**Get Base ID:**

1. Go to [https://airtable.com/api](https://airtable.com/api)
2. Select your `Proyo Jobs` base
3. The Base ID is shown in the introduction section (starts with `app...`)
4. Example: `appABCDEF12345678`

**Get Table Name:**
- Use exactly: `Jobs` (or whatever you named your table)

### Part 2: Local Testing (Optional)

#### Step 1: Install Dependencies

```bash
cd backend
npm install
```

#### Step 2: Configure Environment

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
AIRTABLE_API_KEY=patYourActualKeyHere
AIRTABLE_BASE_ID=appYourActualBaseIdHere
AIRTABLE_TABLE_NAME=Jobs
PORT=3000
NODE_ENV=development
```

#### Step 3: Run Locally

```bash
npm start
```

The server will start on `http://localhost:3000`

#### Step 4: Test Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

#### Step 5: Test Job Save (Optional)

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@proyo.app",
    "jobTitle": "Test Job",
    "companyName": "Test Company",
    "location": "Remote",
    "description": "This is a test job",
    "jobUrl": "https://linkedin.com/jobs/view/123456/",
    "status": "Not Applied"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Job saved successfully",
  "recordId": "recXXXXXXXXXXXXXX"
}
```

Check Airtable to verify the record was created!

### Part 3: Deploy to Render

#### Step 1: Push Code to GitHub (if not already)

```bash
cd ..  # Go back to project root
git init
git add .
git commit -m "Initial commit: Proyo Job Saver"
git branch -M main
git remote add origin https://github.com/yourusername/proyo-job-saver.git
git push -u origin main
```

#### Step 2: Create Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

**Basic Settings:**
- **Name**: `proyo-job-backend` (or any name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (or paid plan for better performance)

#### Step 3: Add Environment Variables

In the Render dashboard, scroll to **"Environment Variables"** and add:

| Key                    | Value                          |
|------------------------|--------------------------------|
| `AIRTABLE_API_KEY`     | `patYourActualKeyHere`        |
| `AIRTABLE_BASE_ID`     | `appYourActualBaseIdHere`     |
| `AIRTABLE_TABLE_NAME`  | `Jobs`                         |
| `NODE_ENV`             | `production`                   |

**Important:** Don't add `PORT` - Render sets this automatically

#### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your service
3. Wait for the deployment to complete (2-3 minutes)
4. You'll get a URL like: `https://proyo-job-backend.onrender.com`

#### Step 5: Verify Deployment

Test the health endpoint:

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

### Part 4: Connect to Chrome Extension

1. Open the Chrome extension code
2. Edit `sidepanel.js`
3. Update line 17 with your Render URL:

```javascript
backendUrl: 'https://proyo-job-backend.onrender.com'  // Your actual Render URL
```

4. Reload the extension in Chrome (`chrome://extensions/`)
5. Test saving a job from LinkedIn!

## API Documentation

### Endpoints

#### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

#### POST /api/jobs

Save a job to Airtable.

**Request Body:**
```json
{
  "email": "user@proyo.app",
  "jobTitle": "Senior Software Engineer",
  "companyName": "Spotify",
  "location": "Stockholm, Sweden",
  "description": "We are looking for...",
  "jobUrl": "https://linkedin.com/jobs/view/123456/",
  "status": "Not Applied"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job saved successfully",
  "recordId": "recXXXXXXXXXXXXXX"
}
```

**Error Response (400/409/500):**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Logging

All requests and operations are logged with timestamps:

```
[Proyo API] 2024-01-15T10:30:00.000Z | REQUEST | {"method":"POST","path":"/api/jobs"}
[Proyo API] 2024-01-15T10:30:00.100Z | SAVE_JOB_REQUEST | {"body":{...}}
[Proyo API] 2024-01-15T10:30:00.500Z | SAVE_SUCCESS | {"recordId":"recXYZ","duration":"400ms"}
```

View logs in Render:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Real-time logs will appear

## Troubleshooting

### "Missing required environment variables"

**Problem:** Server won't start

**Solution:**
1. Check Render environment variables are set correctly
2. Verify no typos in variable names
3. Check API key starts with `pat...`
4. Check Base ID starts with `app...`

### "Airtable error: NOT_FOUND"

**Problem:** Can't find table

**Solution:**
1. Verify `AIRTABLE_TABLE_NAME` exactly matches your table name (case-sensitive)
2. Check the table exists in the base
3. Verify Base ID is correct

### "Airtable error: INVALID_REQUEST"

**Problem:** Field names don't match

**Solution:**
1. Check field names in Airtable exactly match the code
2. Field names are case-sensitive and space-sensitive
3. Example: "Job Title" not "job title" or "JobTitle"

### "Duplicate job" error

This is expected behavior! The API prevents saving the same job URL for the same user twice.

### Render free tier sleeping

Render free tier services sleep after 15 minutes of inactivity. First request after sleeping may take 30-60 seconds.

**Solutions:**
- Upgrade to paid tier ($7/month)
- Use a service like [UptimeRobot](https://uptimerobot.com/) to ping every 10 minutes
- Accept the cold start delay

## Security Notes

- API keys are stored as environment variables (not in code)
- Input validation prevents XSS attacks
- Email format is validated
- CORS is configured for Chrome extension origin
- Duplicate job detection prevents spam

## Monitoring

**Check server health:**
```bash
curl https://your-app.onrender.com/api/health
```

**Check Render logs:**
1. Render Dashboard → Your Service → Logs tab

**Check Airtable:**
1. Open your Airtable base
2. View the Jobs table
3. Verify records are being created

## Updating

To update the backend:

1. Make changes to code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update backend"
   git push
   ```
3. Render will automatically redeploy (auto-deploy is enabled by default)

## Support

Common issues:
1. Check Render logs for errors
2. Verify Airtable credentials are correct
3. Test health endpoint first
4. Check CORS if extension can't connect

## License

Private project for Proyo
