/**
 * @fileoverview Mock order data for testing the International Order System
 * @description Sample orders from different countries (USA, Israel, France)
 */

/**
 * Generate a mock order with realistic data
 * @param {Object} config - Order configuration
 * @returns {Object} Order object
 */
const createMockOrder = (config) => ({
  id: config.id,
  customer: {
    fullName: config.customer.fullName,
    email: config.customer.email,
    phone: {
      countryCode: config.customer.phone.countryCode,
      number: config.customer.phone.number,
    },
  },
  shippingAddress: {
    streetAddress: config.shippingAddress.streetAddress,
    city: config.shippingAddress.city,
    stateOrProvince: config.shippingAddress.stateOrProvince,
    zipCode: config.shippingAddress.zipCode,
    country: config.shippingAddress.country,
  },
  items: config.items,
  totalAmount: config.totalAmount,
  currency: config.currency,
  status: config.status,
  paymentId: config.paymentId,
  createdAt: config.createdAt,
  trackingNumber: config.trackingNumber || null,
  notes: config.notes || null,
});

/**
 * Mock Orders - 5 realistic sample orders from different countries
 */
export const mockOrders = [
  // Order 1: USA - Large Mezuzah (Pending)
  createMockOrder({
    id: 'ORD-2024-001',
    customer: {
      fullName: 'Sarah Cohen',
      email: 'sarah.cohen@example.com',
      phone: {
        countryCode: '+1',
        number: '(212) 555-0147',
      },
    },
    shippingAddress: {
      streetAddress: '1234 Park Avenue, Apt 5B',
      city: 'New York',
      stateOrProvince: 'NY',
      zipCode: '10029',
      country: 'US',
    },
    items: [
      {
        productId: 'MEZ-LRG-001',
        title: 'Large Mezuzah',
        price: 250.00,
        quantity: 1,
        total: 250.00,
      },
    ],
    totalAmount: 250.00,
    currency: 'USD',
    status: 'Pending',
    paymentId: 'PAY-STRIPE-abc123xyz',
    createdAt: new Date('2024-01-15T10:30:00Z').toISOString(),
    notes: 'Please include blessing certificate',
  }),

  // Order 2: Israel - Seal of Solomon (Shipped)
  createMockOrder({
    id: 'ORD-2024-002',
    customer: {
      fullName: 'דוד לוי',
      email: 'david.levi@example.co.il',
      phone: {
        countryCode: '+972',
        number: '50-123-4567',
      },
    },
    shippingAddress: {
      streetAddress: 'רחוב הרצל 45',
      city: 'תל אביב',
      stateOrProvince: null,
      zipCode: '61000',
      country: 'IL',
    },
    items: [
      {
        productId: 'AMU-SOL-001',
        title: 'Seal of Solomon',
        price: 600.00,
        quantity: 1,
        total: 600.00,
      },
    ],
    totalAmount: 600.00,
    currency: 'ILS',
    status: 'Shipped',
    paymentId: 'PAY-IL-xyz789abc',
    createdAt: new Date('2024-01-10T14:20:00Z').toISOString(),
    trackingNumber: 'IL-POST-TRACK-123456789',
    notes: 'Delivery to building entrance',
  }),

  // Order 3: France - Multiple Amulets (Processing)
  createMockOrder({
    id: 'ORD-2024-003',
    customer: {
      fullName: 'Marie Dubois',
      email: 'marie.dubois@example.fr',
      phone: {
        countryCode: '+33',
        number: '6 12 34 56 78',
      },
    },
    shippingAddress: {
      streetAddress: '15 Rue de la Paix',
      city: 'Paris',
      stateOrProvince: 'Île-de-France',
      zipCode: '75002',
      country: 'FR',
    },
    items: [
      {
        productId: 'AMU-SUC-001',
        title: 'Success Amulet',
        price: 500.00,
        quantity: 1,
        total: 500.00,
      },
      {
        productId: 'AMU-LOV-001',
        title: 'Love Amulet',
        price: 450.00,
        quantity: 1,
        total: 450.00,
      },
      {
        productId: 'MEZ-MED-001',
        title: 'Medium Mezuzah',
        price: 190.00,
        quantity: 2,
        total: 380.00,
      },
    ],
    totalAmount: 1330.00,
    currency: 'EUR',
    status: 'Processing',
    paymentId: 'PAY-EU-456def789',
    createdAt: new Date('2024-01-18T09:15:00Z').toISOString(),
    notes: 'Gift wrapping requested',
  }),

  // Order 4: USA - Protection Amulet (Delivered)
  createMockOrder({
    id: 'ORD-2024-004',
    customer: {
      fullName: 'Michael Rosen',
      email: 'm.rosen@example.com',
      phone: {
        countryCode: '+1',
        number: '(310) 555-8921',
      },
    },
    shippingAddress: {
      streetAddress: '789 Sunset Boulevard',
      city: 'Los Angeles',
      stateOrProvince: 'CA',
      zipCode: '90028',
      country: 'US',
    },
    items: [
      {
        productId: 'AMU-PRO-001',
        title: 'Protection Amulet (Eye of Evil)',
        price: 500.00,
        quantity: 1,
        total: 500.00,
      },
    ],
    totalAmount: 500.00,
    currency: 'USD',
    status: 'Delivered',
    paymentId: 'PAY-STRIPE-def456ghi',
    createdAt: new Date('2024-01-05T16:45:00Z').toISOString(),
    trackingNumber: 'USPS-9400111899223197428490',
    notes: null,
  }),

  // Order 5: Israel - Multiple Items (Paid)
  createMockOrder({
    id: 'ORD-2024-005',
    customer: {
      fullName: 'רחל אברהם',
      email: 'rachel.avraham@example.co.il',
      phone: {
        countryCode: '+972',
        number: '52-987-6543',
      },
    },
    shippingAddress: {
      streetAddress: 'שדרות בן גוריון 12, דירה 8',
      city: 'ירושלים',
      stateOrProvince: null,
      zipCode: '91000',
      country: 'IL',
    },
    items: [
      {
        productId: 'AMU-HEA-001',
        title: 'Health Amulet',
        price: 500.00,
        quantity: 1,
        total: 500.00,
      },
      {
        productId: 'AMU-PRO-002',
        title: 'Prosperity Amulet',
        price: 500.00,
        quantity: 1,
        total: 500.00,
      },
      {
        productId: 'MEZ-LRG-002',
        title: 'Large Mezuzah',
        price: 250.00,
        quantity: 1,
        total: 250.00,
      },
    ],
    totalAmount: 1250.00,
    currency: 'ILS',
    status: 'Paid',
    paymentId: 'PAY-IL-789ghi012',
    createdAt: new Date('2024-01-20T11:00:00Z').toISOString(),
    notes: 'Rush delivery requested',
  }),
];

/**
 * Get orders by status
 * @param {string} status - Order status to filter by
 * @returns {Array} Filtered orders
 */
export const getOrdersByStatus = (status) => {
  return mockOrders.filter(order => order.status === status);
};

/**
 * Get orders by country
 * @param {string} countryCode - Country code to filter by
 * @returns {Array} Filtered orders
 */
export const getOrdersByCountry = (countryCode) => {
  return mockOrders.filter(order => order.shippingAddress.country === countryCode);
};

/**
 * Get order by ID
 * @param {string} orderId - Order ID to find
 * @returns {Object|null} Order object or null if not found
 */
export const getOrderById = (orderId) => {
  return mockOrders.find(order => order.id === orderId) || null;
};

/**
 * Get total revenue from all orders
 * @param {string} [currency] - Optional currency filter
 * @returns {number} Total revenue
 */
export const getTotalRevenue = (currency = null) => {
  const orders = currency 
    ? mockOrders.filter(order => order.currency === currency)
    : mockOrders;
  return orders.reduce((sum, order) => sum + order.totalAmount, 0);
};

export default mockOrders;
