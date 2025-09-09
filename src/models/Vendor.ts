import mongoose, { Schema, Document } from 'mongoose';

export interface IVendor extends Document {
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  category: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      type: 'Point';
      coordinates: number[];  // [longitude, latitude]
    };
  };
  shopDetails: {
    logoUrl: string;
    description: string;
    openingHours: {
      monday: { open: string; close: string; isOpen: boolean };
      tuesday: { open: string; close: string; isOpen: boolean };
      wednesday: { open: string; close: string; isOpen: boolean };
      thursday: { open: string; close: string; isOpen: boolean };
      friday: { open: string; close: string; isOpen: boolean };
      saturday: { open: string; close: string; isOpen: boolean };
      sunday: { open: string; close: string; isOpen: boolean };
    };
    categories: string[];
    surroundingAreas: string[];
    minOrderValue: number;
  };
  isActive: boolean;
  serviceTypes: {
    delivery: boolean;
    takeaway: boolean;
  };
  deliverySettings: {
    radius: number; // in kilometers
    areas: string[];
    minDeliveryAmount: number;
    freeDeliveryAbove: number;
    deliveryCharge: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]  // [longitude, latitude]
    }
  },
  shopDetails: {
    logoUrl: { type: String },
    description: { type: String },
    openingHours: {
      monday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      tuesday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      wednesday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      thursday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      friday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      saturday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      sunday: { 
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: false }
      }
    },
    categories: [{ type: String }],
    surroundingAreas: [{ type: String }],
    minOrderValue: { type: Number, default: 0 }
  },
  isActive: { type: Boolean, default: true },
  serviceTypes: {
    delivery: { type: Boolean, default: true },
    takeaway: { type: Boolean, default: true }
  },
  deliverySettings: {
    radius: { type: Number, default: 5 }, // 5 km default radius
    areas: [{ type: String }],
    minDeliveryAmount: { type: Number, default: 0 },
    freeDeliveryAbove: { type: Number, default: 500 },
    deliveryCharge: { type: Number, default: 40 }
  }
}, { timestamps: true });

// Create a 2dsphere index for geospatial queries
VendorSchema.index({ "address.location": "2dsphere" });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
export default Vendor;
