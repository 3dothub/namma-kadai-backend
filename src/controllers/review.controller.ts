import { Request, Response } from 'express';
import { Review, IReview } from '../models/Review';
import { Order } from '../models/Order';

// Add review
export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { vendorId, orderId, rating, comment } = req.body;

    if (!vendorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: 'Please provide vendor ID and valid rating (1-5)'
      });
    }

    // If orderId is provided, verify it exists and belongs to user
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order || order.userId.toString() !== userId) {
        return res.status(400).json({
          message: 'Invalid order ID'
        });
      }
    }

    const review = await Review.create({
      userId,
      vendorId,
      orderId,
      rating,
      comment
    });

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
};

// Get vendor reviews
export const getVendorReviews = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const reviews = await Review.find({ vendorId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const totalRating = reviews.reduce((sum: number, review: IReview) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get vendor reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};

// Get user reviews
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requesterId = (req as any).user.userId;

    // Users can only view their own reviews
    if (userId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const reviews = await Review.find({ userId })
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 });

    res.json({ reviews });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Error fetching reviews' });
  }
};
