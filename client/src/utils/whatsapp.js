const DEFAULT_WHATSAPP_NUMBER = '16464571927';

export function getWhatsAppNumber() {
  const configured = import.meta.env?.VITE_WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  const digits = String(configured).replace(/\D/g, '');
  return digits || DEFAULT_WHATSAPP_NUMBER;
}

function formatMoney(amount, currency) {
  const value = Number(amount);
  const shown = Number.isFinite(value) ? value.toFixed(2) : '0.00';
  if (currency === 'ILS') return `${shown} ₪`;
  if (currency === 'EUR') return `€${shown}`;
  return `$${shown}`;
}

function formatPhone(phone) {
  if (!phone) return '';
  if (typeof phone === 'string') return phone;
  return `${phone.countryCode || ''}${phone.number || ''}`.trim();
}

function formatAddress(address = {}) {
  const cityLine = [address.city, address.stateOrProvince].filter(Boolean).join(', ');
  return [address.streetAddress, cityLine, address.zipCode, address.country]
    .filter(Boolean)
    .join('\n');
}

function formatWhen(iso, language) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(language === 'he' ? 'he-IL' : 'en-US');
}

function buildOrderMessage(order, language) {
  const orderNumber = order?.id || order?.order_number || '';
  const currency = order?.currency || 'USD';
  const customer = order?.customer || {};
  const items = Array.isArray(order?.items) ? order.items : [];
  const lines = items.map((item) => {
    const title = item.title || item.name || 'Item';
    const quantity = item.quantity ?? 1;
    const lineTotal = item.total ?? (Number(item.price) || 0) * quantity;
    return `- ${title} × ${quantity} — ${formatMoney(lineTotal, currency)}`;
  });

  if (language === 'he') {
    return [
      `שלום רזיאל, ביצעתי הרגע הזמנה באתר (מספר הזמנה: ${orderNumber}). אשמח להסדיר את התשלום והמשלוח:`,
      '',
      `תאריך: ${formatWhen(order?.createdAt, language)}`,
      `שם: ${customer.fullName || ''}`,
      `טלפון: ${formatPhone(customer.phone)}`,
      'כתובת למשלוח:',
      formatAddress(order?.shippingAddress),
      '',
      'פריטים:',
      lines.join('\n'),
      '',
      `סה"כ: ${formatMoney(order?.totalAmount, currency)}`,
    ].join('\n');
  }

  return [
    `Hello Raziel, I just placed an order on your website (Order #${orderNumber}). I would like to finalize payment and shipping:`,
    '',
    `Date: ${formatWhen(order?.createdAt, language)}`,
    `Name: ${customer.fullName || ''}`,
    `Phone: ${formatPhone(customer.phone)}`,
    'Shipping address:',
    formatAddress(order?.shippingAddress),
    '',
    'Items:',
    lines.join('\n'),
    '',
    `Total: ${formatMoney(order?.totalAmount, currency)}`,
  ].join('\n');
}

export function buildOrderWhatsAppUrl(order, language = 'en') {
  const text = buildOrderMessage(order, language);
  return `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(text)}`;
}
