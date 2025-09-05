import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  createPayment,
  updatePaymentStatus,
  getOrderPayment
} from '../controllers/payment.controller';

router.post('/', auth, createPayment);
router.patch('/:id/status', auth, updatePaymentStatus);
router.get('/order/:orderId', auth, getOrderPayment);

export default router;
