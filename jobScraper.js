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

  // Fetch the canonical job posting from LinkedIn's public guest endpoint and
  // parse the returned HTML fragment. Runs in the content-script world so
  // DOMParser is available (it isn't always exposed in MV3 service workers).
  // Throws on non-2xx or when required fields are absent.
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

  // Parse the guest endpoint HTML fragment into a structured job object.
  // Each field has primary + fallback selectors; optional fields default to null.
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

    const cleanText = (el) => el ? el.textContent.replace(/\s+/g, ' ').trim() : null;

    const titleEl = trySelectors(['.top-card-layout__title', 'h1.topcard__title']);
    const companyEl = trySelectors(['.topcard__org-name-link', '.topcard__flavor a']);
    const locationEl = trySelectors(['.topcard__flavor--bullet']);
    const descriptionEl = trySelectors(['.show-more-less-html__markup', '.description__text']);
    const postedAtEl = trySelectors(['.posted-time-ago__text']);
    const applicantsEl = trySelectors(['.num-applicants__caption']);

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
      descriptionLength: parsed.description.length
    });

    if (!parsed.jobTitle || !parsed.companyName) {
      throw new Error('Required fields (title/company) missing from guest response');
    }

    return parsed;
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
