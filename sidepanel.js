// Proyo Job Saver - Side Panel Logic

const log = (action, data = {}) => {
  console.log(`[Proyo Panel] ${new Date().toISOString()} | ${action}`, data);
};

// State management
const STATE = {
  email: null,
  isAuthenticated: false,
  currentJob: null,
  savedJobUrls: new Set(),
  isLoading: false,
  backendUrl: 'REPLACE_WITH_YOUR_RENDER_URL' // After deploying to Render, replace this with your URL (e.g., https://proyo-job-backend-abc123.onrender.com)
};

// DOM elements
const elements = {
  emailScreen: null,
  jobScreen: null,
  emailForm: null,
  emailInput: null,
  emailError: null,
  userEmail: null,
  notOnLinkedInState: null,
  jobDetailsState: null,
  loadingState: null,
  jobTitle: null,
  jobCompany: null,
  jobLocation: null,
  jobDescription: null,
  statusSelect: null,
  saveButton: null,
  saveError: null
};

// Initialize DOM element references
function initializeElements() {
  elements.emailScreen = document.getElementById('emailScreen');
  elements.jobScreen = document.getElementById('jobScreen');
  elements.emailForm = document.getElementById('emailForm');
  elements.emailInput = document.getElementById('emailInput');
  elements.emailError = document.getElementById('emailError');
  elements.userEmail = document.getElementById('userEmail');
  elements.notOnLinkedInState = document.getElementById('notOnLinkedInState');
  elements.jobDetailsState = document.getElementById('jobDetailsState');
  elements.loadingState = document.getElementById('loadingState');
  elements.jobTitle = document.getElementById('jobTitle');
  elements.jobCompany = document.getElementById('jobCompany');
  elements.jobLocation = document.getElementById('jobLocation');
  elements.jobDescription = document.getElementById('jobDescription');
  elements.statusSelect = document.getElementById('statusSelect');
  elements.saveButton = document.getElementById('saveButton');
  elements.saveError = document.getElementById('saveError');

  log('ELEMENTS_INITIALIZED');
}

// Load saved state from storage
async function loadSavedState() {
  log('LOAD_STATE_START');

  try {
    const result = await chrome.storage.local.get(['proyoEmail', 'proyoSavedJobs']);

    if (result.proyoEmail) {
      STATE.email = result.proyoEmail;
      STATE.isAuthenticated = true;
      log('STATE_LOADED', { email: STATE.email });
    }

    if (result.proyoSavedJobs) {
      STATE.savedJobUrls = new Set(result.proyoSavedJobs);
      log('SAVED_JOBS_LOADED', { count: STATE.savedJobUrls.size });
    }

    updateUI();
  } catch (error) {
    log('LOAD_STATE_ERROR', { error: error.message });
  }
}

// Save state to storage
async function saveState() {
  try {
    await chrome.storage.local.set({
      proyoEmail: STATE.email,
      proyoSavedJobs: Array.from(STATE.savedJobUrls)
    });
    log('STATE_SAVED');
  } catch (error) {
    log('SAVE_STATE_ERROR', { error: error.message });
  }
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Handle email form submission
function handleEmailSubmit(event) {
  event.preventDefault();
  log('EMAIL_SUBMIT_START');

  const email = elements.emailInput.value.trim();

  // Validate email
  if (!isValidEmail(email)) {
    showError(elements.emailError, 'Please enter a valid email address');
    log('EMAIL_INVALID', { email });
    return;
  }

  // Save email and authenticate
  STATE.email = email;
  STATE.isAuthenticated = true;
  log('AUTH_SUCCESS', { email: STATE.email });

  // Save to storage
  saveState();

  // Update UI
  updateUI();

  // Request current job data
  requestCurrentJobData();
}

// Show error message
function showError(errorElement, message) {
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
      errorElement.style.display = 'none';
    }, 5000);
  }
}

// Update UI based on current state
function updateUI() {
  log('UPDATE_UI', { isAuthenticated: STATE.isAuthenticated });

  if (!STATE.isAuthenticated) {
    // Show email entry screen
    elements.emailScreen.style.display = 'block';
    elements.jobScreen.style.display = 'none';
  } else {
    // Show job screen
    elements.emailScreen.style.display = 'none';
    elements.jobScreen.style.display = 'block';

    // Update user email display
    const emailShort = STATE.email.length > 15
      ? STATE.email.substring(0, 12) + '...'
      : STATE.email;
    elements.userEmail.textContent = emailShort;

    // Update job display
    if (!STATE.currentJob) {
      showNotOnLinkedInState();
    } else {
      showJobDetailsState();
    }
  }
}

// Show "not on LinkedIn" state
function showNotOnLinkedInState() {
  log('SHOW_NOT_ON_LINKEDIN_STATE');
  elements.notOnLinkedInState.style.display = 'flex';
  elements.jobDetailsState.style.display = 'none';
  elements.loadingState.style.display = 'none';
}

