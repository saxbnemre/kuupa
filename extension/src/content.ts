interface StoreConfig {
  domain: string;
  couponInputSelector: string;
  applyButtonSelector: string;
  cartTotalSelector?: string;
  removeCouponSelector?: string;
  successMessageSelector?: string;
  failureMessageSelector?: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const triggerNativeEvents = (el: HTMLElement, events: string[]) => {
  for (const ev of events) {
    const event = new Event(ev, { bubbles: true, cancelable: true });
    el.dispatchEvent(event);
  }
};

const parsePrice = (text: string | null | undefined): number => {
  if (!text) return 0;
  let clean = text.replace(/[^\d.,-]/g, '');
  if (clean.includes('.') && clean.includes(',')) {
    const dotIndex = clean.lastIndexOf('.');
    const commaIndex = clean.lastIndexOf(',');
    if (dotIndex > commaIndex) {
      clean = clean.replace(/,/g, '');
    } else {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
  } else if (clean.includes(',')) {
    clean = clean.replace(',', '.');
  }
  const val = parseFloat(clean);
  return isNaN(val) ? 0 : val;
};

const getCartTotal = (selector: string | undefined): number => {
  if (!selector) return 0;
  const el = document.querySelector(selector);
  return parsePrice(el?.textContent);
};

const injectFloatingButton = (inputEl: HTMLInputElement, coupons: string[], config: StoreConfig) => {
  // Remove existing
  const existing = document.getElementById('kuupa-floating-btn');
  if (existing) existing.remove();

  const btn = document.createElement('div');
  btn.id = 'kuupa-floating-btn';
  btn.style.position = 'absolute';
  btn.style.zIndex = '999999';
  btn.style.background = '#B87333';
  btn.style.color = '#fff';
  btn.style.padding = '8px 12px';
  btn.style.borderRadius = '8px';
  btn.style.cursor = 'pointer';
  btn.style.fontWeight = 'bold';
  btn.style.fontSize = '14px';
  btn.style.boxShadow = '0 4px 12px rgba(184, 115, 51, 0.4)';
  btn.style.transition = 'all 0.2s ease';
  btn.textContent = `🎁 ${coupons.length} Kupon Dene`;

  // Position it right above the input
  const rect = inputEl.getBoundingClientRect();
  btn.style.top = `${rect.top + window.scrollY - 45}px`;
  btn.style.left = `${rect.left + window.scrollX}px`;

  btn.onmouseover = () => { btn.style.transform = 'scale(1.05)'; };
  btn.onmouseout = () => { btn.style.transform = 'scale(1)'; };

  btn.onclick = async () => {
    btn.textContent = '⏳ Hesaplanıyor...';
    btn.style.pointerEvents = 'none';
    
    let bestCoupon = null;
    let maxDiscount = 0;
    const initialPrice = getCartTotal(config.cartTotalSelector);
    let currentBestPrice = initialPrice;

    for (const code of coupons) {
      console.log(`kUUpa: Testing ${code}...`);
      
      try {
        inputEl.focus();
        inputEl.value = code;
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        await sleep(500);

        const applyBtn = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);
        if (applyBtn) {
          applyBtn.click();
          triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
        }

        await sleep(2500); // Wait for network response and UI update

        const newPrice = getCartTotal(config.cartTotalSelector);
        if (newPrice > 0 && newPrice < currentBestPrice) {
          const discount = currentBestPrice - newPrice;
          if (discount > maxDiscount) {
            maxDiscount = discount;
            bestCoupon = code;
            currentBestPrice = newPrice;
            console.log(`kUUpa: New best coupon! ${code} saves ${discount}`);
          }
        } else if (newPrice === currentBestPrice || newPrice === 0) {
          // Report failure back to background
          chrome.runtime.sendMessage({ type: 'REPORT_FAILURE', domain: config.domain, code });
        }

        // Remove coupon if selector exists (so we can test next one cleanly)
        if (config.removeCouponSelector) {
          const removeBtn = document.querySelector<HTMLButtonElement>(config.removeCouponSelector);
          if (removeBtn) {
            removeBtn.click();
            await sleep(1500);
          }
        }
      } catch (err) {
        console.error('kUUpa error applying coupon', err);
      }
    }

    if (bestCoupon) {
      btn.textContent = `🔥 En İyi Kod: ${bestCoupon} Uygulanıyor!`;
      inputEl.value = bestCoupon;
      triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
      await sleep(500);
      const applyBtn = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);
      if (applyBtn) {
        applyBtn.click();
        triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
      }
      setTimeout(() => btn.remove(), 3000);
    } else {
      btn.textContent = '😔 Geçerli kod bulunamadı';
      btn.style.background = '#666';
      setTimeout(() => btn.remove(), 3000);
    }
  };

  document.body.appendChild(btn);
  
  // Remove if clicked outside
  const removeIfNotFocused = (e: MouseEvent) => {
    if (e.target !== inputEl && e.target !== btn) {
      btn.remove();
      document.removeEventListener('click', removeIfNotFocused);
    }
  };
  setTimeout(() => document.addEventListener('click', removeIfNotFocused), 100);
};

// Listen for inputs focusing
document.addEventListener('focusin', (e) => {
  const el = e.target as HTMLInputElement;
  if (el && el.tagName === 'INPUT') {
    let hostname = window.location.hostname;
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);

    chrome.runtime.sendMessage({ type: 'GET_CONFIG', domain: hostname }, (data: any) => {
      if (data && data.storeConfig && data.coupons && data.coupons.length > 0) {
        const config = data.storeConfig as StoreConfig;
        
        // Simple DOM matching string logic
        const selectors = config.couponInputSelector.split(',').map((s: string) => s.trim());
        let isMatch = false;
        for (const selector of selectors) {
           try {
             if (el.matches(selector)) {
               isMatch = true;
               break;
             }
           } catch(e) {}
        }
        
        if (isMatch) {
          injectFloatingButton(el, data.coupons, config);
        }
      }
    });
  }
});
