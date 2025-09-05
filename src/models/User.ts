import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  addresses: Array<{
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    location: {
      lat: number;
      lng: number;
    };
  }>;
  cart: Array<{
    productId: mongoose.Types.ObjectId;
    quantity: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: true // Make sure password is included by default
  },
  addresses: [{
    label: { type: String, required: false },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: String, required: false },
    location: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false }
    }
  }],
  cart: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    quantity: { type: Number, required: false, min: 1 }
  }]
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', userSchema);
