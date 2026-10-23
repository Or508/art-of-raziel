// How many units a customer may put in the cart.
// Pre-order items with nothing on hand stay orderable.
export function availableStock(product) {
  const stock = Number(product?.stock);
  if (!Number.isFinite(stock)) return null;
  if (stock <= 0 && product?.allow_preorder) return null;
  return Math.max(0, Math.floor(stock));
}

export function stockLimitMessage(stock, language) {
  if (language === 'he') {
    return `אין אפשרות להזמין מעבר לכמות הקיימת במלאי (${stock})`;
  }
  return `You cannot order more than the available stock (${stock}).`;
}
