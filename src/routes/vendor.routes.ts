import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

import {
  getAllVendors,
  getVendorDetails,
  updateVendorDetails,
  addProduct,
  updateProduct,
  deleteProduct,
  getVendorProducts
} from '../controllers/vendor.controller';

router.get('/', getAllVendors);

// Place specific routes BEFORE parameterized routes
router.get('/products', getVendorProducts);
router.post('/products', auth, addProduct);
router.patch('/products/:id', auth, updateProduct);
router.delete('/products/:id', auth, deleteProduct);

router.post('/update-details', auth, updateVendorDetails);

// Keep parameterized routes at the end
router.get('/:id', getVendorDetails);

export default router;
