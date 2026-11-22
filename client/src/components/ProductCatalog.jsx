import React, { useMemo } from 'react';
import emblem from '../assets/emblem.svg';
import { formatStorePrice } from '../utils/price';

const CHIPS = [
  { id: 'all', he: 'הכל', en: 'All' },
  { id: 'mezuzah', he: 'מזוזות', en: 'Mezuzahs' },
  { id: 'amulet', he: 'קמיעות', en: 'Amulets' },
  { id: 'seal', he: 'חותמות', en: 'Seals' },
];

const GROUP_LABEL = {
  mezuzah: { he: 'מזוזה', en: 'Mezuzah' },
  amulet: { he: 'קמיע', en: 'Amulet' },
  seal: { he: 'חותם', en: 'Seal' },
};

function productKey(product) {
  return product._id || product.id || `${product.name || product.nameHe || product.nameEn}_${product.price}`;
}

const ProductCatalog = ({ products, language, addToCart, filter, onFilterChange }) => {
  const he = language === 'he';

  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter((product) => {
      const id = productKey(product);
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [products]);

  const shown = useMemo(() => {
    if (filter === 'all') return uniqueProducts;
    if (filter === 'amulet-seal') {
      return uniqueProducts.filter((product) => product.catalogGroup === 'amulet' || product.catalogGroup === 'seal');
    }
    return uniqueProducts.filter((product) => product.catalogGroup === filter);
  }, [uniqueProducts, filter]);

  const chipPressed = (id) => {
    if (filter === 'amulet-seal') return id === 'amulet' || id === 'seal';
    return filter === id;
  };

  return (
    <section className="catalog" id="products">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">THE COLLECTION</p>
          <h2>{he ? 'הקטלוג' : 'The Collection'}</h2>
        </div>
        <div className="catalog-chips" role="group" aria-label={he ? 'סינון לפי סוג' : 'Filter by type'}>
          {CHIPS.map((chip) => (
            <button
              key={chip.id}
              type="button"
              className={`chip ${chipPressed(chip.id) ? 'chip-selected' : ''}`}
              aria-pressed={chipPressed(chip.id)}
              onClick={() => onFilterChange(chip.id)}
            >
              {he ? chip.he : chip.en}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {shown.map((product) => (
          <ProductCard key={productKey(product)} product={product} language={language} addToCart={addToCart} />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product, language, addToCart }) => {
  const he = language === 'he';
  const imageSrc = product.image || product.image_url || null;
  const stockKnown = Number.isFinite(Number(product.stock));
  const stock = stockKnown ? Number(product.stock) : Infinity;
  const allowPreorder = !!product.allow_preorder;
  const isLowStock = stock > 0 && stock <= 5;
  const stockBadge = !stockKnown
    ? null
    : stock > 5
      ? {
          className: 'stock-badge stock-available',
          text: he ? 'במלאי' : 'Available',
        }
      : isLowStock
        ? {
            className: 'stock-badge stock-low',
            text: he ? `נשארו רק ${stock} יחידות במלאי!` : `Only ${stock} items left in stock!`,
          }
        : allowPreorder
          ? {
              className: 'stock-badge stock-preorder',
              text: he ? 'הזמנה מוקדמת - ייצור בעבודת יד' : 'Pre-order - Handcrafted on demand',
            }
          : {
              className: 'stock-badge stock-out',
              text: he
                ? 'אזל זמנית מהמלאי - ניתן לפנות בוואטסאפ לבירור'
                : 'Temporarily Out of Stock - Contact on WhatsApp for availability',
            };

  const isInStock = stock > 0;
  const canPreorder = !isInStock && allowPreorder;
  const isUnavailable = !isInStock && !allowPreorder;
  const group = GROUP_LABEL[product.catalogGroup];

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
  };

  return (
    <article className="product-card">
      <div className="product-media">
        {imageSrc ? (
          <img src={imageSrc} alt={product.name || ''} />
        ) : (
          <img className="product-emblem" src={emblem} alt="" />
        )}
      </div>
      <div className="product-body">
        {group && <p className="product-kicker">{he ? group.he : group.en}</p>}
        <h3 className="product-name">{product.name}</h3>
        {product.description ? <p className="product-description">{product.description}</p> : null}
        <div className="product-meta">
          <p className="product-price">{formatStorePrice(product.price, language)}</p>
          {stockBadge && (
            <p className={stockBadge.className} role="status">{stockBadge.text}</p>
          )}
        </div>
        <button
          className="pill pill-outline product-add"
          onClick={isUnavailable ? undefined : handleAddToCart}
          type="button"
          disabled={isUnavailable}
          aria-label={
            he
              ? isInStock
                ? 'הוספה לסל'
                : canPreorder
                  ? 'הזמנה עתידית'
                  : 'כרגע המוצר לא זמין'
              : isInStock
                ? 'Add to cart'
                : canPreorder
                  ? 'Future Order'
                  : 'Currently Unavailable'
          }
        >
          {he
            ? isInStock
              ? 'הוספה לסל'
              : canPreorder
                ? 'הזמנה עתידית'
                : 'כרגע המוצר לא זמין'
            : isInStock
              ? 'Add to cart'
              : canPreorder
                ? 'Future Order'
                : 'Currently Unavailable'}
        </button>
      </div>
    </article>
  );
};

export default React.memo(ProductCatalog);
