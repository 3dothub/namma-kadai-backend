import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  getProfile,
  updateDetails,
  updateLocation,
  getNearbyVendors
} from '../controllers/user.controller';

router.get('/profile', auth, getProfile);
router.post('/update-details', auth, updateDetails);
router.post('/update-location', auth, updateLocation);
router.get('/vendors/nearby', auth, getNearbyVendors);

export default router;
