import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  createOrder,
  getOrderDetails,
  getUserOrders,
  getVendorOrders,
  updateOrderStatus
} from '../controllers/order.controller';

router.post('/', auth, createOrder);
router.get('/:id', auth, getOrderDetails);
router.get('/user/:userId', auth, getUserOrders);
router.get('/vendor/:vendorId', auth, getVendorOrders);
router.patch('/:id/status', auth, updateOrderStatus);

export default router;
