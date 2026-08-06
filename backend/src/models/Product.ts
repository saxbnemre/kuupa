import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  price: number;
  domain: string;
  url: string;
  imageUrl?: string;
  currency: string;
  lastUpdated: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: 'text' }, // Enable text search
  price: { type: Number, required: true },
  domain: { type: String, required: true },
  url: { type: String, required: true },
  imageUrl: { type: String },
  currency: { type: String, default: 'TL' },
  lastUpdated: { type: Date, default: Date.now }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
