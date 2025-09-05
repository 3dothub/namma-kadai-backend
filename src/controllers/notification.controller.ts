import { Request, Response } from 'express';
import { Notification } from '../models/Notification';

// Get notifications
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId, vendorId } = req.query;
    const requesterId = (req as any).user.userId;

    // Validate authorization
    if (userId && userId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (vendorId && vendorId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Build query
    const query = {
      ...(userId && { userId }),
      ...(vendorId && { vendorId })
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (
      (notification.userId && notification.userId.toString() !== userId) ||
      (notification.vendorId && notification.vendorId.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if user owns the notification
    if (
      (notification.userId && notification.userId.toString() !== userId) ||
      (notification.vendorId && notification.vendorId.toString() !== userId)
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();

    res.json({
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};
