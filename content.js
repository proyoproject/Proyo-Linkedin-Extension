// Proyo Job Saver - Content Script for LinkedIn

const log = (action, data = {}) => {
  console.log(`[Proyo Content] ${new Date().toISOString()} | ${action}`, data);
};

// LinkedIn selector configurations with extensive fallbacks
const SELECTORS = {
  jobTitle: [
    // Modern LinkedIn (2024-2026)
    '.job-details-jobs-unified-top-card__job-title',
    '.jobs-unified-top-card__job-title',
    'h1.job-details-jobs-unified-top-card__job-title',
    'h2.job-details-jobs-unified-top-card__job-title',
    // Previous versions
    'h1.t-24.t-bold',
    '.jobs-details-top-card__job-title h1',
    '.jobs-details-top-card__job-title',
    // Generic patterns - search for any element with "job" and "title" in class
    'h1[class*="job"][class*="title"]',
    'h2[class*="job"][class*="title"]',
    'h1[class*="jobs-unified-top-card"]',
    'h2[class*="jobs-unified-top-card"]',
    // Very generic fallbacks - any large heading on a jobs page
    'h1[class*="job"]',
    'h2[class*="job"]',
    'main h1',
    'h1'
  ],
  companyName: [
    // Modern LinkedIn (2024-2026)
    '.job-details-jobs-unified-top-card__company-name',
    '.jobs-unified-top-card__company-name',
    '.job-details-jobs-unified-top-card__primary-description a',
    '.jobs-unified-top-card__primary-description a',
    // Previous versions
    'a.app-aware-link[data-tracking-control-name="public_jobs_topcard-org-name"]',
    'a[data-tracking-control-name*="company"]',
    // Generic patterns
    'a[class*="company-name"]',
    'a[class*="company"][class*="name"]',
    '.jobs-unified-top-card__subtitle a',
    'a[class*="jobs-unified-top-card"][class*="company"]',
    // Very generic - any link near the job title
    'h1 ~ * a',
    'h2 ~ * a',
    'main a[href*="company"]'
  ],
  location: [
    // Modern LinkedIn (2024-2026)
    '.job-details-jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__bullet',
    '.jobs-unified-top-card__workplace-type',
    'span.jobs-unified-top-card__bullet',
    '.job-details-jobs-unified-top-card__primary-description span',
    // Generic patterns
    'span[class*="bullet"]',
    'span[class*="location"]',
    'span[class*="workplace"]',
    '.jobs-unified-top-card__subtitle-primary-grouping span',
    // Very generic
    'span[class*="job"][class*="bullet"]',
    'main span[class*="t-black--light"]'
  ],
  description: [
    // Modern LinkedIn (2024-2026)
    '.jobs-description-content__text',
    '.jobs-description__content',
    'div[class*="jobs-description-content"]',
    'div[class*="jobs-description"]',
    // Previous versions
    '#job-details',
    '.jobs-box__html-content',
    'article.jobs-description__container',
    // Generic patterns
    'div[class*="description"][class*="content"]',
    'article[class*="description"]',
    'div[class*="job-description"]',
    // Very generic
    'main article',
    'main div[class*="description"]'
  ],
  // Container that holds all job details
  jobDetailsContainer: [
    '.jobs-search__job-details',
    '.jobs-details',
    'div[class*="job-details"]',
    '.jobs-search__right-rail',
    'main[class*="scaffold-layout__main"]',
    'div[class*="jobs-search"]',
    'main',
    'body' // Ultimate fallback
  ]
};

// State management
let currentJobData = null;
let observer = null;
let lastDetectedJobUrl = null;

// Helper function to try multiple selectors
function findElementBySelectors(selectors, root = document) {
  log('TRYING_SELECTORS', { count: selectors.length, firstSelector: selectors[0] });

  for (let i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    try {
      const element = root.querySelector(selector);
      if (element && element.textContent.trim()) {
        log('SELECTOR_MATCH', {
          selectorIndex: i,
          selector,
          text: element.textContent.trim().substring(0, 50)
        });
        return element;
      }
    } catch (error) {
      log('SELECTOR_ERROR', { selector, error: error.message });
    }
  }
  log('SELECTOR_NO_MATCH', {
    selectorCount: selectors.length,
    firstThree: selectors.slice(0, 3)
  });
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
  log('EXTRACT_JOB_DATA_START', { url: window.location.href });

  const jobUrl = extractJobUrl();

  // Check if we're on a job listing page
  if (!window.location.href.includes('linkedin.com/jobs')) {
    log('NOT_ON_JOBS_PAGE', { url: window.location.href });
    return null;
  }

  // Extract data using selectors
  log('EXTRACTING_TITLE');
  const titleElement = findElementBySelectors(SELECTORS.jobTitle);

  log('EXTRACTING_COMPANY');
  const companyElement = findElementBySelectors(SELECTORS.companyName);

  log('EXTRACTING_LOCATION');
  const locationElement = findElementBySelectors(SELECTORS.location);

  log('EXTRACTING_DESCRIPTION');
  const descriptionElement = findElementBySelectors(SELECTORS.description);

  if (!titleElement || !companyElement) {
    log('MISSING_REQUIRED_FIELDS', {
      hasTitle: !!titleElement,
      hasCompany: !!companyElement,
      hasLocation: !!locationElement,
      hasDescription: !!descriptionElement
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

  log('JOB_DATA_EXTRACTED_SUCCESS', {
    jobTitle: jobData.jobTitle.substring(0, 50),
    companyName: jobData.companyName,
    location: jobData.location.substring(0, 50),
    descriptionLength: jobData.description.length,
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
  log('INIT_OBSERVER_START', { url: window.location.href });

  // Try to find the job details container
  const container = findElementBySelectors(SELECTORS.jobDetailsContainer);

  if (!container) {
    log('CONTAINER_NOT_FOUND_TRYING_ANYWAY', { willRetry: true });
    // Try to extract data anyway, even without a container
    detectAndNotifyJobChange();

    // Retry after 2 seconds to find a better container
    setTimeout(initializeObserver, 2000);
    return;
  }

  log('CONTAINER_FOUND', {
    tagName: container.tagName,
    className: container.className.substring(0, 100)
  });

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
