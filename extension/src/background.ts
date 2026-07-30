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
     sendResponse(cache.get(domain)?.storeConfig || null);
     return true;
  }
});

// Watch navigation to proactively fetch data
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) { // Main frame only
    try {
      const url = new URL(details.url);
      let hostname = url.hostname;
      if (hostname.startsWith('www.')) hostname = hostname.slice(4);
      
      // Proactively fetch and cache
      if (!cache.has(hostname)) {
        fetch(`${API_BASE_URL}/store/${hostname}`, {
          headers: {
            'X-Extension-ID': chrome.runtime.id
          }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              cache.set(hostname, data);
              // We could also notify the content script that coupons are available to show a badge
              chrome.action.setBadgeText({ tabId: details.tabId, text: data.coupons.length.toString() });
              chrome.action.setBadgeBackgroundColor({ tabId: details.tabId, color: '#B87333' });
            }
          })
          .catch(() => {});
      } else {
        const data = cache.get(hostname);
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
