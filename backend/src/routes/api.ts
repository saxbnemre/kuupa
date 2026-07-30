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

// Report a failed coupon
router.post('/store/:domain/report', enforceExtensionOrigin, async (req: Request, res: Response): Promise<any> => {
  try {
    const domain = req.params.domain.toLowerCase();
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const coupon = await Coupon.findOne({ domain, code, isExpired: false });
    if (coupon) {
      coupon.failureCount = (coupon.failureCount || 0) + 1;
      if (coupon.failureCount >= 3) {
        coupon.isExpired = true;
      }
      await coupon.save();
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error reporting coupon:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Discover a new coupon (Crowdsourcing)
router.post('/store/:domain/discover', enforceExtensionOrigin, async (req: Request, res: Response): Promise<any> => {
  try {
    const domain = req.params.domain.toLowerCase();
    const { code, discountType } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    await Coupon.findOneAndUpdate(
      { domain, code },
      {
        domain,
        code,
        discountType: discountType || 'UNKNOWN',
        isExpired: false,
        discoveredBy: 'user'
      },
      { upsert: true, setDefaultsOnInsert: true }
    );

    return res.json({ success: true });
  } catch (error) {
    console.error('Error discovering coupon:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
