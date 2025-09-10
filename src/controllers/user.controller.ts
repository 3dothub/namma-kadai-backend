import { Request, Response } from 'express';
import { User } from '../models/User';
import { Vendor } from '../models/Vendor';

// Get user profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

// Update user details
export const updateDetails = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { name, phone, addresses, productId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          name,
          phone,
          ...(addresses && { addresses })
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user 
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

// Update user's current location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If there's no current address, create one
    if (!user.addresses || user.addresses.length === 0) {
      user.addresses = [{
        label: 'Current Location',
        street: 'Unknown',
        city: 'Unknown',
        state: 'Unknown',
        pincode: 'Unknown',
        location: { lat, lng }
      }];
    } else {
      // Update the location of the first address
      user.addresses[0].location = { lat, lng };
    }

    await user.save();

    res.json({ 
      message: 'Location updated successfully',
      location: { lat, lng }
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Error updating location' });
  }
};

// Get nearby vendors
export const getNearbyVendors = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Please provide latitude and longitude' });
    }

    // Convert radius to number and validate
    const radiusNum = Number(radius);
    if (isNaN(radiusNum) || radiusNum <= 0) {
      return res.status(400).json({ message: 'Invalid radius' });
    }

    // Find vendors within radius using MongoDB's geospatial queries
    const vendors = await Vendor.find({
      'address.location': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: radiusNum * 1000 // Convert km to meters
        }
      },
      isActive: true
    }).select('-__v');

    res.json({ vendors });
  } catch (error) {
    console.error('Get nearby vendors error:', error);
    res.status(500).json({ message: 'Error fetching nearby vendors' });
  }
};
