// Proyo Job Saver - Background Service Worker

const log = (action, data = {}) => {
  console.log(`[Proyo Background] ${new Date().toISOString()} | ${action}`, data);
};

// Fetch the canonical job posting from LinkedIn's public guest endpoint.
// Returns parsed structured data on success, throws on non-2xx or parse failure.
async function fetchJobFromGuestApi(jobId) {
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${jobId}`;
  log('GUEST_FETCH_START', { jobId, url });

  const res = await fetch(url, { credentials: 'omit' });
  log('GUEST_FETCH_STATUS', { jobId, status: res.status });

  if (!res.ok) {
    throw new Error(`Guest endpoint returned HTTP ${res.status}`);
  }

  const html = await res.text();
  return parseGuestJobHtml(html, jobId);
}

// Parse the HTML fragment from the guest endpoint into a structured job object.
// Each field has a primary selector with at least one fallback. Optional fields
// default to null instead of throwing when missing.
function parseGuestJobHtml(html, jobId) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const trySelectors = (selectors) => {
    for (const sel of selectors) {
      try {
        const el = doc.querySelector(sel);
        if (el && el.textContent && el.textContent.trim()) return el;
      } catch (err) {
        log('SELECTOR_ERROR', { selector: sel, error: err.message });
      }
    }
    return null;
  };

  const cleanText = (el) => {
    if (!el) return null;
    return el.textContent.replace(/\s+/g, ' ').trim();
  };

  const titleEl = trySelectors(['.top-card-layout__title', 'h1.topcard__title']);
  const companyEl = trySelectors(['.topcard__org-name-link', '.topcard__flavor a']);
  const locationEl = trySelectors(['.topcard__flavor--bullet']);
  const descriptionEl = trySelectors(['.show-more-less-html__markup', '.description__text']);
  const postedAtEl = trySelectors(['.posted-time-ago__text']);
  const applicantsEl = trySelectors(['.num-applicants__caption']);

  // For description, preserve paragraph breaks: convert <br> to newlines, then
  // prefer innerText (preserves layout-like breaks) and fall back to textContent.
  let descriptionText = null;
  if (descriptionEl) {
    const clone = descriptionEl.cloneNode(true);
    clone.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    const raw = (clone.innerText || clone.textContent || '').trim();
    descriptionText = raw.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/[ \t]+\n/g, '\n');
  }

  const parsed = {
    jobTitle: cleanText(titleEl),
    companyName: cleanText(companyEl),
    companyUrl: companyEl ? companyEl.getAttribute('href') : null,
    location: cleanText(locationEl) || 'Not specified',
    description: descriptionText || 'No description available',
    postedAt: postedAtEl ? postedAtEl.textContent.trim() : null,
    applicantsCount: applicantsEl ? applicantsEl.textContent.trim() : null,
    jobUrl: `https://www.linkedin.com/jobs/view/${jobId}/`,
    jobId,
    extractedAt: new Date().toISOString()
  };

  log('GUEST_PARSE_RESULT', {
    jobId,
    hasTitle: !!parsed.jobTitle,
    hasCompany: !!parsed.companyName,
    descriptionLength: parsed.description ? parsed.description.length : 0
  });

  if (!parsed.jobTitle || !parsed.companyName) {
    throw new Error('Required fields (title/company) missing from guest response');
  }

  return parsed;
}

// Initialize extension
chrome.runtime.onInstalled.addListener((details) => {
  log('INSTALLED', { reason: details.reason, version: chrome.runtime.getManifest().version });
});

// Handle extension icon click - open side panel
chrome.action.onClicked.addListener(async (tab) => {
  log('ICON_CLICKED', { tabId: tab.id, url: tab.url });

  try {
    // Open the side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });
    log('SIDE_PANEL_OPENED', { windowId: tab.windowId });
  } catch (error) {
    log('SIDE_PANEL_ERROR', { error: error.message });
  }
});

// Message passing relay between content script and side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('MESSAGE_RECEIVED', {
    type: message.type,
    from: sender.tab ? 'content_script' : 'extension',
    tabId: sender.tab?.id
  });

  // Relay messages from content script to side panel
  if (message.type === 'JOB_DETECTED' && sender.tab) {
    // Broadcast to all extension pages (side panel will receive this)
    chrome.runtime.sendMessage(message).catch((error) => {
      // Side panel might not be open, that's okay
      log('MESSAGE_RELAY_IGNORED', { reason: 'No receiver' });
    });
  }

  // Handle guest-API job fetch requests from the content script.
  if (message.type === 'GET_JOB_DATA' && message.jobId) {
    fetchJobFromGuestApi(message.jobId)
      .then((data) => {
        log('GUEST_FETCH_OK', { jobId: message.jobId });
        sendResponse({ success: true, data });
      })
      .catch((error) => {
        log('GUEST_FETCH_FAILED', { jobId: message.jobId, error: error.message });
        sendResponse({ success: false, error: error.message });
      });
    return true; // async response
  }

  // Handle requests from side panel to content script
  if (message.type === 'REQUEST_JOB_DATA' && message.tabId) {
    chrome.tabs.sendMessage(message.tabId, { type: 'EXTRACT_JOB_DATA' })
      .then((response) => {
        log('JOB_DATA_FORWARDED', { tabId: message.tabId });
        sendResponse(response);
      })
      .catch((error) => {
        log('CONTENT_SCRIPT_ERROR', { error: error.message });
        sendResponse({ error: error.message });
      });
    return true; // Keep channel open for async response
  }

  return false;
});

// Monitor tab updates to detect LinkedIn navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
    log('LINKEDIN_TAB_UPDATED', { tabId, url: tab.url });
  }
});

log('BACKGROUND_SERVICE_WORKER_READY');
