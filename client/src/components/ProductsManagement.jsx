import React, { useState, useMemo } from 'react';
import { Package, Edit, Trash2, Plus, Search, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProductsManagement.css';

const ProductsManagement = ({ language, products = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [managedProducts, setManagedProducts] = useState(products);

  // Sync when parent products change
  React.useEffect(() => {
    setManagedProducts(products);
  }, [products]);

  // Mock data with stock levels and sales data
  const productsWithStock = useMemo(() => {
    return managedProducts.map((product, index) => ({
      ...product,
      id: product._id || product.id || index,
      stock: typeof product.stock === 'number' ? product.stock : 0,
      status: product.is_active === false ? 'draft' : 'active',
      sales24h: 0,
      image: product.image || product.image_url || null
    }));
  }, [managedProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = productsWithStock.filter(product => {
      const matchesSearch = 
        (product.name || product.nameHe || product.nameEn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description || product.descriptionHe || product.descriptionEn || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = (a.name || a.nameHe || a.nameEn || '').toLowerCase();
          bVal = (b.name || b.nameHe || b.nameEn || '').toLowerCase();
          break;
        case 'price':
          aVal = a.price || 0;
          bVal = b.price || 0;
          break;
        case 'stock':
          aVal = a.stock || 0;
          bVal = b.stock || 0;
          break;
        case 'sales':
          aVal = a.sales24h || 0;
          bVal = b.sales24h || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [productsWithStock, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm(language === 'he' 
      ? 'האם אתה בטוח שברצונך למחוק את המוצר?' 
      : 'Are you sure you want to delete this product?')) {
      // TODO: Implement delete functionality
      console.log('Delete product:', productId);
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const getStockColor = (stock) => {
    if (stock < 5) return '#ff6b6b'; // Red - Low stock
    if (stock > 20) return '#00d4ff'; // Cyan - Good stock
    return '#D4AF37'; // Gold - Medium stock
  };

  const getStockPercentage = (stock) => {
    const maxStock = 50; // Assuming max stock is 50 for visualization
    return Math.min((stock / maxStock) * 100, 100);
  };

  const isTrending = (sales24h) => {
    return sales24h >= 10; // Trending if 10+ sales in 24h
  };

  const updateStockInline = async (productId, delta) => {
    try {
      const token = localStorage.getItem('adminToken') || '';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ delta })
      });

      if (!response.ok) {
        console.error('Failed to update stock');
        return;
      }

      setManagedProducts(prev =>
        prev.map(p =>
          (p._id || p.id) === productId
            ? { ...p, stock: Math.max((p.stock || 0) + delta, 0) }
            : p
        )
      );
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  return (
    <div className="products-management">
      {/* Header with Actions */}
      <div className="products-header">
        <div className="header-left">
          <h2 className="section-title">
            {language === 'he' ? 'ניהול מוצרים' : 'Products Management'}
          </h2>
          <p className="section-subtitle">
            {filteredAndSortedProducts.length} {language === 'he' ? 'מוצרים' : 'products'}
          </p>
        </div>
        <button className="add-product-btn" onClick={handleAddNew}>
          <Plus size={20} />
          <span>{language === 'he' ? 'הוסף מוצר' : 'Add Product'}</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="products-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={language === 'he' ? 'חפש מוצר...' : 'Search products...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{language === 'he' ? 'כל הקטגוריות' : 'All Categories'}</option>
            <option value="mezuzah">{language === 'he' ? 'מזוזות' : 'Mezuzahs'}</option>
            <option value="amulet">{language === 'he' ? 'קמיעות' : 'Amulets'}</option>
            <option value="other">{language === 'he' ? 'אחר' : 'Other'}</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">{language === 'he' ? 'כל הסטטוסים' : 'All Statuses'}</option>
            <option value="active">{language === 'he' ? 'פעיל' : 'Active'}</option>
            <option value="draft">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="products-table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th className="col-image">{language === 'he' ? 'תמונה' : 'Image'}</th>
              <th 
                className="col-name sortable"
                onClick={() => handleSort('name')}
              >
                {language === 'he' ? 'שם מוצר' : 'Product Name'}
                {sortBy === 'name' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="col-category">{language === 'he' ? 'קטגוריה' : 'Category'}</th>
              <th 
                className="col-price sortable"
                onClick={() => handleSort('price')}
              >
                {language === 'he' ? 'מחיר' : 'Price'}
                {sortBy === 'price' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="col-stock sortable"
                onClick={() => handleSort('stock')}
              >
                {language === 'he' ? 'מלאי' : 'Stock'}
                {sortBy === 'stock' && (
                  <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="col-status">{language === 'he' ? 'סטטוס' : 'Status'}</th>
              <th className="col-actions">{language === 'he' ? 'פעולות' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredAndSortedProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
                  className={`product-row ${product.status} ${hoveredRow === product.id ? 'hovered' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.02 }}
                  onMouseEnter={() => setHoveredRow(product.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="col-image">
                    <div className="product-image-cell">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="image-placeholder">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="col-name">
                    <div className="product-name-cell">
                      <span className="product-name">{product.name || product.nameHe || product.nameEn}</span>
                      {isTrending(product.sales24h) && (
                        <span className="trending-badge">
                          🔥 {language === 'he' ? 'טרנדינג' : 'Trending'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="col-category">
                    <span className={`category-badge ${product.category}`}>
                      {product.category === 'mezuzah' 
                        ? (language === 'he' ? 'מזוזה' : 'Mezuzah')
                        : product.category === 'amulet'
                        ? (language === 'he' ? 'קמיע' : 'Amulet')
                        : (language === 'he' ? 'אחר' : 'Other')
                      }
                    </span>
                  </td>
                  <td className="col-price">
                    <span className="price-value">
                      ${(product.price || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="col-stock">
                    <div className="stock-indicator">
                      <div className="stock-bar-container">
                        <div
                          className="stock-bar"
                          style={{
                            width: `${getStockPercentage(product.stock)}%`,
                            backgroundColor: getStockColor(product.stock)
                          }}
                        />
                      </div>
                      <div className="stock-controls">
                        <button
                          type="button"
                          className="stock-btn stock-btn-minus"
                          onClick={() => updateStockInline(product._id || product.id, -1)}
                          title={language === 'he' ? 'הפחת מלאי' : 'Decrease stock'}
                        >
                          −
                        </button>
                        <span className="stock-value" style={{ color: getStockColor(product.stock) }}>
                          {product.stock}
                        </span>
                        <button
                          type="button"
                          className="stock-btn stock-btn-plus"
                          onClick={() => updateStockInline(product._id || product.id, 1)}
                          title={language === 'he' ? 'הוסף מלאי' : 'Increase stock'}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge ${product.status}`}>
                      {product.status === 'active' 
                        ? (language === 'he' ? 'פעיל' : 'Active')
                        : (language === 'he' ? 'טיוטה' : 'Draft')
                      }
                    </span>
                  </td>
                  <td className="col-actions">
                    <AnimatePresence>
                      {hoveredRow === product.id && (
                        <motion.div
                          className="action-buttons"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(product)}
                            title={language === 'he' ? 'ערוך' : 'Edit'}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(product.id)}
                            title={language === 'he' ? 'מחק' : 'Delete'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredAndSortedProducts.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>{language === 'he' ? 'לא נמצאו מוצרים' : 'No products found'}</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <ProductModal
            product={editingProduct}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSave={(productData) => {
              console.log('Save product:', productData);
              // TODO: Implement save functionality
              setShowModal(false);
              setEditingProduct(null);
            }}
            language={language}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Product Modal Component
const ProductModal = ({ product, onClose, onSave, language }) => {
  const [formData, setFormData] = useState({
    nameHe: product?.nameHe || '',
    nameEn: product?.nameEn || '',
    descriptionHe: product?.descriptionHe || '',
    descriptionEn: product?.descriptionEn || '',
    category: product?.category || 'mezuzah',
    price: product?.price || 0,
    stock: product?.stock || 0,
    allow_preorder: !!product?.allow_preorder,
    status: product?.status || 'active',
    image: product?.image || ''
  });

  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      className="product-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="product-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {product 
              ? (language === 'he' ? 'ערוך מוצר' : 'Edit Product')
              : (language === 'he' ? 'הוסף מוצר חדש' : 'Add New Product')
            }
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <div className="floating-label-container">
                <input
                  type="text"
                  name="nameHe"
                  value={formData.nameHe}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('nameHe')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input ${focusedField === 'nameHe' || formData.nameHe ? 'focused' : ''}`}
                  required
                />
                <label className="floating-label">
                  {language === 'he' ? 'שם מוצר (עברית)' : 'Product Name (Hebrew)'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-label-container">
                <input
                  type="text"
                  name="nameEn"
                  value={formData.nameEn}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('nameEn')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input ${focusedField === 'nameEn' || formData.nameEn ? 'focused' : ''}`}
                  required
                />
                <label className="floating-label">
                  {language === 'he' ? 'שם מוצר (אנגלית)' : 'Product Name (English)'}
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="floating-label-container">
                <textarea
                  name="descriptionHe"
                  value={formData.descriptionHe}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('descriptionHe')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input floating-textarea ${focusedField === 'descriptionHe' || formData.descriptionHe ? 'focused' : ''}`}
                  rows="3"
                />
                <label className="floating-label">
                  {language === 'he' ? 'תיאור (עברית)' : 'Description (Hebrew)'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-label-container">
                <textarea
                  name="descriptionEn"
                  value={formData.descriptionEn}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('descriptionEn')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input floating-textarea ${focusedField === 'descriptionEn' || formData.descriptionEn ? 'focused' : ''}`}
                  rows="3"
                />
                <label className="floating-label">
                  {language === 'he' ? 'תיאור (אנגלית)' : 'Description (English)'}
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="floating-label-container">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="floating-input floating-select"
                >
                  <option value="mezuzah">{language === 'he' ? 'מזוזה' : 'Mezuzah'}</option>
                  <option value="amulet">{language === 'he' ? 'קמיע' : 'Amulet'}</option>
                  <option value="other">{language === 'he' ? 'אחר' : 'Other'}</option>
                </select>
                <label className="floating-label">
                  {language === 'he' ? 'קטגוריה' : 'Category'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-label-container">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('price')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input ${focusedField === 'price' || formData.price ? 'focused' : ''}`}
                  min="0"
                  step="0.01"
                  required
                />
                <label className="floating-label">
                  {language === 'he' ? 'מחיר (USD)' : 'Price (USD)'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-label-container">
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('stock')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input ${focusedField === 'stock' || formData.stock ? 'focused' : ''}`}
                  min="0"
                  required
                />
                <label className="floating-label">
                  {language === 'he' ? 'מלאי' : 'Stock'}
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <div className="floating-label-container">
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="floating-input floating-select"
                >
                  <option value="active">{language === 'he' ? 'פעיל' : 'Active'}</option>
                  <option value="draft">{language === 'he' ? 'טיוטה' : 'Draft'}</option>
                </select>
                <label className="floating-label">
                  {language === 'he' ? 'סטטוס' : 'Status'}
                </label>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-label-container">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('image')}
                  onBlur={() => setFocusedField(null)}
                  className={`floating-input ${focusedField === 'image' || formData.image ? 'focused' : ''}`}
                  placeholder=" "
                />
                <label className="floating-label">
                  {language === 'he' ? 'קישור לתמונה' : 'Image URL'}
                </label>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allow_preorder"
                  checked={formData.allow_preorder}
                  onChange={handleChange}
                />
                <span>
                  {language === 'he'
                    ? 'אפשר הזמנה עתידית'
                    : 'Allow Future Orders / Pre-order'}
                </span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose}>
              {language === 'he' ? 'ביטול' : 'Cancel'}
            </button>
            <button type="submit" className="save-btn">
              {language === 'he' ? 'שמור' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ProductsManagement;
