import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  shopDetails: {
    logoUrl: string;
    description: string;
    openingHours: string;
  };
  isActive: boolean;
  providesDelivery: boolean;
  providesTakeAway: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  shopDetails: {
    logoUrl: { type: String },
    description: { type: String },
    openingHours: { type: String }
  },
  isActive: { type: Boolean, default: true },
  providesDelivery: { type: Boolean, default: true },
  providesTakeAway: { type: Boolean, default: false },
}, { timestamps: true });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
export default Vendor;
