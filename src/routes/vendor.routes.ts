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
router.get('/:id', getVendorDetails);
router.post('/update-details', auth, updateVendorDetails);

router.post('/products', auth, addProduct);
router.patch('/products/:id', auth, updateProduct);
router.delete('/products/:id', auth, deleteProduct);
router.get('/products', getVendorProducts);

export default router;
