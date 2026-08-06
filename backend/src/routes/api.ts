import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { StoreConfig } from '../models/StoreConfig';
import { Coupon } from '../models/Coupon';
import { apiLimiter, enforceExtensionOrigin } from '../middlewares/security';
import { Product } from '../models/Product';

const router = Router();

// Validation result handler
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Apply rate limiting and origin enforcement to all API routes
router.use(apiLimiter);
router.use(enforceExtensionOrigin);

/**
 * GET /api/v1/store/:domain
 * Returns the store configuration and available coupons for a given domain.
 */
router.get('/store/:domain', [
  param('domain').isString().trim().notEmpty().withMessage('Domain is required')
], validateRequest, async (req: Request, res: Response) => {
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
router.post('/store/:domain/report', enforceExtensionOrigin, [
  param('domain').isString().trim().notEmpty().withMessage('Domain is required'),
  body('code').isString().trim().notEmpty().withMessage('Code is required')
], validateRequest, async (req: Request, res: Response): Promise<any> => {
  try {
    const domain = req.params.domain.toLowerCase();
    const { code } = req.body;

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
router.post('/store/:domain/discover', enforceExtensionOrigin, [
  param('domain').isString().trim().notEmpty().withMessage('Domain is required'),
  body('code').isString().trim().notEmpty().withMessage('Code is required'),
  body('discountType').optional().isString().isIn(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'UNKNOWN']).withMessage('Invalid discount type')
], validateRequest, async (req: Request, res: Response): Promise<any> => {
  try {
    const domain = req.params.domain.toLowerCase();
    const { code, discountType } = req.body;

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

// Search Products (Price Comparison)
router.get('/search', enforceExtensionOrigin, [
  query('q').isString().trim().notEmpty().withMessage('Search query is required')
], validateRequest, async (req: Request, res: Response): Promise<any> => {
  try {
    const query = req.query.q as string;

    // Perform text search and sort by price ascending
    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ price: 1 })
    .limit(10)
    .lean();

    return res.json({ products });
  } catch (error) {
    console.error('Error searching products:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;
