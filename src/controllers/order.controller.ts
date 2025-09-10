import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Vendor } from '../models/Vendor';
import { Notification } from '../models/Notification';

// Place order
export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log('Creating order with data:', JSON.stringify(req.body, null, 2));
    
    const userId = (req as any).user.userId;
    const { 
      vendorId, 
      items, 
      deliveryAddress, 
      orderType = 'delivery',
      scheduleDetails 
    } = req.body as { 
      vendorId: string;
      items: any[];
      deliveryAddress?: any;
      orderType: 'delivery' | 'takeaway';
      scheduleDetails?: {
        isScheduled: boolean;
        scheduledFor?: Date;
        scheduleType: 'immediate' | 'scheduled';
        timeSlot?: {
          startTime: string;
          endTime: string;
        };
        specialInstructions?: string;
      };
    };

    if (!vendorId || !items || !items.length) {
      return res.status(400).json({ 
        message: 'Please provide vendor and items' 
      });
    }

    // Check if vendor exists and supports the requested order type
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ 
        message: 'Vendor not found' 
      });
    }

    if (!vendor.serviceTypes[orderType]) {
      return res.status(400).json({ 
        message: `This vendor does not support ${orderType} orders` 
      });
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ 
        message: 'Please provide delivery address for delivery orders' 
      });
    }

    // Validate schedule details if provided
    if (scheduleDetails?.isScheduled) {
      if (!scheduleDetails.scheduledFor) {
        return res.status(400).json({ 
          message: 'Scheduled date is required for scheduled orders' 
        });
      }
      
      const scheduledDate = new Date(scheduleDetails.scheduledFor);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ 
          message: 'Scheduled date must be in the future' 
        });
      }
    }

    // Calculate total amount and verify stock
    let totalAmount = 0;
    const processedItems = [];
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

      // Add processed item with product details
      processedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      // Update stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const orderData: any = {
      userId,
      vendorId,
      items: processedItems,
      totalAmount,
      orderType,
      status: 'pending',
      paymentStatus: 'pending'
    };

    // Add delivery address if delivery order
    if (orderType === 'delivery' && deliveryAddress) {
      orderData.deliveryAddress = deliveryAddress;
    }

    // Add schedule details if provided
    if (scheduleDetails) {
      orderData.scheduleDetails = {
        isScheduled: scheduleDetails.isScheduled || false,
        scheduleType: scheduleDetails.scheduleType || 'immediate',
        ...(scheduleDetails.scheduledFor && { scheduledFor: scheduleDetails.scheduledFor }),
        ...(scheduleDetails.timeSlot && { timeSlot: scheduleDetails.timeSlot }),
        ...(scheduleDetails.specialInstructions && { specialInstructions: scheduleDetails.specialInstructions })
      };
    }

    const order = await Order.create(orderData);
    console.log('Order created successfully:', order._id);

    // Create notifications
    const orderMessage = scheduleDetails?.isScheduled 
      ? `Your scheduled order #${order._id} has been placed for ${new Date(scheduleDetails.scheduledFor!).toLocaleDateString()}.`
      : `Your order #${order._id} has been placed successfully.`;

    await Notification.create({
      userId,
      title: 'Order Placed',
      message: orderMessage,
      type: 'order_update'
    });

    const vendorMessage = scheduleDetails?.isScheduled
      ? `You have received a new scheduled order #${order._id} for ${new Date(scheduleDetails.scheduledFor!).toLocaleDateString()}.`
      : `You have received a new order #${order._id}.`;

    await Notification.create({
      vendorId,
      title: 'New Order',
      message: vendorMessage,
      type: 'order_update'
    });

    // Clear user's cart after successful order
    const user = await User.findById(userId);
    if (user) {
      user.cart = [];
      await user.save();
    }

    // Populate order details for response
    const populatedOrder = await Order.findById(order._id)
      .populate('vendorId', 'name phone address')
      .populate('items.productId', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    
    // Check for specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        details: error.message 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid ID format' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
