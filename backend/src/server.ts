import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/kuupa';
const ALLOWED_EXTENSION_ID = process.env.EXTENSION_ID || 'kUUpa-test-id';

// --- SECURITY MIDDLEWARES ---
// Helmet for setting secure HTTP headers
app.use(helmet());

// CORS configuration - STRICTLY allow only the Chrome Extension
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigin = `chrome-extension://${ALLOWED_EXTENSION_ID}`;
    if (!origin || origin === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
// -----------------------------

// Routes
app.use('/api/v1', apiRoutes);

// Health check endpoint (for load balancers, bypasses strict CORS if needed)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Database connection & Server start
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`kUUpa Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
