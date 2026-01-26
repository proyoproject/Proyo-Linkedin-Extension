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
  backendUrl: 'https://proyo-linkedin-extension.onrender.com' // After deploying to Render, replace this with your URL (e.g., https://proyo-job-backend-abc123.onrender.com)
};

// DOM elements
const elements = {
  emailScreen: null,
  jobScreen: null,
  emailForm: null,
  emailInput: null,
  emailError: null,
  userEmail: null,
  changeEmailBtn: null,
  detectJobBtn: null,
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
  elements.changeEmailBtn = document.getElementById('changeEmailBtn');
  elements.detectJobBtn = document.getElementById('detectJobBtn');
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

// Load saved state from storage (only saved jobs, NOT email)
async function loadSavedState() {
  log('LOAD_STATE_START');

  try {
    const result = await chrome.storage.local.get(['proyoSavedJobs']);

    // Don't load email - start fresh every session
    // User must enter email each time sidebar opens

    if (result.proyoSavedJobs) {
      STATE.savedJobUrls = new Set(result.proyoSavedJobs);
      log('SAVED_JOBS_LOADED', { count: STATE.savedJobUrls.size });
    }

    updateUI();
  } catch (error) {
    log('LOAD_STATE_ERROR', { error: error.message });
  }
}

// Save state to storage (only saved jobs, NOT email)
async function saveState() {
  try {
    await chrome.storage.local.set({
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

  // Save email and authenticate (NOT saved to storage)
  STATE.email = email;
  STATE.isAuthenticated = true;
  log('AUTH_SUCCESS', { email: STATE.email });

  // Update UI
  updateUI();

  // Start monitoring content script
  startMonitoring();

  // Request current job data
  requestCurrentJobData();
}

// Handle change email button click
function handleChangeEmail() {
  log('CHANGE_EMAIL_START');

  // Stop monitoring
  stopMonitoring();

  // Clear authentication state
  STATE.email = null;
  STATE.isAuthenticated = false;
  STATE.currentJob = null;

  // Reset email input
  elements.emailInput.value = '';

  // Update UI to show email screen
  updateUI();

  log('CHANGE_EMAIL_COMPLETE');
}

// Handle manual detect job button click
async function handleDetectJob() {
  log('MANUAL_DETECT_START');

  // Disable button and show loading state
  elements.detectJobBtn.disabled = true;
  elements.detectJobBtn.textContent = '🔄 Detecting...';

  try {
    // Request current job data
    await requestCurrentJobData();

    // Wait a moment for the detection to complete
    setTimeout(() => {
      elements.detectJobBtn.disabled = false;
      elements.detectJobBtn.textContent = '🔄 Detect Current Job';
    }, 1000);
  } catch (error) {
    log('MANUAL_DETECT_ERROR', { error: error.message });
    elements.detectJobBtn.disabled = false;
    elements.detectJobBtn.textContent = '🔄 Detect Current Job';
  }
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

// Start monitoring in content script
async function startMonitoring() {
  log('START_MONITORING');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('linkedin.com')) {
      log('NOT_ON_LINKEDIN', { url: tab?.url });
      return;
    }

    // Tell content script to start monitoring
    chrome.tabs.sendMessage(tab.id, { type: 'START_MONITORING' }, (response) => {
      if (chrome.runtime.lastError) {
        log('START_MONITORING_ERROR', { error: chrome.runtime.lastError.message });
      } else {
        log('START_MONITORING_SUCCESS', { response });
      }
    });
  } catch (error) {
    log('START_MONITORING_ERROR', { error: error.message });
  }
}

// Stop monitoring in content script
async function stopMonitoring() {
  log('STOP_MONITORING');

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('linkedin.com')) {
      return;
    }

    // Tell content script to stop monitoring
    chrome.tabs.sendMessage(tab.id, { type: 'STOP_MONITORING' }, (response) => {
      if (chrome.runtime.lastError) {
        log('STOP_MONITORING_ERROR', { error: chrome.runtime.lastError.message });
      } else {
        log('STOP_MONITORING_SUCCESS', { response });
      }
    });
  } catch (error) {
    log('STOP_MONITORING_ERROR', { error: error.message });
  }
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
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url.includes('linkedin.com')) {
      throw new Error('Not on LinkedIn');
    }

    // Request FULL job data (with description expansion) from content script
    log('REQUESTING_FULL_JOB_DATA');
    const fullJobData = await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_JOB_DATA_FULL' }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error('Failed to extract full job data'));
        }
      });
    });

    log('FULL_JOB_DATA_RECEIVED', { descriptionLength: fullJobData.description.length });

    // Prepare job data with full description
    const jobData = {
      email: STATE.email,
      jobTitle: fullJobData.jobTitle,
      companyName: fullJobData.companyName,
      location: fullJobData.location,
      description: fullJobData.description,
      jobUrl: fullJobData.jobUrl,
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
chrome.runtime.onMessage.addListener((message) => {
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

// Handle sidebar close
async function handleSidebarClose() {
  log('SIDEBAR_CLOSING');

  // Stop monitoring
  await stopMonitoring();

  // Clear email from storage completely (fresh start next time)
  try {
    await chrome.storage.local.remove('proyoEmail');
    log('EMAIL_CLEARED_FROM_STORAGE');
  } catch (error) {
    log('EMAIL_CLEAR_ERROR', { error: error.message });
  }

  // Clear in-memory state
  STATE.email = null;
  STATE.isAuthenticated = false;
  STATE.currentJob = null;

  log('SIDEBAR_CLOSED_CLEANUP_COMPLETE');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  log('INIT_START');

  // Initialize elements
  initializeElements();

  // Load saved state (only saved jobs, NOT email)
  loadSavedState();

  // Set up event listeners
  elements.emailForm.addEventListener('submit', handleEmailSubmit);
  elements.saveButton.addEventListener('click', handleSaveJob);
  elements.changeEmailBtn.addEventListener('click', handleChangeEmail);
  elements.detectJobBtn.addEventListener('click', handleDetectJob);

  // Clean up when sidebar closes
  window.addEventListener('beforeunload', handleSidebarClose);
  window.addEventListener('pagehide', handleSidebarClose);

  log('INIT_COMPLETE');
});

log('SIDEPANEL_SCRIPT_LOADED');
