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
  const inputEl = document.querySelector<HTMLInputElement>(config.couponInputSelector);
  const btnEl = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);

  if (!inputEl || !btnEl) {
    console.warn('kUUpa: Input or Button not found in DOM.');
    return false;
  }

  // 1. Focus input
  inputEl.focus();
  
  // 2. Safely set value (XSS safe since it's just setting the value property)
  inputEl.value = code;
  
  // 3. Dispatch events to trigger React/Vue/Angular states
  triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
  
  await sleep(500); // Wait for UI update
  
  // 4. Click the button
  btnEl.click();
  triggerNativeEvents(btnEl, ['mousedown', 'mouseup', 'click']);
  
  // 5. Wait for network/validation
  await sleep(2500); 

  // 6. Check for success if selector is provided
  if (config.successMessageSelector) {
    const successEl = document.querySelector(config.successMessageSelector);
    if (successEl && successEl.textContent && successEl.textContent.trim().length > 0) {
      return true; // Assumed success
    }
  }
  
  // If no success selector, we assume failure to be safe and try the next one, 
  // or we can read the total price diff, but for this MVP, we rely on selectors.
  return false;
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
