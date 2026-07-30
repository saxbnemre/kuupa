export {};
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

const getRootDomain = (hostname: string) => {
  const parts = hostname.split('.');
  if (parts.length > 2) {
    // Basic handler for subdomains (e.g. checkout.trendyol.com -> trendyol.com)
    // Note: this simplistic approach works for .com but might fail for .com.tr
    // So we handle .com.tr, .edu.tr specifically
    if (hostname.endsWith('.tr') && parts.length > 3) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }
  return hostname.replace('www.', '');
};

const getCartTotal = (selector: string | undefined): number => {
  if (!selector) return 0;
  // Try to find the element
  const elements = document.querySelectorAll(selector);
  for (const el of Array.from(elements)) {
     const price = parsePrice(el.textContent);
     if (price > 0) return price;
  }
  return 0;
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

  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    btn.textContent = '⏳ Sistem Başlatılıyor...';
    btn.style.pointerEvents = 'none';
    
    let bestCoupon = null;
    let initialPrice = getCartTotal(config.cartTotalSelector);
    
    if (initialPrice === 0) {
       console.warn('kUUpa: Sepet tutarı okunamadı. Sadece başarılı mesajlara güvenilecek.');
    }
    
    let currentBestPrice = initialPrice > 0 ? initialPrice : 9999999;
    let hasRealDiscount = false;

    try {
      for (const code of coupons) {
        btn.textContent = `⏳ Deneniyor: ${code}...`;
        console.log(`kUUpa: Testing ${code}...`);
        
        inputEl.focus();
        inputEl.value = code;
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        await sleep(500);

        const applyBtn = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);
        if (applyBtn) {
          applyBtn.click();
          triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
        } else {
          console.warn('kUUpa: Apply button not found using selector:', config.applyButtonSelector);
        }

        await sleep(2500); // Wait for network response and UI update

        const newPrice = getCartTotal(config.cartTotalSelector);
        
        // Did we find a lower price compared to initial?
        if (initialPrice > 0 && newPrice > 0 && newPrice < initialPrice && newPrice < currentBestPrice) {
          const discount = currentBestPrice - newPrice;
          bestCoupon = code;
          currentBestPrice = newPrice;
          hasRealDiscount = true;
          console.log(`kUUpa: New best coupon! ${code} saves ${discount}`);
        } else if (newPrice === currentBestPrice || newPrice === 0 || newPrice >= initialPrice) {
          // Fallback: check success message if price parsing failed
          if (config.successMessageSelector) {
             const successEl = document.querySelector(config.successMessageSelector);
             if (successEl && successEl.textContent?.trim().length) {
                bestCoupon = code;
                hasRealDiscount = true;
                break; // Stop at first success if price parsing fails
             }
          }
          
          // Report failure back to background
          chrome.runtime.sendMessage({ type: 'REPORT_FAILURE', domain: config.domain, code });
        }

        // Remove coupon if selector exists
        if (config.removeCouponSelector) {
          const removeBtn = document.querySelector<HTMLButtonElement>(config.removeCouponSelector);
          if (removeBtn) {
            removeBtn.click();
            await sleep(1500);
          }
        }
      }

      if (bestCoupon && hasRealDiscount) {
        btn.textContent = `🔥 En İyi Kod: ${bestCoupon} Uygulanıyor!`;
        inputEl.value = bestCoupon;
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        await sleep(500);
        const applyBtn = document.querySelector<HTMLButtonElement>(config.applyButtonSelector);
        if (applyBtn) {
          applyBtn.click();
          triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
        }
        setTimeout(() => btn.remove(), 4000);
      } else {
        btn.textContent = '😔 Tüm kodlar geçersiz.';
        btn.style.background = '#666';
        
        // Clear the input field since no coupon worked
        inputEl.value = '';
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        
        setTimeout(() => btn.remove(), 4000);
      }
    } catch (err: any) {
      console.error('kUUpa error:', err);
      btn.textContent = '❌ Hata: ' + (err.message || 'Bilinmeyen Hata');
      btn.style.background = '#d32f2f';
      setTimeout(() => btn.remove(), 5000);
    }
  });

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
    const hostname = getRootDomain(window.location.hostname);

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
