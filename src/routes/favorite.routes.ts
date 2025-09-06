import express from 'express';
import { auth } from '../middleware/auth';
import { addToFavorites, removeFromFavorites, getFavorites } from '../controllers/favorite.controller';

const router = express.Router();

router.get('/', auth, getFavorites);
router.post('/:productId', auth, addToFavorites);
router.delete('/:productId', auth, removeFromFavorites);

export default router;
