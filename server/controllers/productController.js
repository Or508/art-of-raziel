const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

function catalogFromSeed() {
  const seedPath = path.resolve(__dirname, '../database/seed-products.json');
  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  return products.map((product, index) => ({
    id: index + 1,
    category: product.category,
    title: product.title,
    title_en: product.title_en || null,
    description: product.description || '',
    description_en: product.description_en || null,
    price: product.price,
    price_usd: product.price,
    stock: product.stock ?? 0,
    allow_preorder: product.allow_preorder ? 1 : 0,
    image_url: product.image_url || null,
    is_active: 1,
  }));
}

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.status(200).json(products);
  } catch (error) {
    console.error('Catalog database unavailable, serving the built-in list:', error.message);
    res.status(200).json(catalogFromSeed());
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