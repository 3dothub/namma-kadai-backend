import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  getNotifications,
  markAsRead,
  deleteNotification
} from '../controllers/notification.controller';

router.get('/', auth, getNotifications);
router.patch('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

export default router;
