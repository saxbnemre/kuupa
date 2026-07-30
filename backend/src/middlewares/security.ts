import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

// Allowed Chrome Extension ID (This should ideally be in env vars for production)
const ALLOWED_EXTENSION_ID = process.env.EXTENSION_ID || 'kUUpa-test-id';

// Rate limiter for API endpoints to prevent brute-force and DDoS
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to enforce extension origin
export const enforceExtensionOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin;
  const extensionId = req.headers['x-extension-id'];
  
  // Allow requests coming from the explicit chrome-extension origin OR carrying the explicit ID
  const allowedOrigin = `chrome-extension://${ALLOWED_EXTENSION_ID}`;

  if (origin === allowedOrigin || extensionId === ALLOWED_EXTENSION_ID) {
    return next();
  }
  
  console.log(`[CORS Blocked] Origin: '${origin}', X-Extension-ID: '${extensionId}' but expected: '${ALLOWED_EXTENSION_ID}'`);
  
  // For dev purposes, if we are testing locally without the extension, 
  // you might conditionally bypass this. But as per requirements: NO WILDCARD CORS.
  if (process.env.NODE_ENV !== 'production' && origin === 'http://localhost:3000') {
     return next(); // Just for local UI testing if necessary
  }

  res.status(403).json({
    error: 'Forbidden: Invalid Origin.',
  });
};
