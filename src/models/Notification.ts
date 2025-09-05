import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId?: mongoose.Types.ObjectId;
  vendorId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'order_update' | 'promo' | 'system';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String,
    enum: ['order_update', 'promo', 'system'],
    required: true
  },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
