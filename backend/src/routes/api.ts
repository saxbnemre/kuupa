import { Router, Request, Response } from 'express';
import { StoreConfig } from '../models/StoreConfig';
import { Coupon } from '../models/Coupon';
import { apiLimiter, enforceExtensionOrigin } from '../middlewares/security';

const router = Router();

// Apply rate limiting and origin enforcement to all API routes
router.use(apiLimiter);
router.use(enforceExtensionOrigin);

/**
 * GET /api/v1/store/:domain
 * Returns the store configuration and available coupons for a given domain.
 */
router.get('/store/:domain', async (req: Request, res: Response) => {
  try {
    const domain = req.params.domain.toLowerCase();

    // Find store config
    const storeConfig = await StoreConfig.findOne({ domain }).lean();
    
    if (!storeConfig) {
      return res.status(404).json({ error: 'Store configuration not found' });
    }

    // Find valid coupons for this domain
    const coupons = await Coupon.find({ domain, isExpired: false })
      .sort({ successRate: -1, createdAt: -1 })
      .select('code discountType successRate')
      .lean();

    res.json({
      storeConfig: {
        domain: storeConfig.domain,
        couponInputSelector: storeConfig.couponInputSelector,
        applyButtonSelector: storeConfig.applyButtonSelector,
        successMessageSelector: storeConfig.successMessageSelector,
        failureMessageSelector: storeConfig.failureMessageSelector
      },
      coupons: coupons.map(c => c.code)
    });

  } catch (error) {
    console.error(`Error fetching store data for ${req.params.domain}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
