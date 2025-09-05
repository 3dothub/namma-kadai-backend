import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  addReview,
  getVendorReviews,
  getUserReviews
} from '../controllers/review.controller';

router.post('/', auth, addReview);
router.get('/vendor/:vendorId', getVendorReviews);
router.get('/user/:userId', auth, getUserReviews);

export default router;
