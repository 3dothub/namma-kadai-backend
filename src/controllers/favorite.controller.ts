import { Request, Response } from 'express';
import { User } from '../models/User';
import { Product } from '../models/Product';

export const getFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await User.findById(userId)
      .populate({
        path: 'favorites',
        select: 'name price description images unit isActive vendorId',
        populate: {
          path: 'vendorId',
          select: 'name shopDetails.logoUrl'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activeProducts = user.favorites.filter((product: any) => product.isActive);

    res.json({
      favorites: activeProducts,
      totalResults: activeProducts.length
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
};

export const addToFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found or inactive' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { favorites: productId }
      },
      { new: true }
    ).populate({
      path: 'favorites',
      select: 'name price description images unit isActive vendorId',
      populate: {
        path: 'vendorId',
        select: 'name shopDetails.logoUrl'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Product added to favorites',
      favorites: user.favorites,
      totalResults: user.favorites.length
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ message: 'Error adding to favorites' });
  }
};

export const removeFromFavorites = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { productId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { favorites: productId }
      },
      { new: true }
    ).populate({
      path: 'favorites',
      select: 'name price description images unit isActive vendorId',
      populate: {
        path: 'vendorId',
        select: 'name shopDetails.logoUrl'
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Product removed from favorites',
      favorites: user.favorites,
      totalResults: user.favorites.length
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ message: 'Error removing from favorites' });
  }
};
