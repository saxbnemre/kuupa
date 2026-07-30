// Security: NO eval(), NO innerHTML, NO outerHTML allowed.

interface StoreConfig {
  domain: string;
  couponInputSelector: string;
  applyButtonSelector: string;
  successMessageSelector?: string;
  failureMessageSelector?: string;
}

let activeConfig: StoreConfig | null = null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const triggerNativeEvents = (element: HTMLInputElement | HTMLButtonElement, eventTypes: string[]) => {
  for (const type of eventTypes) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  }
};

const applyCoupon = async (code: string, config: StoreConfig): Promise<boolean> => {
  try {
    const inputEl = document.querySelector<HTMLInputElement>(config.couponInputSelector);
    const btnEl = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);

    if (!inputEl || !btnEl) {
      console.warn('kUUpa: Input or Button not found in DOM.');
      return false;
    }

    inputEl.focus();
    inputEl.value = code;
    triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
    
    await sleep(500); 
    
    btnEl.click();
    triggerNativeEvents(btnEl, ['mousedown', 'mouseup', 'click']);
    
    await sleep(2500); 

    if (config.successMessageSelector) {
      const successEl = document.querySelector(config.successMessageSelector);
      if (successEl && successEl.textContent && successEl.textContent.trim().length > 0) {
        return true; 
      }
    }
    
    return false;
  } catch (err) {
    console.error('kUUpa: DOM manipulation error', err);
    return false;
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_COUPON_TEST') {
    const coupons: string[] = message.coupons || [];
    
    // Get hostname
    let hostname = window.location.hostname;
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);

    // Fetch config for this domain from background
    chrome.runtime.sendMessage({ type: 'GET_CONFIG', domain: hostname }, async (config: StoreConfig | null) => {
      if (!config) {
        sendResponse({ status: 'error', message: 'No config for this store' });
        return;
      }
      
      activeConfig = config;
      
      // We will loop asynchronously
      for (const code of coupons) {
         console.log(`kUUpa: Trying coupon ${code}`);
         const success = await applyCoupon(code, config);
         if (success) {
           console.log(`kUUpa: Coupon ${code} applied successfully!`);
           break; // Stop trying if one worked
         }
         await sleep(1500); // Cool down between attempts
      }
      
      sendResponse({ status: 'done' });
    });
    
    return true; // Keep message channel open for async work
  }
});

// Handle SPA page transitions if needed by MutationObserver
// The observer could look for checkout pages and proactively show UI injects.
// But we keep DOM manipulation minimal for security.
