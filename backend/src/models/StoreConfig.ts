import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreConfig extends Document {
  domain: string;
  couponInputSelector: string;
  applyButtonSelector: string;
  cartTotalSelector?: string; // e.g. '.total-price'
  removeCouponSelector?: string;
  successMessageSelector?: string;
  failureMessageSelector?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StoreConfigSchema: Schema = new Schema(
  {
    domain: { type: String, required: true, unique: true, index: true },
    couponInputSelector: { type: String, required: true },
    applyButtonSelector: { type: String, required: true },
    cartTotalSelector: { type: String },
    removeCouponSelector: { type: String },
    successMessageSelector: { type: String },
    failureMessageSelector: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const StoreConfig = mongoose.model<IStoreConfig>('StoreConfig', StoreConfigSchema);
