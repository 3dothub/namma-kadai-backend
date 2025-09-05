import { Request, Response } from 'express';
import { Vendor } from '../models/Vendor';
import { Product } from '../models/Product';

// Get all vendors
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const { city, isActive } = req.query;
    
    const query: any = {};
    if (city) query['address.city'] = city;
    if (isActive) query.isActive = isActive === 'true';

    const vendors = await Vendor.find(query)
      .select('-__v')
      .sort({ createdAt: -1 });

    res.json({ vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

// Get vendor details
export const getVendorDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id).select('-__v');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({ message: 'Error fetching vendor details' });
  }
};

// Update vendor details
export const updateVendorDetails = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.vendorId;
    const {
      name,
      ownerName,
      phone,
      email,
      address,
      shopDetails
    } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (ownerName) updates.ownerName = ownerName;
    if (phone) updates.phone = phone;
    if (email) updates.email = email;
    if (address) updates.address = address;
    if (shopDetails) updates.shopDetails = {
      ...vendor.shopDetails,
      ...shopDetails
    };

    const updatedVendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: updates },
      { new: true }
    ).select('-__v');

    res.json({
      message: 'Vendor details updated successfully',
      vendor: updatedVendor
    });
  } catch (error) {
    console.error('Update vendor details error:', error);
    res.status(500).json({ message: 'Error updating vendor details' });
  }
};

// Add product
export const addProduct = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.userId;
    const {
      name,
      description,
      price,
      stock,
      unit,
      images
    } = req.body;

    if (!name || !price || !unit) {
      return res.status(400).json({
        message: 'Please provide name, price and unit'
      });
    }

    const product = await Product.create({
      vendorId,
      name,
      description,
      price,
      stock: stock || 0,
      unit,
      images: images || [],
      isActive: true
    });

    res.status(201).json({
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Error adding product' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.userId;
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    Object.assign(product, updates);
    await product.save();

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const vendorId = (req as any).user.userId;
    const { id } = req.params;

    const product = await Product.findOne({ _id: id, vendorId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
};

// Get vendor products
export const getVendorProducts = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.query;
    
    if (!vendorId) {
      return res.status(400).json({
        message: 'Please provide vendor ID'
      });
    }

    const products = await Product.find({
      vendorId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    console.error('Get vendor products error:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};
