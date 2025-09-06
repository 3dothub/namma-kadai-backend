import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  method: 'COD';
  transactionId?: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
}

const PaymentSchema: Schema = new Schema({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  method: { 
    type: String,
    enum: ['COD'],
    required: true,
    default: 'COD'
  },
  transactionId: { type: String },
  amount: { type: Number, required: true },
  status: { 
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
