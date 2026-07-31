import mongoose from 'mongoose';
import { Coupon } from '../src/models/Coupon';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kuupa';
// Simulated Third-Party Coupon API Data
const mockCouponAPIResponse = [
  { code: 'HOY10', domain: 'hepsiburada.com', discountType: 'PERCENTAGE', discountValue: 10 },
  { code: 'WELCOME50', domain: 'hepsiburada.com', discountType: 'FIXED', discountValue: 50 },
  { code: 'AMAZON10', domain: 'amazon.com.tr', discountType: 'PERCENTAGE', discountValue: 10 },
  { code: 'PRIMEFRIDAY', domain: 'amazon.com.tr', discountType: 'FREE_SHIPPING' },
  { code: 'YEMEK20', domain: 'yemeksepeti.com', discountType: 'PERCENTAGE', discountValue: 20 },
  { code: 'TRENDYOLGEL', domain: 'trendyol.com', discountType: 'FIXED', discountValue: 30 },
  { code: 'INDIRIM25', domain: 'trendyol.com', discountType: 'PERCENTAGE', discountValue: 25 },
] as any[];

async function runBulkImport() {
  try {
    console.log('Connecting to MongoDB for Bulk Import...');
    await mongoose.connect(MONGO_URI);
    
    console.log(`Fetching coupons from 3rd Party API...`);
    // In production, this would be an actual fetch request:
    // const response = await fetch('https://api.couponapi.org/v1/coupons?api_key=...');
    // const data = await response.json();
    const data = mockCouponAPIResponse;
    
    console.log(`Received ${data.length} coupons. Preparing for bulk insert...`);
    
    // Process and format data
    const bulkOperations = data.map(coupon => ({
      updateOne: {
        filter: { code: coupon.code, domain: coupon.domain },
        update: { 
          $set: {
            code: coupon.code,
            domain: coupon.domain,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            isExpired: false,
            discoveredBy: 'Bulk-Importer-API'
          },
          // Only set successRate if the document is newly inserted
          $setOnInsert: {
            successRate: 100,
            failureCount: 0
          }
        },
        upsert: true
      }
    }));

    // Execute bulk write
    const result = await Coupon.bulkWrite(bulkOperations);
    
    console.log('Bulk Import Complete!');
    console.log(`Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error during bulk import:', err);
    process.exit(1);
  }
}

runBulkImport();
