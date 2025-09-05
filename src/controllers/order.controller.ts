import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Notification } from '../models/Notification';

// Place order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { vendorId, items, deliveryAddress } = req.body;

    if (!vendorId || !items || !items.length || !deliveryAddress) {
      return res.status(400).json({ 
        message: 'Please provide vendor, items and delivery address' 
      });
    }

    // Calculate total amount and verify stock
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ 
          message: `Product ${item.productId} not found or unavailable` 
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${product.name}` 
        });
      }
      totalAmount += product.price * item.quantity;

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      userId,
      vendorId,
      items,
      totalAmount,
      deliveryAddress,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create notifications
    await Notification.create({
      userId,
      title: 'Order Placed',
      message: `Your order #${order._id} has been placed successfully.`,
      type: 'order_update'
    });

    await Notification.create({
      vendorId,
      title: 'New Order',
      message: `You have received a new order #${order._id}.`,
      type: 'order_update'
    });

    // Clear user's cart after successful order
    const user = await User.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Error creating order' });
  }
};

// Get order details
export const getOrderDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const order = await Order.findById(id)
      .populate('vendorId', 'name phone')
      .populate('items.productId', 'name images');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.userId.toString() !== userId && order.vendorId.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Error fetching order details' });
  }
};

// Get user orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requesterId = (req as any).user.userId;

    // Users can only view their own orders
    if (userId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('vendorId', 'name')
      .populate('items.productId', 'name images');

    res.json({ orders });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Get vendor orders
export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;
    const requesterId = (req as any).user.userId;

    // Vendors can only view their own orders
    if (vendorId !== requesterId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const orders = await Order.find({ vendorId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name phone')
      .populate('items.productId', 'name images');

    res.json({ orders });
  } catch (error) {
    console.error('Get vendor orders error:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = (req as any).user.userId;

    const validStatuses = ['confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findOne({ _id: id, vendorId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    // Create notification for user
    await Notification.create({
      userId: order.userId,
      title: 'Order Status Updated',
      message: `Your order #${order._id} is now ${status}.`,
      type: 'order_update'
    });

    res.json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Error updating order status' });
  }
};
