import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

// Add logging middleware for auth routes
router.use((req, res, next) => {
  next();
});

router.post('/register', register);
router.post('/login', login);

// Test route to verify auth routing
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

export default router;
