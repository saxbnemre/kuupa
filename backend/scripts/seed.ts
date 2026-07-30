import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StoreConfig } from '../src/models/StoreConfig';
import { Coupon } from '../src/models/Coupon';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || '';

async function seed() {
  if (!MONGO_URI) {
    console.error('No MONGO_URI found in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB for seeding...');

    // Seed Store Config for example.com
    await StoreConfig.findOneAndUpdate(
      { domain: 'example.com' },
      {
        domain: 'example.com',
        couponInputSelector: 'input[name="coupon"]', // Fake selector
        applyButtonSelector: 'button[type="submit"]', // Fake selector
      },
      { upsert: true, new: true }
    );

    // Seed Coupons for example.com
    const coupons = ['KUUPATEST50', 'INDIRIM20', 'BEDAVAKARGO'];
    for (const code of coupons) {
      await Coupon.findOneAndUpdate(
        { code, domain: 'example.com' },
        {
          code,
          domain: 'example.com',
          discountType: 'PERCENTAGE',
          isExpired: false,
          successRate: 100
        },
        { upsert: true }
      );
    }

    console.log('Test data seeded successfully for example.com!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
