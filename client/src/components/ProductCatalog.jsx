import React, { useMemo } from 'react';
import { formatStorePrice } from '../utils/price';

const ProductCatalog = ({ products, language, addToCart }) => {
  // Filter products by category
  const getUniqueProducts = (productList) => {
    const seen = new Set();
    return productList.filter(p => {
      const id = p._id || p.id || `${p.name || p.nameHe || p.nameEn}_${p.price}`;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  };

  const allMezuzahs = useMemo(() => {
    return getUniqueProducts(products.filter(p => p.category === 'mezuzah'));
  }, [products]);

  const allAmulets = useMemo(() => {
    return getUniqueProducts(products.filter(p => p.category === 'amulet'));
  }, [products]);

  const otherProducts = useMemo(() => {
    return getUniqueProducts(products.filter(p => p.category !== 'mezuzah' && p.category !== 'amulet'));
  }, [products]);

  const ProductCard = ({ product }) => {
    const imageSrc = product.image || product.image_url || null;
    const stockKnown = Number.isFinite(Number(product.stock));
    const stock = stockKnown ? Number(product.stock) : Infinity;
    const allowPreorder = !!product.allow_preorder;
    const isLowStock = stock > 0 && stock <= 5;
    const stockBadge = !stockKnown
      ? null
      : stock > 5
        ? {
            className: 'stock-badge stock-badge-available',
            text: language === 'he' ? 'במלאי' : 'Available',
          }
        : isLowStock
          ? {
              className: 'stock-badge stock-badge-low',
              text: language === 'he'
                ? `נשארו רק ${stock} יחידות במלאי!`
                : `Only ${stock} items left in stock!`,
            }
          : allowPreorder
            ? {
                className: 'stock-badge stock-badge-preorder',
                text: language === 'he'
                  ? 'הזמנה מוקדמת - ייצור בעבודת יד'
                  : 'Pre-order - Handcrafted on demand',
              }
            : {
                className: 'stock-badge stock-badge-out',
                text: language === 'he'
                  ? 'אזל זמנית מהמלאי - ניתן לפנות בוואטסאפ לבירור'
                  : 'Temporarily Out of Stock - Contact on WhatsApp for availability',
              };
    
    const handleAddToCart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
    };
    
    const isInStock = stock > 0;
    const canPreorder = !isInStock && allowPreorder;
    const isUnavailable = !isInStock && !allowPreorder;
    
    return (
      <div className="product-card" dir={language === 'he' ? 'rtl' : 'ltr'}>
        {imageSrc ? (
          <img src={imageSrc} alt={product.name} />
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <span style={{ color: 'rgba(212, 175, 55, 0.5)', fontFamily: 'Cinzel' }}>
              {language === 'he' ? 'אמנות קדושה' : 'Sacred Art'}
            </span>
          </div>
        )}
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          {formatStorePrice(product.price, language)}
        </div>
        {stockKnown && (
          <div className={stockBadge.className} role="status">
            {stockBadge.text}
          </div>
        )}
        <button 
          className={`order-btn ${isUnavailable ? 'order-btn-disabled' : canPreorder ? 'order-btn-preorder' : ''}`} 
          onClick={isUnavailable ? undefined : handleAddToCart}
          type="button"
          disabled={isUnavailable}
          aria-label={
            language === 'he'
              ? isInStock
                ? 'הוסף לסל'
                : canPreorder
                  ? 'הזמנה עתידית'
                  : 'כרגע המוצר לא זמין'
              : isInStock
                ? 'Add to Cart'
                : canPreorder
                  ? 'Future Order'
                  : 'Currently Unavailable'
          }
        >
          {language === 'he'
            ? isInStock
              ? 'הוסף לסל'
              : canPreorder
                ? 'הזמנה עתידית'
                : 'כרגע המוצר לא זמין'
            : isInStock
              ? 'Add to Cart'
              : canPreorder
                ? 'Future Order'
                : 'Currently Unavailable'}
        </button>
      </div>
    );
  };

  return (
    <div className="catalog-container" id="products">
      <h2 className="section-title">
        {language === 'he' ? 'הקטלוג המלא' : 'Full Catalog'}
      </h2>

      {/* Mezuzahs Section */}
      {allMezuzahs.length > 0 && (
        <div className="category-section" id="mezuzahs">
          <h3 className="category-header">
            {language === 'he' ? 'מזוזות' : 'Mezuzahs'}
          </h3>
          <div className="product-row">
            {allMezuzahs.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Amulets Section */}
      {allAmulets.length > 0 && (
        <div className="category-section" id="amulets">
          <h3 className="category-header">
            {language === 'he' ? 'קמיעות' : 'Amulets'}
          </h3>
          <div className="product-row">
            {allAmulets.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Other Products Section */}
      {otherProducts.length > 0 && (
        <div className="category-section">
          <h3 className="category-header">
            {language === 'he' ? 'כל המוצרים' : 'All Collection'}
          </h3>
          <div className="product-row">
            {otherProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(ProductCatalog);
