import mongoose, { Schema, Document } from 'mongoose';

export interface IStoreConfig extends Document {
  domain: string;
  couponInputSelector: string;
  applyButtonSelector: string;
  successMessageSelector?: string;
  failureMessageSelector?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StoreConfigSchema: Schema = new Schema(
  {
    domain: { type: String, required: true, unique: true, index: true },
    couponInputSelector: { type: String, required: true },
    applyButtonSelector: { type: String, required: true },
    successMessageSelector: { type: String },
    failureMessageSelector: { type: String }
  },
  { timestamps: true }
);

export const StoreConfig = mongoose.model<IStoreConfig>('StoreConfig', StoreConfigSchema);
