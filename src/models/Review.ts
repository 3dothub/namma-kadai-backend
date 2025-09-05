import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { 
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: { type: String }
}, { timestamps: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
