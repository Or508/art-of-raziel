const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

// In the future you can require authentication:
// router.post('/charge', verifyToken, paymentController.createCharge);

// For now we allow public access for development/testing.
router.post('/charge', paymentController.createCharge);

module.exports = router;

