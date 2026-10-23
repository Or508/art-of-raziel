const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const ordersController = require('../controllers/ordersController');
const { adminRouter: adminOrderRouter } = require('./orderRoutes');

// Protected route - list customers (registered + guests if available)
router.get('/customers', verifyAdmin, adminController.getCustomers);

router.get('/orders', verifyAdmin, ordersController.getAdminOrders);
router.use('/orders', adminOrderRouter);

// Protected route - upcoming internal meetings from contact_requests
router.get('/meetings', verifyAdmin, adminController.getMeetings);

module.exports = router;

