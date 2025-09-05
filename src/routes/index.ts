import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import vendorRoutes from './vendor.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import notificationRoutes from './notification.routes';
import paymentRoutes from './payment.routes';
import reviewRoutes from './review.routes';

const router = express.Router();

// Welcome route
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Namma Kadai API' });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/vendors', vendorRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

export default router;
