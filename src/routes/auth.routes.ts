import express from 'express';
import { register, login, forgotPassword, verifyEmail, authenticateToken } from '../controllers/auth.controller';

const router = express.Router();

// Add logging middleware for auth routes
router.use((req, res, next) => {
  next();
});

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-email', verifyEmail);
router.get('/verify-token', authenticateToken);

// Test route to verify auth routing
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

export default router;
