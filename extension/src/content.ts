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

const waitForElement = (selector: string, timeout = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = document.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

const waitForCondition = (conditionFunc: () => boolean, timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (conditionFunc()) return resolve(true);

    const observer = new MutationObserver(() => {
      if (conditionFunc()) {
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true });

    setTimeout(() => {
      observer.disconnect();
      resolve(false);
    }, timeout);
  });
};

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
    if (hostname.endsWith('.tr') && parts.length > 3) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  }
  return hostname.replace('www.', '');
};

const getCartTotal = (selector: string | undefined): number => {
  if (!selector) return 0;
  const elements = document.querySelectorAll(selector);
  for (const el of Array.from(elements)) {
     const price = parsePrice(el.textContent);
     if (price > 0) return price;
  }
  return 0;
};

const injectFloatingButton = (inputEl: HTMLInputElement, coupons: string[], config: StoreConfig) => {
  const existing = document.getElementById('kuupa-floating-btn');
  if (existing) return;

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

  const positionBtn = () => {
    const rect = inputEl.getBoundingClientRect();
    btn.style.top = `${rect.top + window.scrollY - 45}px`;
    btn.style.left = `${rect.left + window.scrollX}px`;
  };
  
  positionBtn();
  window.addEventListener('resize', positionBtn);
  window.addEventListener('scroll', positionBtn);

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

        const applyBtn = await waitForElement(config.applyButtonSelector, 1500) as HTMLButtonElement | null;
        if (applyBtn) {
          applyBtn.click();
          triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
        } else {
          console.warn('kUUpa: Apply button not found:', config.applyButtonSelector);
        }

        await waitForCondition(() => {
           const newPrice = getCartTotal(config.cartTotalSelector);
           if (initialPrice > 0 && newPrice !== initialPrice && newPrice > 0) return true;
           if (config.successMessageSelector && document.querySelector(config.successMessageSelector)) return true;
           if (config.failureMessageSelector && document.querySelector(config.failureMessageSelector)) return true;
           return false;
        }, 3500);

        const newPrice = getCartTotal(config.cartTotalSelector);
        
        if (initialPrice > 0 && newPrice > 0 && newPrice < initialPrice && newPrice < currentBestPrice) {
          const discount = currentBestPrice - newPrice;
          bestCoupon = code;
          currentBestPrice = newPrice;
          hasRealDiscount = true;
          console.log(`kUUpa: New best coupon! ${code} saves ${discount}`);
        } else if (newPrice === currentBestPrice || newPrice === 0 || newPrice >= initialPrice) {
          if (config.successMessageSelector) {
             const successEl = document.querySelector(config.successMessageSelector);
             if (successEl && successEl.textContent?.trim().length) {
                bestCoupon = code;
                hasRealDiscount = true;
                break;
             }
          }
          chrome.runtime.sendMessage({ type: 'REPORT_FAILURE', domain: config.domain, code });
        }

        if (config.removeCouponSelector) {
          const removeBtn = await waitForElement(config.removeCouponSelector, 1000) as HTMLButtonElement | null;
          if (removeBtn) {
            removeBtn.click();
            await waitForCondition(() => {
               const p = getCartTotal(config.cartTotalSelector);
               return p === initialPrice;
            }, 2000);
          }
        }
      }

      if (bestCoupon && hasRealDiscount) {
        btn.textContent = `🔥 En İyi Kod: ${bestCoupon} Uygulanıyor!`;
        inputEl.value = bestCoupon;
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        
        const applyBtn = await waitForElement(config.applyButtonSelector, 1500) as HTMLButtonElement | null;
        if (applyBtn) {
          applyBtn.click();
          triggerNativeEvents(applyBtn, ['mousedown', 'mouseup', 'click']);
        }
        
        setTimeout(() => {
          btn.remove();
          window.removeEventListener('resize', positionBtn);
          window.removeEventListener('scroll', positionBtn);
        }, 4000);
      } else {
        btn.textContent = '😔 Tüm kodlar geçersiz.';
        btn.style.background = '#666';
        
        inputEl.value = '';
        triggerNativeEvents(inputEl, ['input', 'change', 'blur']);
        
        setTimeout(() => {
          btn.remove();
          window.removeEventListener('resize', positionBtn);
          window.removeEventListener('scroll', positionBtn);
        }, 4000);
      }
    } catch (err: any) {
      console.error('kUUpa error:', err);
      btn.textContent = '❌ Hata: ' + (err.message || 'Bilinmeyen Hata');
      btn.style.background = '#d32f2f';
      setTimeout(() => {
        btn.remove();
        window.removeEventListener('resize', positionBtn);
        window.removeEventListener('scroll', positionBtn);
      }, 5000);
    }
  });

  document.body.appendChild(btn);
  
  const removeIfNotFocused = (e: MouseEvent) => {
    if (e.target !== inputEl && e.target !== btn) {
      btn.remove();
      window.removeEventListener('resize', positionBtn);
      window.removeEventListener('scroll', positionBtn);
      document.removeEventListener('click', removeIfNotFocused);
    }
  };
  setTimeout(() => document.addEventListener('click', removeIfNotFocused), 100);
};

// Handle messages from Popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'START_COUPON_TEST') {
    const coupons = message.coupons.map((c: any) => typeof c === 'string' ? c : c.code);
    const hostname = getRootDomain(window.location.hostname);
    
    chrome.runtime.sendMessage({ type: 'GET_CONFIG', domain: hostname }, (data: any) => {
      if (data && data.storeConfig && coupons && coupons.length > 0) {
        const config = data.storeConfig as StoreConfig;
        const selectors = config.couponInputSelector.split(',').map((s: string) => s.trim());
        
        let inputEl: HTMLInputElement | null = null;
        for (const selector of selectors) {
           inputEl = document.querySelector<HTMLInputElement>(selector);
           if (inputEl) break;
        }

        if (inputEl) {
          injectFloatingButton(inputEl, coupons, config);
          const btn = document.getElementById('kuupa-floating-btn');
          if (btn) {
            btn.click();
          }
          sendResponse({ status: 'started' });
        } else {
           console.warn('kUUpa: Coupon input not found in DOM yet.');
           sendResponse({ status: 'error', message: 'Kupon alanı bulunamadı.' });
        }
      } else {
        sendResponse({ status: 'error', message: 'Konfigürasyon bulunamadı.' });
      }
    });
    return true; 
  }
});

// Initialize and watch DOM for SPA
const init = () => {
  const hostname = getRootDomain(window.location.hostname);
  chrome.runtime.sendMessage({ type: 'GET_CONFIG', domain: hostname }, (data: any) => {
    if (data && data.storeConfig && data.coupons && data.coupons.length > 0) {
      const config = data.storeConfig as StoreConfig;
      const selectors = config.couponInputSelector.split(',').map((s: string) => s.trim());
      
      const checkAndInject = () => {
         if (document.getElementById('kuupa-floating-btn')) return;
         for (const selector of selectors) {
           const el = document.querySelector<HTMLInputElement>(selector);
           if (el) {
             injectFloatingButton(el, data.coupons, config);
             break;
           }
         }
      };

      checkAndInject();

      const observer = new MutationObserver(() => {
         checkAndInject();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      
      document.addEventListener('focusin', (e) => {
        const el = e.target as HTMLInputElement;
        if (el && el.tagName === 'INPUT') {
          for (const selector of selectors) {
            try {
              if (el.matches(selector)) {
                injectFloatingButton(el, data.coupons, config);
                break;
              }
            } catch(e) {}
          }
        }
      });
    }
  });
};

init();
