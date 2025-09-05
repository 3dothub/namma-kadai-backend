import { Request, Response } from 'express';
import { Payment } from '../models/Payment';
import { Order } from '../models/Order';
import { Notification } from '../models/Notification';

// Create payment request
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId, method } = req.body;
    const userId = (req as any).user.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify user owns the order
    if (order.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ orderId });
    if (existingPayment) {
      return res.status(400).json({ 
        message: 'Payment already exists for this order' 
      });
    }

    const payment = await Payment.create({
      orderId,
      method,
      amount: order.totalAmount,
      status: 'pending'
    });

    // For COD, automatically mark as success
    if (method === 'COD') {
      payment.status = 'success';
      await payment.save();

      order.paymentStatus = 'paid';
      await order.save();

      // Create notifications
      await Notification.create({
        userId: order.userId,
        title: 'Payment Confirmed',
        message: `Payment for order #${order._id} is confirmed. Payment method: COD`,
        type: 'order_update'
      });
    }

    res.status(201).json({
      message: 'Payment request created successfully',
      payment
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ message: 'Error creating payment' });
  }
};

// Update payment status
export const updatePaymentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const validStatuses = ['success', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    payment.status = status;
    await payment.save();

    // Update order payment status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = status === 'success' ? 'paid' : 'failed';
      await order.save();

      // Create notification
      await Notification.create({
        userId: order.userId,
        title: 'Payment Status Updated',
        message: `Payment for order #${order._id} is ${status}.`,
        type: 'order_update'
      });
    }

    res.json({
      message: 'Payment status updated successfully',
      payment
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ message: 'Error updating payment status' });
  }
};

// Get payment details for an order
export const getOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user.userId;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization
    if (order.userId.toString() !== userId && order.vendorId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get order payment error:', error);
    res.status(500).json({ message: 'Error fetching payment details' });
  }
};
