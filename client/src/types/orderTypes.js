/**
 * @fileoverview Type definitions for the International Order System
 * @description Global e-commerce order data structures with international shipping support
 */

/**
 * @typedef {Object} PhoneNumber
 * @property {string} countryCode - ISO country code (e.g., "+1", "+972", "+33")
 * @property {string} number - Phone number without country code
 */

/**
 * @typedef {Object} ShippingAddress
 * @property {string} streetAddress - Street address and house number
 * @property {string} city - City name
 * @property {string} [stateOrProvince] - State/Province (optional, for countries that use it)
 * @property {string} zipCode - Postal/ZIP code (alphanumeric for global formats)
 * @property {string} country - ISO country code (e.g., "US", "IL", "FR")
 */

/**
 * @typedef {Object} OrderItem
 * @property {string|number} productId - Unique product identifier
 * @property {string} title - Product name/title
 * @property {number} price - Unit price in the order currency
 * @property {number} quantity - Quantity ordered
 * @property {number} total - Total price for this item (price * quantity)
 */

/**
 * @typedef {('Pending'|'Paid'|'Processing'|'Shipped'|'Delivered'|'Cancelled')} OrderStatus
 */

/**
 * @typedef {Object} Order
 * @property {string} id - Unique order identifier
 * @property {Object} customer - Customer information
 * @property {string} customer.fullName - Customer's full name (required)
 * @property {string} customer.email - Customer's email address (validated)
 * @property {PhoneNumber} customer.phone - Customer's phone number with country code
 * @property {ShippingAddress} shippingAddress - Global shipping address
 * @property {OrderItem[]} items - Array of ordered items
 * @property {number} totalAmount - Total order amount
 * @property {string} currency - Currency code (default: "USD")
 * @property {OrderStatus} status - Current order status
 * @property {string} paymentId - Payment transaction ID
 * @property {string|Date} createdAt - Order creation timestamp
 * @property {string} [trackingNumber] - Shipping tracking number (optional)
 * @property {string} [notes] - Additional order notes (optional)
 */

/**
 * @typedef {Object} OrderFormData
 * @property {string} fullName - Customer's full name
 * @property {string} email - Customer's email
 * @property {string} phoneCountryCode - Phone country code
 * @property {string} phoneNumber - Phone number
 * @property {string} streetAddress - Shipping street address
 * @property {string} city - Shipping city
 * @property {string} [stateOrProvince] - Shipping state/province
 * @property {string} zipCode - Shipping ZIP/postal code
 * @property {string} country - Shipping country code
 */

/**
 * Helper function to validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Helper function to validate phone number format
 * @param {PhoneNumber} phone - Phone number object to validate
 * @returns {boolean} True if phone is valid
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.countryCode || !phone.number) return false;
  const numberRegex = /^[-0-9\s()]+$/;
  return numberRegex.test(phone.number) && phone.countryCode.startsWith('+');
};

/**
 * Helper function to validate ZIP/postal code (alphanumeric, global format)
 * @param {string} zipCode - ZIP/postal code to validate
 * @returns {boolean} True if ZIP code is valid
 */
export const validateZipCode = (zipCode) => {
  if (!zipCode) return false;
  const zipRegex = /^[A-Z0-9\s-]+$/i;
  return zipRegex.test(zipCode) && zipCode.length >= 3 && zipCode.length <= 10;
};

/**
 * Format phone number for display
 * @param {PhoneNumber} phone - Phone number object
 * @returns {string} Formatted phone number string
 */
export const formatPhoneNumber = (phone) => {
  if (!phone || !phone.countryCode || !phone.number) return '';
  return `${phone.countryCode} ${phone.number}`;
};

/**
 * Get currency symbol for display
 * @param {string} currencyCode - Currency code (USD, ILS, EUR, etc.)
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currencyCode) => {
  const symbols = {
    USD: '$',
    ILS: '₪',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
  };
  return symbols[currencyCode] || currencyCode;
};

/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Export types for JSDoc usage
export default {
  validateEmail,
  validatePhone,
  validateZipCode,
  formatPhoneNumber,
  getCurrencySymbol,
  formatCurrency,
};
