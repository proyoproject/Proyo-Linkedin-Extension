// Proyo Job Saver - Robust job scraping orchestrator (content-script side)
//
// Resolves a LinkedIn job ID from URL/DOM, asks the background service worker
// to fetch the canonical job posting from the public guest endpoint, and falls
// back to live-page DOM scraping when the guest fetch fails.

(function () {
  const log = (action, data = {}) => {
    console.log(`[Proyo Scraper] ${new Date().toISOString()} | ${action}`, data);
  };

  // Resolve a numeric LinkedIn job ID from the current page.
  // Tries query param → URL path → DOM attributes. Returns null if nothing matches.
  function resolveJobId() {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromParam = params.get('currentJobId');
      if (fromParam && /^\d+$/.test(fromParam)) {
        log('JOB_ID_RESOLVED', { method: 'currentJobId_param', jobId: fromParam });
        return fromParam;
      }

      const pathMatch = window.location.pathname.match(/\/jobs\/view\/(\d+)\/?/);
      if (pathMatch && pathMatch[1]) {
        log('JOB_ID_RESOLVED', { method: 'jobs_view_path', jobId: pathMatch[1] });
        return pathMatch[1];
      }

      const domEl = document.querySelector(
        '[data-job-id], [data-occludable-job-id], [data-entity-urn*="fsd_jobPosting"]'
      );
      if (domEl) {
        const direct = domEl.getAttribute('data-job-id') || domEl.getAttribute('data-occludable-job-id');
        if (direct && /^\d+$/.test(direct)) {
          log('JOB_ID_RESOLVED', { method: 'data_job_id', jobId: direct });
          return direct;
        }
        const urn = domEl.getAttribute('data-entity-urn') || '';
        const urnMatch = urn.match(/urn:li:fsd_jobPosting:(\d+)/);
        if (urnMatch && urnMatch[1]) {
          log('JOB_ID_RESOLVED', { method: 'entity_urn', jobId: urnMatch[1] });
          return urnMatch[1];
        }
      }
    } catch (err) {
      log('JOB_ID_RESOLVE_ERROR', { error: err.message });
    }

    log('JOB_ID_UNRESOLVED');
    return null;
  }

  // Ask the background service worker to fetch and parse the guest endpoint.
  // Returns the structured job object or throws.
  function fetchJobFromGuestApi(jobId) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'GET_JOB_DATA', jobId }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.success && response.data) {
          resolve(response.data);
        } else {
          reject(new Error(response && response.error ? response.error : 'Guest API fetch failed'));
        }
      });
    });
  }

  // Fall back to the live-page DOM scraper exposed by content.js. Returns null
  // when content.js has not registered its scrapers yet (e.g. very early load).
  async function legacyScrape({ full = false } = {}) {
    if (full && typeof window.proyoLegacyExtractFull === 'function') {
      return await window.proyoLegacyExtractFull();
    }
    if (typeof window.proyoLegacyExtractBasic === 'function') {
      return window.proyoLegacyExtractBasic();
    }
    log('LEGACY_SCRAPE_UNAVAILABLE');
    return null;
  }

  // Orchestrator: resolve jobId → guest fetch → fallback to legacy scrape.
  // Always returns an object; on total failure returns { error: "..." }.
  async function getJobData({ full = false } = {}) {
    const jobId = resolveJobId();

    if (!jobId) {
      log('NO_JOB_ID_TRYING_LEGACY');
      const legacy = await legacyScrape({ full });
      if (legacy) {
        return Object.assign({}, legacy, {
          source: 'legacy',
          warning: 'Used fallback — some fields may be missing'
        });
      }
      return { error: "Couldn't detect job ID on this page." };
    }

    try {
      const guest = await fetchJobFromGuestApi(jobId);
      log('GUEST_FETCH_SUCCESS', { jobId });
      return Object.assign({}, guest, { source: 'guest' });
    } catch (err) {
      log('GUEST_FETCH_FAILED_TRYING_LEGACY', { jobId, error: err.message });
      const legacy = await legacyScrape({ full });
      if (legacy) {
        return Object.assign({}, legacy, {
          source: 'legacy',
          warning: 'Used fallback — some fields may be missing'
        });
      }
      return { error: `Could not fetch job data: ${err.message}` };
    }
  }

  window.ProyoScraper = { resolveJobId, fetchJobFromGuestApi, legacyScrape, getJobData };
  log('SCRAPER_MODULE_LOADED');
})();
