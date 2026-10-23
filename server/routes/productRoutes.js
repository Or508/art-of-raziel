const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

// Public catalog for the storefront.
router.get('/', productController.getProducts);

// Stock and product edits require an admin token.
router.patch('/:id/stock', verifyAdmin, productController.updateStock);
router.put('/:id', verifyAdmin, productController.updateProduct);

module.exports = router;