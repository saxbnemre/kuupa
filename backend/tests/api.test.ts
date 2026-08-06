import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/server';
import { StoreConfig } from '../src/models/StoreConfig';
import { Coupon } from '../src/models/Coupon';
import { Product } from '../src/models/Product';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Setup some mock data before each test
  await StoreConfig.deleteMany({});
  await Coupon.deleteMany({});
  await Product.deleteMany({});

  await StoreConfig.create({
    domain: 'teststore.com',
    couponInputSelector: '#coupon',
    applyButtonSelector: '#apply',
    successMessageSelector: '.success',
    failureMessageSelector: '.error'
  });

  await Coupon.create({
    code: 'SAVE20',
    domain: 'teststore.com',
    discountType: 'PERCENTAGE',
    successRate: 100,
    failureCount: 0,
    isExpired: false
  });
});

import dotenv from 'dotenv';
dotenv.config();

const extId = process.env.EXTENSION_ID || 'kUUpa-test-id';
const EXT_HEADER = { 'x-extension-id': extId };
describe('API Endpoints - Integration & Error Tests', () => {
  
  describe('GET /api/v1/store/:domain', () => {
    it('should return store config and coupons for a valid domain', async () => {
      const res = await request(app)
        .get('/api/v1/store/teststore.com')
        .set(EXT_HEADER);

      expect(res.status).toBe(200);
      expect(res.body.storeConfig.domain).toBe('teststore.com');
      expect(res.body.coupons).toContain('SAVE20');
    });

    it('should return 404 for an unknown domain', async () => {
      const res = await request(app)
        .get('/api/v1/store/unknown.com')
        .set(EXT_HEADER);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Store configuration not found');
    });

    it('should return 403 Forbidden without proper extension origin header', async () => {
      const res = await request(app).get('/api/v1/store/teststore.com');
      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/store/:domain/report', () => {
    it('should increment failure count and not expire on first failure', async () => {
      const res = await request(app)
        .post('/api/v1/store/teststore.com/report')
        .set(EXT_HEADER)
        .send({ code: 'SAVE20' });

      expect(res.status).toBe(200);

      const coupon = await Coupon.findOne({ code: 'SAVE20' });
      expect(coupon?.failureCount).toBe(1);
      expect(coupon?.isExpired).toBe(false);
    });

    it('should mark coupon as expired after 3 failures (Edge Case)', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/store/teststore.com/report')
          .set(EXT_HEADER)
          .send({ code: 'SAVE20' });
      }
      const coupon = await Coupon.findOne({ code: 'SAVE20' });
      expect(coupon?.failureCount).toBe(3);
      expect(coupon?.isExpired).toBe(true);
    });

    it('should return 400 for missing code in body', async () => {
      const res = await request(app)
        .post('/api/v1/store/teststore.com/report')
        .set(EXT_HEADER)
        .send({}); // Missing code

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toBe('Invalid value'); // express-validator default for missing string
    });
  });

  describe('POST /api/v1/store/:domain/discover', () => {
    it('should successfully add a new discovered coupon', async () => {
      const res = await request(app)
        .post('/api/v1/store/teststore.com/discover')
        .set(EXT_HEADER)
        .send({ code: 'NEWCODE50', discountType: 'PERCENTAGE' });

      expect(res.status).toBe(200);
      
      const newCoupon = await Coupon.findOne({ code: 'NEWCODE50' });
      expect(newCoupon).toBeTruthy();
      expect(newCoupon?.discoveredBy).toBe('user');
    });

    it('should return 400 for invalid discount type', async () => {
      const res = await request(app)
        .post('/api/v1/store/teststore.com/discover')
        .set(EXT_HEADER)
        .send({ code: 'BADTYPE', discountType: 'INVALID_TYPE' });

      expect(res.status).toBe(400);
      expect(res.body.errors[0].msg).toBe('Invalid discount type');
    });
  });

  describe('Load/Stress Test Simulation', () => {
    it('should handle 50 concurrent requests without crashing', async () => {
      const promises = Array.from({ length: 50 }).map(() => 
        request(app).get('/api/v1/store/teststore.com').set(EXT_HEADER)
      );
      
      const results = await Promise.all(promises);
      results.forEach(res => {
        // Just verify they didn't fail with 500
        expect([200, 429]).toContain(res.status); // 429 could happen due to rateLimiter
      });
    });
  });
});
