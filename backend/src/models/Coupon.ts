import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  domain: string;
  discountType: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING' | 'UNKNOWN';
  discountValue?: number;
  isExpired: boolean;
  successRate: number;
  failureCount: number;
  discoveredBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED', 'FREE_SHIPPING', 'UNKNOWN'], required: true },
    discountValue: { type: Number },
    isExpired: { type: Boolean, default: false },
    successRate: { type: Number, default: 100 },
    failureCount: { type: Number, default: 0 },
    discoveredBy: { type: String, default: 'scraper' }, // 'scraper' or 'user'
  },
  { timestamps: true }
);

// Ensure unique code per domain
CouponSchema.index({ code: 1, domain: 1 }, { unique: true });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
