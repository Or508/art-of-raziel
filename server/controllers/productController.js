const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'שגיאה בשליפת קטלוג המוצרים',
    });
  }
};

// PATCH /api/products/:id/stock  { delta: number }
exports.updateStock = async (req, res) => {
  const { id } = req.params;
  const { delta } = req.body;

  if (typeof delta !== 'number' || !Number.isFinite(delta)) {
    return res.status(400).json({
      success: false,
      message: 'delta must be a numeric value',
    });
  }

  try {
    const result = await Product.updateStockByDelta(id, delta);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update stock',
    });
  }
};

// PUT /api/products/:id  { allow_preorder, stock, ... }
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const fields = req.body || {};

  try {
    const result = await Product.update(id, fields);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update product',
    });
  }
};