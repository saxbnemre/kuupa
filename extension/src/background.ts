export {};
const API_BASE_URL = 'http://localhost:5000/api/v1'; // Replace with prod URL

interface StoreData {
  storeConfig: {
    domain: string;
    couponInputSelector: string;
    applyButtonSelector: string;
    successMessageSelector?: string;
    failureMessageSelector?: string;
  };
  coupons: string[];
}

// In-memory cache for the current session
const cache = new Map<string, StoreData>();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CHECK_COUPONS') {
    const domain = message.domain;
    
    if (cache.has(domain)) {
      sendResponse(cache.get(domain));
      return true;
    }

    // Fetch from backend
    fetch(`${API_BASE_URL}/store/${domain}`, {
      headers: {
        'X-Extension-ID': chrome.runtime.id
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: StoreData) => {
        cache.set(domain, data);
        sendResponse(data);
      })
      .catch(err => {
        console.error('Error fetching config for', domain, err);
        sendResponse({ coupons: [] });
      });

    return true; // Indicates async response
  }
  
  if (message.type === 'GET_CONFIG') {
    const domain = message.domain;
    // We send BOTH the config and coupons back to content.js
    sendResponse(cache.get(domain) || null);
    return true;
  }
  
  if (message.type === 'REPORT_FAILURE') {
    const { domain, code } = message;
    fetch(`${API_BASE_URL}/store/${domain}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-ID': chrome.runtime.id
      },
      body: JSON.stringify({ code })
    }).catch(() => {});
    return true;
  }
});

// Watch navigation to proactively fetch data
const getRootDomain = (hostname: string) => {
  const parts = hostname.split('.');
  if (parts.length > 2) {
    if (hostname.endsWith('.tr') && parts.length > 3) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }
  return hostname.replace('www.', '');
};

chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    try {
      const url = new URL(details.url);
      const domain = getRootDomain(url.hostname);
      
      // Proactively fetch and cache
      if (!cache.has(domain)) {
        fetch(`${API_BASE_URL}/store/${domain}`, {
          headers: {
            'X-Extension-ID': chrome.runtime.id
          }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              cache.set(domain, data);
              // We could also notify the content script that coupons are available to show a badge
              chrome.action.setBadgeText({ tabId: details.tabId, text: data.coupons.length.toString() });
              chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#B87333' });
            }
          })
          .catch(() => {});
      } else {
        const data = cache.get(domain);
        if (data && data.coupons.length > 0) {
            chrome.action.setBadgeText({ tabId: details.tabId, text: data.coupons.length.toString() });
            chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#B87333' });
        }
      }
    } catch (e) {
      // invalid URL
    }
  }
});
