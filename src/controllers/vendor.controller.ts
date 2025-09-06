import { Request, Response } from 'express';
import { Vendor } from '../models/Vendor';
import { Product } from '../models/Product';

// Get all vendors or nearby vendors
export const getAllVendors = async (req: Request, res: Response) => {
  try {
    const { city, isActive, lat, lng } = req.query;
    
    let query: any = {};
    
    // If coordinates are provided, search by location
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({ message: 'Invalid coordinates' });
      }

      // Find all vendors within max possible delivery radius (e.g., 20km)
      // We'll filter based on individual vendor's radius later
      query = {
        ...query,
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]  // MongoDB uses [lng, lat] order
            },
            $maxDistance: 20000  // 20km in meters - maximum possible coverage
          }
        }
      };
    } else if (city) {
      query['address.city'] = city;
    }

    if (isActive) query.isActive = isActive === 'true';

    const vendors = await Vendor.find(query)
      .select('-__v')
      .sort({ createdAt: -1 });

    // Calculate distance and add delivery availability for each vendor
    const vendorsWithDistance = vendors.map(vendor => {
      let distance = 0;
      let isDeliveryAvailable = false;

      if (lat && lng) {
        // Calculate exact distance
        const vendorLng = vendor.address.location.coordinates[0];
        const vendorLat = vendor.address.location.coordinates[1];
        distance = calculateDistance(
          parseFloat(lat as string),
          parseFloat(lng as string),
          vendorLat,
          vendorLng
        );

        // Check if delivery is available based on vendor's settings
        isDeliveryAvailable = 
          vendor.serviceTypes.delivery && 
          distance <= vendor.deliverySettings.radius;
      }

      return {
        ...vendor.toObject(),
        distance: Math.round(distance * 10) / 10, // Round to 1 decimal place
        isDeliveryAvailable,
        estimatedDeliveryTime: calculateDeliveryTime(distance),
        deliveryCharge: calculateDeliveryCharge(
          distance,
          vendor.deliverySettings
        )
      };
    });

    // Sort by distance if coordinates were provided
    if (lat && lng) {
      vendorsWithDistance.sort((a, b) => a.distance - b.distance);
    }

    res.json({ 
      vendors: vendorsWithDistance,
      totalResults: vendorsWithDistance.length
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value: number): number => {
  return value * Math.PI / 180;
};

// Helper function to calculate estimated delivery time based on distance
const calculateDeliveryTime = (distance: number): string => {
  // Base time: 15 minutes preparation + 2 minutes per km
  const totalMinutes = Math.round(15 + (distance * 2));
  return `${totalMinutes}-${totalMinutes + 10} mins`;
};

// Helper function to calculate delivery charge
const calculateDeliveryCharge = (
  distance: number,
  deliverySettings: {
    deliveryCharge: number;
    freeDeliveryAbove: number;
    minDeliveryAmount: number;
  }
): number => {
  // Base delivery charge
  let charge = deliverySettings.deliveryCharge;

  // Add ₹10 for every kilometer after 5km
  if (distance > 5) {
    charge += Math.ceil(distance - 5) * 10;
  }

  return charge;
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
      shopDetails,
      serviceTypes
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
    if (serviceTypes) updates.serviceTypes = {
      ...vendor.serviceTypes,
      ...serviceTypes
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