// Show job details state
function showJobDetailsState() {
  log('SHOW_JOB_DETAILS_STATE');
  elements.notOnLinkedInState.style.display = 'none';
  elements.jobDetailsState.style.display = 'block';
  elements.loadingState.style.display = 'none';

  // Update job details
  const job = STATE.currentJob;
  elements.jobTitle.textContent = job.jobTitle;
  elements.jobCompany.textContent = job.companyName;
  elements.jobLocation.textContent = `📍 ${job.location}`;

  // Truncate description for preview
  const maxDescriptionLength = 200;
  let description = job.description || 'No description available';
  if (description.length > maxDescriptionLength) {
    description = description.substring(0, maxDescriptionLength) + '...';
  }
  elements.jobDescription.textContent = description;

  // Update save button state
  if (STATE.savedJobUrls.has(job.jobUrl)) {
    elements.saveButton.textContent = '✓ Saved to Proyo';
    elements.saveButton.classList.add('btn-saved');
    elements.saveButton.disabled = true;
  } else {
    elements.saveButton.textContent = '💾 Save to Proyo';
    elements.saveButton.classList.remove('btn-saved');
    elements.saveButton.disabled = false;
  }
}

// Show loading state
function showLoadingState() {
  log('SHOW_LOADING_STATE');
  elements.notOnLinkedInState.style.display = 'none';
  elements.jobDetailsState.style.display = 'none';
  elements.loadingState.style.display = 'flex';
}

// Request current job data from content script
async function requestCurrentJobData() {
  log('REQUEST_JOB_DATA_START');

  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('linkedin.com')) {
      log('NOT_ON_LINKEDIN', { url: tab?.url });
      STATE.currentJob = null;
      updateUI();
      return;
    }

    // Request job data from content script
    chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB_DATA' }, (response) => {
      if (chrome.runtime.lastError) {
        log('CONTENT_SCRIPT_ERROR', { error: chrome.runtime.lastError.message });
        STATE.currentJob = null;
        updateUI();
        return;
      }

      if (response && response.success && response.data) {
        log('JOB_DATA_RECEIVED', { jobUrl: response.data.jobUrl });
        STATE.currentJob = response.data;
        updateUI();
      } else {
        log('NO_JOB_DATA', { response });
        STATE.currentJob = null;
        updateUI();
      }
    });
  } catch (error) {
    log('REQUEST_JOB_DATA_ERROR', { error: error.message });
    STATE.currentJob = null;
    updateUI();
  }
}

// Handle save button click
async function handleSaveJob() {
  if (!STATE.currentJob || STATE.isLoading) {
    return;
  }

  log('SAVE_JOB_START', { jobUrl: STATE.currentJob.jobUrl });

  STATE.isLoading = true;
  showLoadingState();

  try {
    // Prepare job data
    const jobData = {
      email: STATE.email,
      jobTitle: STATE.currentJob.jobTitle,
      companyName: STATE.currentJob.companyName,
      location: STATE.currentJob.location,
      description: STATE.currentJob.description,
      jobUrl: STATE.currentJob.jobUrl,
      status: elements.statusSelect.value
    };

    log('SENDING_TO_BACKEND', { backendUrl: STATE.backendUrl });

    // Send to backend
    const response = await fetch(`${STATE.backendUrl}/api/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    log('SAVE_SUCCESS', { recordId: result.recordId });

    // Mark as saved
    STATE.savedJobUrls.add(STATE.currentJob.jobUrl);
    await saveState();

    // Show success state
    STATE.isLoading = false;
    updateUI();

    // Show brief success message
    showSuccessAnimation();
  } catch (error) {
    log('SAVE_ERROR', { error: error.message });
    STATE.isLoading = false;
    updateUI();
    showError(elements.saveError, `Failed to save: ${error.message}`);
  }
}

// Show success animation
function showSuccessAnimation() {
  log('SUCCESS_ANIMATION');
  elements.saveButton.textContent = '✓ Saved!';
  elements.saveButton.classList.add('btn-saved');

  setTimeout(() => {
    elements.saveButton.textContent = '✓ Saved to Proyo';
  }, 1500);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('MESSAGE_RECEIVED', { type: message.type });

  if (message.type === 'JOB_DETECTED' && message.data) {
    log('JOB_DETECTED', { jobUrl: message.data.jobUrl });
    STATE.currentJob = message.data;
    if (STATE.isAuthenticated) {
      updateUI();
    }
  } else if (message.type === 'NOT_ON_JOB_PAGE') {
    log('NOT_ON_JOB_PAGE');
    STATE.currentJob = null;
    if (STATE.isAuthenticated) {
      updateUI();
    }
  }

  return false;
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  log('INIT_START');

  // Initialize elements
  initializeElements();

  // Load saved state
  loadSavedState();

  // Set up event listeners
  elements.emailForm.addEventListener('submit', handleEmailSubmit);
  elements.saveButton.addEventListener('click', handleSaveJob);

  // Request current job data if already authenticated
  if (STATE.isAuthenticated) {
    requestCurrentJobData();
  }

  log('INIT_COMPLETE');
});

log('SIDEPANEL_SCRIPT_LOADED');
