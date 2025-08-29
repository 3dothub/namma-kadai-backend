import express from 'express';

const router = express.Router();

// Add your routes here
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

export default router;
