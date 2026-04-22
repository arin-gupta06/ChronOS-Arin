// Focus Tracker - Background Service Worker
// Tracks active tab URL and sends data to backend every 15 seconds

const API_BASE = 'http://localhost:8001';
const SEND_INTERVAL_SECONDS = 15;
const MIN_TRACK_SECONDS = 2; // Minimum time before tracking (ignore quick switches)

let currentTab = null;
let currentDomain = null;
let tabStartTime = null;
let pendingActivities = []; // Buffer for failed sends

// ===================== DOMAIN EXTRACTION =====================
function extractDomain(url) {
  if (!url) return null;

  // Skip browser internal pages
  if (url.startsWith('chrome://') || 
      url.startsWith('chrome-extension://') || 
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('edge://')) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname.toLowerCase();
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }
    return domain || null;
  } catch (e) {
    return null;
  }
}

// ===================== ACTIVITY SENDING =====================
async function sendActivity(domain, duration) {
  if (!domain || duration < MIN_TRACK_SECONDS) return;

  const payload = {
    user_id: 'default_user',
    url: 'https://' + domain,
    duration: Math.round(duration),
  };

  try {
    const response = await fetch(`${API_BASE}/activity/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Clear pending on success
    console.log(`[FocusTracker] Logged: ${domain} for ${Math.round(duration)}s`);

    // Send buffered activities if any
    if (pendingActivities.length > 0) {
      const toSend = [...pendingActivities];
      pendingActivities = [];
      for (const act of toSend) {
        await sendActivity(act.domain, act.duration);
      }
    }

  } catch (error) {
    console.warn(`[FocusTracker] Failed to send activity, buffering: ${error.message}`);
    // Buffer failed activities (max 50)
    pendingActivities.push({ domain, duration });
    if (pendingActivities.length > 50) {
      pendingActivities.shift(); // Remove oldest
    }
  }
}

// ===================== TAB TRACKING =====================
function flushCurrentTab() {
  if (currentDomain && tabStartTime) {
    const elapsed = (Date.now() - tabStartTime) / 1000;
    if (elapsed >= MIN_TRACK_SECONDS) {
      sendActivity(currentDomain, elapsed);
    }
  }
}

function startTracking(tab) {
  if (!tab || !tab.url) return;

  const domain = extractDomain(tab.url);
  if (!domain) {
    currentDomain = null;
    currentTab = null;
    tabStartTime = null;
    return;
  }

  currentTab = tab.id;
  currentDomain = domain;
  tabStartTime = Date.now();
}

// ===================== CHROME EVENTS =====================

// Tab becomes active
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  flushCurrentTab();

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    startTracking(tab);
  } catch (e) {
    console.warn('[FocusTracker] Could not get tab:', e.message);
  }
});

// Tab URL changes (navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tabId === currentTab) {
    flushCurrentTab();
    startTracking(tab);
  }
});

// Window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus - flush current
    flushCurrentTab();
    currentDomain = null;
    tabStartTime = null;
    return;
  }

  // Browser regained focus - get active tab
  try {
    const tabs = await chrome.tabs.query({ active: true, windowId });
    if (tabs[0]) {
      startTracking(tabs[0]);
    }
  } catch (e) {
    console.warn('[FocusTracker] Window focus error:', e.message);
  }
});

// Tab closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === currentTab) {
    flushCurrentTab();
    currentDomain = null;
    currentTab = null;
    tabStartTime = null;
  }
});

// ===================== PERIODIC FLUSH (every 15s) =====================
chrome.alarms.create('periodic-flush', {
  delayInMinutes: SEND_INTERVAL_SECONDS / 60,
  periodInMinutes: SEND_INTERVAL_SECONDS / 60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'periodic-flush') {
    if (currentDomain && tabStartTime) {
      const elapsed = (Date.now() - tabStartTime) / 1000;
      if (elapsed >= SEND_INTERVAL_SECONDS) {
        sendActivity(currentDomain, elapsed);
        tabStartTime = Date.now(); // Reset timer
      }
    }
  }
});

// ===================== INIT =====================
async function initialize() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      startTracking(tabs[0]);
    }
  } catch (e) {
    console.warn('[FocusTracker] Init error:', e.message);
  }
}

initialize();
console.log('[FocusTracker] Background service worker started');
