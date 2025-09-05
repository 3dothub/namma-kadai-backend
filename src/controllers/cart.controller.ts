import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';

// Add to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Please provide valid product and quantity' });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(
      item => item.productId.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Update quantity if product exists
      user.cart[cartItemIndex].quantity = quantity;
    } else {
      // Add new product to cart
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.json({ 
      message: 'Product added to cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Error adding to cart' });
  }
};

// Update cart item
export const updateCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: 'Please provide product and quantity' });
    }

    // Verify product exists and is active
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }

    // Check stock
    if (quantity > 0 && product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (quantity <= 0) {
      // Remove product if quantity is 0 or negative
      user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    } else {
      // Update quantity
      const cartItem = user.cart.find(item => item.productId.toString() === productId);
      if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in cart' });
      }
      cartItem.quantity = quantity;
    }

    await user.save();

    res.json({
      message: 'Cart updated successfully',
      cart: user.cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Error updating cart' });
  }
};

// Remove from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove product from cart
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);
    await user.save();

    res.json({
      message: 'Product removed from cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Error removing from cart' });
  }
};

// Get cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId)
      .populate('cart.productId', 'name price stock unit images');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ cart: user.cart });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
};
