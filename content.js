// Proyo Job Saver - Content Script for LinkedIn

const log = (action, data = {}) => {
  console.log(`[Proyo Content] ${new Date().toISOString()} | ${action}`, data);
};

// LinkedIn selector configurations with fallbacks
const SELECTORS = {
  jobTitle: [
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    'h1.t-24.t-bold',
    '.jobs-details-top-card__job-title h1',
    'h2.job-details-jobs-unified-top-card__job-title'
  ],
  companyName: [
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__primary-description a',
    '.job-details-jobs-unified-top-card__primary-description a',
    'a.app-aware-link[data-tracking-control-name="public_jobs_topcard-org-name"]'
  ],
  location: [
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__workplace-type',
    'span.jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__primary-description span'
  ],
  description: [
    '.jobs-description-content__text',
    '.jobs-description__content',
    '#job-details',
    '.jobs-box__html-content',
    'article.jobs-description__container'
  ],
  // Container that holds all job details
  jobDetailsContainer: [
    '.jobs-search__job-details',
    '.jobs-details',
    'div[class*="job-details"]',
    '.jobs-search__right-rail'
  ]
};

// State management
let currentJobData = null;
let observer = null;
let lastDetectedJobUrl = null;

// Helper function to try multiple selectors
function findElementBySelectors(selectors, root = document) {
  for (const selector of selectors) {
    try {
      const element = root.querySelector(selector);
      if (element && element.textContent.trim()) {
        log('SELECTOR_MATCH', { selector, text: element.textContent.trim().substring(0, 50) });
        return element;
      }
    } catch (error) {
      log('SELECTOR_ERROR', { selector, error: error.message });
    }
  }
  log('SELECTOR_NO_MATCH', { selectors });
  return null;
}

// Extract job URL from current page
function extractJobUrl() {
  try {
    // Method 1: From URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const currentJobId = urlParams.get('currentJobId');
    if (currentJobId) {
      const url = `https://www.linkedin.com/jobs/view/${currentJobId}/`;
      log('JOB_URL_EXTRACTED', { method: 'url_param', url });
      return url;
    }

    // Method 2: From pathname
    const pathMatch = window.location.pathname.match(/\/jobs\/view\/(\d+)/);
    if (pathMatch && pathMatch[1]) {
      const url = `https://www.linkedin.com/jobs/view/${pathMatch[1]}/`;
      log('JOB_URL_EXTRACTED', { method: 'pathname', url });
      return url;
    }

    // Method 3: Current page URL as fallback
    const url = window.location.href.split('?')[0];
    log('JOB_URL_EXTRACTED', { method: 'fallback', url });
    return url;
  } catch (error) {
    log('JOB_URL_ERROR', { error: error.message });
    return window.location.href;
  }
}

// Extract all job data from the page
function extractJobData() {
  log('EXTRACT_JOB_DATA_START');

  const jobUrl = extractJobUrl();

  // Check if we're on a job listing page
  if (!window.location.href.includes('linkedin.com/jobs')) {
    log('NOT_ON_JOBS_PAGE', { url: window.location.href });
    return null;
  }

  // Extract data using selectors
  const titleElement = findElementBySelectors(SELECTORS.jobTitle);
  const companyElement = findElementBySelectors(SELECTORS.companyName);
  const locationElement = findElementBySelectors(SELECTORS.location);
  const descriptionElement = findElementBySelectors(SELECTORS.description);

  if (!titleElement || !companyElement) {
    log('MISSING_REQUIRED_FIELDS', {
      hasTitle: !!titleElement,
      hasCompany: !!companyElement
    });
    return null;
  }

  const jobData = {
    jobTitle: titleElement.textContent.trim(),
    companyName: companyElement.textContent.trim(),
    location: locationElement ? locationElement.textContent.trim() : 'Not specified',
    description: descriptionElement ? descriptionElement.textContent.trim() : '',
    jobUrl: jobUrl,
    extractedAt: new Date().toISOString()
  };

  log('JOB_DATA_EXTRACTED', {
    jobTitle: jobData.jobTitle,
    companyName: jobData.companyName,
    jobUrl: jobData.jobUrl
  });

  return jobData;
}

// Detect job changes and notify side panel
function detectAndNotifyJobChange() {
  const jobData = extractJobData();

  if (!jobData) {
    log('NO_JOB_DATA_DETECTED');
    // Notify side panel that we're not on a job page
    chrome.runtime.sendMessage({
      type: 'NOT_ON_JOB_PAGE',
      url: window.location.href
    }).catch(() => {
      // Side panel might not be open
    });
    return;
  }

  // Check if this is a different job from the last one
  if (jobData.jobUrl !== lastDetectedJobUrl) {
    log('NEW_JOB_DETECTED', { jobUrl: jobData.jobUrl });
    lastDetectedJobUrl = jobData.jobUrl;
    currentJobData = jobData;

    // Send to side panel via background script
    chrome.runtime.sendMessage({
      type: 'JOB_DETECTED',
      data: jobData
    }).catch((error) => {
      log('MESSAGE_SEND_ERROR', { error: error.message });
    });
  }
}

// Initialize MutationObserver to watch for job changes
function initializeObserver() {
  log('INIT_OBSERVER_START');

  // Try to find the job details container
  const container = findElementBySelectors(SELECTORS.jobDetailsContainer);

  if (!container) {
    log('CONTAINER_NOT_FOUND', { retryIn: '2s' });
    // Retry after 2 seconds
    setTimeout(initializeObserver, 2000);
    return;
  }

  log('CONTAINER_FOUND', { selector: container.className });

  // Disconnect existing observer if any
  if (observer) {
    observer.disconnect();
  }

  // Create new observer
  observer = new MutationObserver((mutations) => {
    log('MUTATION_DETECTED', { count: mutations.length });

    // Debounce: wait a bit before extracting to ensure DOM is stable
    clearTimeout(window.proyoDebounceTimer);
    window.proyoDebounceTimer = setTimeout(() => {
      detectAndNotifyJobChange();
    }, 500);
  });

  // Start observing
  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: false
  });

  log('OBSERVER_ATTACHED', { target: container.tagName });

  // Initial detection
  detectAndNotifyJobChange();
}

// Listen for messages from side panel (via background script)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('MESSAGE_RECEIVED', { type: message.type });

  if (message.type === 'EXTRACT_JOB_DATA') {
    const jobData = extractJobData();
    sendResponse({ success: true, data: jobData });
    return true;
  }

  return false;
});

// Handle URL changes (LinkedIn is a SPA)
let lastUrl = window.location.href;
const urlObserver = new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    log('URL_CHANGED', { from: lastUrl, to: currentUrl });
    lastUrl = currentUrl;

    // Reinitialize observer if on jobs page
    if (currentUrl.includes('linkedin.com/jobs')) {
      setTimeout(() => {
        initializeObserver();
      }, 1000);
    } else {
      log('LEFT_JOBS_PAGE');
      // Notify side panel
      chrome.runtime.sendMessage({
        type: 'NOT_ON_JOB_PAGE',
        url: currentUrl
      }).catch(() => {});
    }
  }
});

// Observe URL changes
urlObserver.observe(document, { subtree: true, childList: true });

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    log('DOM_CONTENT_LOADED');
    setTimeout(initializeObserver, 1000);
  });
} else {
  log('CONTENT_SCRIPT_LOADED', { readyState: document.readyState });
  setTimeout(initializeObserver, 1000);
}

log('CONTENT_SCRIPT_INITIALIZED', { url: window.location.href });
