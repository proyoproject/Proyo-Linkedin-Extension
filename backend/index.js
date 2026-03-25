// Proyo Job Saver - Backend API
// Express server with Airtable integration

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Airtable = require('airtable');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging utility
const log = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[Proyo API] ${timestamp} | ${action}`, JSON.stringify(data, null, 2));
};

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Chrome extension. Restrict in production if needed.
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  log('REQUEST', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Validate environment variables
const requiredEnvVars = ['AIRTABLE_API_KEY', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  log('ENV_ERROR', { missing: missingEnvVars });
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Initialize Airtable
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
const table = base(process.env.AIRTABLE_TABLE_NAME);

log('AIRTABLE_CONFIGURED', {
  baseId: process.env.AIRTABLE_BASE_ID.substring(0, 8) + '...',
  tableName: process.env.AIRTABLE_TABLE_NAME
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  };

  log('HEALTH_CHECK', healthData);
  res.json(healthData);
});

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>]/g, ''); // Remove angle brackets
}

// POST /api/jobs - Save job to Airtable
app.post('/api/jobs', async (req, res) => {
  const startTime = Date.now();
  log('SAVE_JOB_REQUEST', {
    body: {
      email: req.body.email,
      jobTitle: req.body.jobTitle,
      companyName: req.body.companyName,
      jobUrl: req.body.jobUrl
    }
  });

  try {
    // Validate required fields
    const { email, jobTitle, companyName, location, description, jobUrl, status } = req.body;

    if (!email || !jobTitle || !companyName || !jobUrl) {
      log('VALIDATION_ERROR', { missing: { email: !email, jobTitle: !jobTitle, companyName: !companyName, jobUrl: !jobUrl } });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, jobTitle, companyName, jobUrl'
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      log('INVALID_EMAIL', { email });
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(email),
      jobTitle: sanitizeInput(jobTitle),
      companyName: sanitizeInput(companyName),
      location: sanitizeInput(location || 'Not specified'),
      description: sanitizeInput(description || ''),
      jobUrl: sanitizeInput(jobUrl),
      status: sanitizeInput(status || 'Saved')
    };

    // Check for duplicate job URL for this user
    try {
      const existingRecords = await table.select({
        filterByFormula: `AND({email} = '${sanitizedData.email}', {job-url} = '${sanitizedData.jobUrl}')`,
        maxRecords: 1
      }).firstPage();

      if (existingRecords.length > 0) {
        log('DUPLICATE_JOB', { email: sanitizedData.email, jobUrl: sanitizedData.jobUrl });
        return res.status(409).json({
          success: false,
          message: 'This job has already been saved',
          recordId: existingRecords[0].id
        });
      }
    } catch (duplicateCheckError) {
      // Log but don't fail on duplicate check error
      log('DUPLICATE_CHECK_ERROR', { error: duplicateCheckError.message });
    }

    // Create record in Airtable
    const record = await table.create([
      {
        fields: {
          'email': sanitizedData.email,
          'job-title': sanitizedData.jobTitle,
          'company': sanitizedData.companyName,
          'location': sanitizedData.location,
          'job-description': sanitizedData.description,
          'Status': sanitizedData.status,
          'job-url': sanitizedData.jobUrl,
          'created-date': new Date().toISOString()
        }
      }
    ]);

    const recordId = record[0].id;
    const duration = Date.now() - startTime;

    log('SAVE_SUCCESS', {
      recordId,
      email: sanitizedData.email,
      jobTitle: sanitizedData.jobTitle,
      duration: `${duration}ms`
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      recordId: recordId
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    log('SAVE_ERROR', {
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`
    });

    // Check if it's an Airtable error
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: `Airtable error: ${error.message}`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 404 handler
app.use((req, res) => {
  log('NOT_FOUND', { path: req.path });
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  log('UNHANDLED_ERROR', {
    error: error.message,
    stack: error.stack
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  log('SERVER_STARTED', {
    port: PORT,
    nodeVersion: process.version,
    platform: process.platform
  });
  console.log(`\n🚀 Proyo Job Saver API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Save job: POST http://localhost:${PORT}/api/jobs\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SHUTDOWN', { signal: 'SIGTERM' });
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SHUTDOWN', { signal: 'SIGINT' });
  process.exit(0);
});
