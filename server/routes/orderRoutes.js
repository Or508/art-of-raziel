const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { verifyAdmin } = require('../middleware/auth');

router.post('/', ordersController.createOrder);

const adminRouter = express.Router();
adminRouter.patch('/:id/status', verifyAdmin, ordersController.updateOrderStatus);

module.exports = router;
module.exports.adminRouter = adminRouter;
