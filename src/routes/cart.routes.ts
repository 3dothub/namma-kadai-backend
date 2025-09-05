import express from 'express';
import { auth } from '../middleware/auth';
import { addToCart,updateCart,removeFromCart,getCart } from '../controllers/cart.controller';

const router = express.Router();

router.post('/add', auth, addToCart);
router.post('/update', auth, updateCart);
router.delete('/remove/:productId', auth, removeFromCart);
router.get('/', auth, getCart);

export default router;
