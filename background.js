// Proyo Job Saver - Background Service Worker

const log = (action, data = {}) => {
  console.log(`[Proyo Background] ${new Date().toISOString()} | ${action}`, data);
};

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
