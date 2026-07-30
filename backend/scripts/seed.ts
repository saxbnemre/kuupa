import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreConfig } from '../src/models/StoreConfig';
import { Coupon } from '../src/models/Coupon';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function seedTrendyol() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for Trendyol seeding...');

    // Seed Store Config for trendyol.com
    await StoreConfig.findOneAndUpdate(
      { domain: 'trendyol.com' },
      {
        domain: 'trendyol.com',
        couponInputSelector: 'input[placeholder*="İndirim"], input[name*="coupon"], input[id*="discount"]',
        applyButtonSelector: '.apply-discount-button, [data-testid="apply-discount"], button[type="button"]', 
        cartTotalSelector: '.pb-summary-total-price, .total-price, .summary-total',
      },
      { upsert: true, new: true }
    );

    // Seed Store Config for hepsiburada.com
    await StoreConfig.findOneAndUpdate(
      { domain: 'hepsiburada.com' },
      {
        domain: 'hepsiburada.com',
        couponInputSelector: 'input[name="couponCode"], input[placeholder*="Kupon"], .coupon-input',
        applyButtonSelector: 'button:has(span:contains("Kullan")), .apply-button, [data-test-id="apply-coupon-button"]', 
        cartTotalSelector: '.total-price, .summary_total_price, [data-test-id="cart-total-price"]',
      },
      { upsert: true, new: true }
    );

    // Seed Coupons for trendyol.com
    const coupons = ['TRENDYOL100', 'SUPERINDIRIM', 'KARGOFREE'];
    for (const code of coupons) {
      await Coupon.findOneAndUpdate(
        { code, domain: 'trendyol.com' },
        {
          code,
          domain: 'trendyol.com',
          discountType: 'FIXED',
          isExpired: false,
          discountValue: 20
        },
        { upsert: true }
      );
    }

    await Coupon.findOneAndUpdate(
      { code: 'HEPSI50', domain: 'hepsiburada.com' },
      {
        code: 'HEPSI50',
        domain: 'hepsiburada.com',
        discountType: 'FIXED',
        discountValue: 50
      },
      { upsert: true }
    );

    console.log('Test data seeded successfully for trendyol.com and hepsiburada.com!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedTrendyol();
