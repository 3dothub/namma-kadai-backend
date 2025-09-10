import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderType: 'delivery' | 'takeaway';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      lat: number;
      lng: number;
    };
  };
  status: 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  scheduleDetails?: {
    isScheduled: boolean;
    scheduledFor: Date;
    scheduleType: 'immediate' | 'scheduled';
    timeSlot?: {
      startTime: string;
      endTime: string;
    };
    specialInstructions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderType: {
    type: String,
    enum: ['delivery', 'takeaway'],
    required: true
  },
  deliveryAddress: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  scheduleDetails: {
    isScheduled: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    scheduleType: {
      type: String,
      enum: ['immediate', 'scheduled'],
      default: 'immediate'
    },
    timeSlot: {
      startTime: { type: String },
      endTime: { type: String }
    },
    specialInstructions: { type: String }
  }
}, { timestamps: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
