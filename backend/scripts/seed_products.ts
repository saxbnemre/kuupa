import mongoose from 'mongoose';
import { Product } from '../src/models/Product';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kuupa';

const mockProducts = [
  { name: 'Apple iPhone 15 Pro Max 256GB Titanyum', price: 74999, domain: 'hepsiburada.com', url: 'https://hepsiburada.com/iphone-15-pro-max', currency: 'TL' },
  { name: 'Apple iPhone 15 Pro Max 256GB Titanyum', price: 75999, domain: 'trendyol.com', url: 'https://trendyol.com/iphone-15-pro-max', currency: 'TL' },
  { name: 'Apple iPhone 15 Pro Max 256GB Titanyum', price: 73499, domain: 'amazon.com.tr', url: 'https://amazon.com.tr/iphone-15-pro-max', currency: 'TL' },
  
  { name: 'Sony PlayStation 5 Slim 1TB', price: 21999, domain: 'amazon.com.tr', url: 'https://amazon.com.tr/ps5-slim', currency: 'TL' },
  { name: 'Sony PlayStation 5 Slim 1TB Oyun Konsolu', price: 22499, domain: 'hepsiburada.com', url: 'https://hepsiburada.com/ps5-slim', currency: 'TL' },
  { name: 'Sony PlayStation 5 Slim 1TB', price: 22999, domain: 'trendyol.com', url: 'https://trendyol.com/ps5-slim', currency: 'TL' },
  
  { name: 'Dyson V15 Detect Absolute Dikey Süpürge', price: 27999, domain: 'dyson.com.tr', url: 'https://dyson.com.tr/v15', currency: 'TL' },
  { name: 'Dyson V15 Detect Absolute Şarjlı Süpürge', price: 29500, domain: 'hepsiburada.com', url: 'https://hepsiburada.com/dyson-v15', currency: 'TL' },
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB for Product Seeding...');
    await mongoose.connect(MONGO_URI);
    
    console.log(`Seeding ${mockProducts.length} mock products...`);
    
    // Process and format data
    const bulkOperations = mockProducts.map(product => ({
      updateOne: {
        filter: { name: product.name, domain: product.domain },
        update: { 
          $set: {
            ...product,
            lastUpdated: new Date()
          }
        },
        upsert: true
      }
    }));

    const result = await Product.bulkWrite(bulkOperations);
    
    console.log('Product Seeding Complete!');
    console.log(`Inserted/Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error during product seeding:', err);
    process.exit(1);
  }
}

seedProducts();
