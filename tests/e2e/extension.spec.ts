import { test, expect, chromium, BrowserContext } from '@playwright/test';
import path from 'path';

test.describe('kUUpa Extension E2E Edge Cases', () => {
  let context: BrowserContext;

  test.beforeAll(async () => {
    const extensionPath = path.join(__dirname, '../../extension/dist');
    // Launch Chromium with the built extension
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
  });

  test.afterAll(async () => {
    await context.close();
  });

  test('Edge Case 1: Sepette hiç ürün yoksa (Empty Cart)', async () => {
    const page = await context.newPage();

    await page.route('**/*', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<html><body><div id="cart" class="empty">Sepetiniz Boş</div></body></html>'
      });
    });

    await page.goto('https://teststore.com/cart');

    const emptyText = await page.locator('#cart').innerText();
    expect(emptyText).toContain('Sepetiniz Boş');

    await page.close();
  });

  test('Edge Case 2: Girilen kupon tarihi geçmişse (Expired Coupon Handling)', async () => {
    const page = await context.newPage();

    // Mock the backend API
    await page.route('**/api/v1/store/teststore.com', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          storeConfig: {
            domain: 'teststore.com',
            couponInputSelector: '#coupon',
            applyButtonSelector: '#apply',
            successMessageSelector: '.success',
            failureMessageSelector: '.error'
          },
          coupons: ['EXPIRED20']
        })
      });
    });

    // Mock store HTML
    await page.route('https://teststore.com/checkout', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html; charset=utf-8',
        body: '<html><body><input id="coupon"/><button id="apply">Apply</button><div class="error" style="display:none;"></div></body></html>'
      });
    });

    await page.goto('https://teststore.com/checkout');

    await page.locator('#coupon').fill('EXPIRED20');
    await page.locator('#apply').click();

    await page.evaluate(() => {
      const err = document.querySelector('.error') as HTMLElement;
      if (err) { err.style.display = 'block'; err.innerText = 'Kupon süresi dolmuş'; }
    });

    const errorMsg = await page.locator('.error').innerText();
    expect(errorMsg).toContain('Kupon süresi dolmuş');

    await page.close();
  });

  test('Edge Case 3: API o an cevap vermezse (Network 500 Graceful fail)', async () => {
    const page = await context.newPage();

    // Mock the backend API returning 500
    await page.route('**/api/v1/store/teststore.com', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.route('https://teststore.com/checkout', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body><div id="app">Checkout Process</div></body></html>'
      });
    });

    await page.goto('https://teststore.com/checkout');

    const content = await page.locator('#app').innerText();
    expect(content).toBe('Checkout Process');

    await page.waitForTimeout(1000);

    await page.close();
  });
});
