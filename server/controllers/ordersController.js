const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ORDER_STATUSES = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const CURRENCIES = ['USD', 'ILS', 'EUR'];

function phoneToString(phone) {
  if (!phone) return '';
  if (typeof phone === 'string') return phone.replace(/\s/g, '').slice(0, 32);
  const countryCode = phone.countryCode || '';
  const number = phone.number || '';
  return `${countryCode}${number}`.replace(/\s/g, '').slice(0, 32);
}

function splitPhone(phone) {
  const raw = String(phone || '');
  const match = raw.match(/^(\+\d{1,4})(.*)$/);
  if (!match) {
    return { countryCode: '', number: raw };
  }
  return { countryCode: match[1], number: match[2] };
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function optionalUserId(req) {
  const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];
  if (!token || !process.env.JWT_SECRET) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'user' && decoded.id) return decoded.id;
  } catch (error) {
    return null;
  }
  return null;
}

function toClientOrder(orderRow, itemRows) {
  const phone = splitPhone(orderRow.customer_phone);
  return {
    id: orderRow.order_number,
    databaseId: orderRow.id,
    customer: {
      fullName: orderRow.customer_name,
      email: orderRow.customer_email,
      phone,
    },
    shippingAddress: {
      shippingMethod: orderRow.shipping_method,
      streetAddress: orderRow.shipping_street,
      city: orderRow.shipping_city,
      stateOrProvince: orderRow.shipping_state,
      zipCode: orderRow.shipping_zip,
      country: orderRow.shipping_country,
    },
    items: itemRows.map((item) => ({
      productId: item.product_id,
      title: item.title,
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
      total: Number(item.line_total),
    })),
    totalAmount: Number(orderRow.total_amount),
    currency: orderRow.currency,
    status: orderRow.status,
    paymentId: orderRow.payment_id,
    createdAt: new Date(orderRow.created_at).toISOString(),
    trackingNumber: orderRow.tracking_number,
    notes: orderRow.notes,
  };
}

function readOrderInput(body) {
  const customer = body.customer || {};
  const shipping = body.shippingAddress || body.shipping || {};
  const name = customer.fullName || customer.name || body.name || '';
  const email = customer.email || body.email || '';
  const phone = phoneToString(customer.phone || body.phone);
  const country = String(shipping.country || body.country || '').trim().toUpperCase();
  const currency = CURRENCIES.includes(body.currency) ? body.currency : 'USD';
  const status = ORDER_STATUSES.includes(body.status) ? body.status : 'Pending';

  return {
    name: String(name).trim(),
    email: String(email).trim(),
    phone,
    shippingMethod: shipping.shippingMethod || body.shippingMethod || '',
    street: String(shipping.streetAddress || shipping.street || body.streetAddress || '').trim(),
    city: String(shipping.city || body.city || '').trim(),
    state: shipping.stateOrProvince || shipping.state || body.stateOrProvince || null,
    zip: String(shipping.zipCode || shipping.zip || body.zipCode || '').trim(),
    country,
    currency,
    status,
    paymentId: body.paymentId || body.payment_id || null,
    notes: body.notes || null,
    items: Array.isArray(body.items) ? body.items : null,
  };
}

exports.createOrder = async (req, res) => {
  const input = readOrderInput(req.body || {});

  if (!input.name || !input.email || !input.phone) {
    return res.status(400).json({
      success: false,
      message: 'Customer name, email, and phone are required',
    });
  }

  if (!input.shippingMethod || !input.street || !input.city || !input.zip || !input.country) {
    return res.status(400).json({
      success: false,
      message: 'A complete shipping address is required',
    });
  }

  if (!['delivery', 'pickup'].includes(input.shippingMethod)) {
    return res.status(400).json({
      success: false,
      message: 'Shipping method must be delivery or pickup',
    });
  }

  if (!/^[A-Z]{2}$/.test(input.country)) {
    return res.status(400).json({
      success: false,
      message: 'Country must be a 2-letter code',
    });
  }

  if (!input.items || input.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one cart item is required',
    });
  }

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const lineItems = [];

    for (const item of input.items) {
      const productId = Number(item.product_id ?? item.productId);
      const quantity = Number(item.quantity);

      if (!Number.isInteger(productId) || productId <= 0 || !Number.isInteger(quantity) || quantity < 1) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each item needs a valid product_id and quantity',
        });
      }

      const [products] = await connection.query(
        `SELECT id, title, price, price_usd, stock, allow_preorder, is_active
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [productId]
      );

      const product = products[0];
      if (!product || !product.is_active) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Product not found',
        });
      }

      const stock = Number(product.stock);
      const allowPreorder = Number(product.allow_preorder) === 1;

      if (stock < quantity && !allowPreorder) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: 'Insufficient stock',
        });
      }

      if (stock >= quantity) {
        const [updated] = await connection.query(
          'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
          [quantity, productId, quantity]
        );
        if (updated.affectedRows === 0) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            message: 'Insufficient stock',
          });
        }
      } else {
        // Catalog preorder: keep the order, and do not take stock below zero.
        await connection.query('UPDATE products SET stock = 0 WHERE id = ?', [productId]);
      }

      const requestedPrice = toNumber(item.price ?? item.unit_price);
      const catalogPrice = toNumber(product.price_usd ?? product.price) ?? 0;
      const unitPrice = requestedPrice !== null && requestedPrice >= 0 ? requestedPrice : catalogPrice;

      lineItems.push({
        productId,
        title: String(item.title || product.title || 'Product').slice(0, 255),
        unitPrice: roundMoney(unitPrice),
        quantity,
        lineTotal: roundMoney(unitPrice * quantity),
      });
    }

    const computedTotal = roundMoney(lineItems.reduce((sum, item) => sum + item.lineTotal, 0));
    const requestedTotal = toNumber((req.body || {}).totalAmount);
    const totalAmount = requestedTotal !== null && requestedTotal >= 0
      ? roundMoney(requestedTotal)
      : computedTotal;
    const orderNumber = `ORD-${Date.now()}`;
    const userId = optionalUserId(req);

    const [orderResult] = await connection.query(
      `INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, customer_phone,
        shipping_method, shipping_street, shipping_city, shipping_state, shipping_zip, shipping_country,
        total_amount, currency, status, payment_id, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        input.name,
        input.email,
        input.phone,
        input.shippingMethod,
        input.street,
        input.city,
        input.state,
        input.zip,
        input.country,
        totalAmount,
        input.currency,
        input.status,
        input.paymentId,
        input.notes,
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of lineItems) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, title, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.title, item.unitPrice, item.quantity, item.lineTotal]
      );
    }

    const [orderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [savedItems] = await connection.query(
      'SELECT product_id, title, unit_price, quantity, line_total FROM order_items WHERE order_id = ? ORDER BY id ASC',
      [orderId]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: orderId,
        order: toClientOrder(orderRows[0], savedItems),
      },
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Order rollback failed:', rollbackError);
      }
    }
    console.error('Create order error:', error);
    if (res.headersSent) return;
    return res.status(500).json({
      success: false,
      message: 'Failed to create order',
    });
  } finally {
    if (connection) connection.release();
  }
};

const STATUS_BY_INPUT = {
  pending: 'Pending',
  Pending: 'Pending',
  paid: 'Paid',
  Paid: 'Paid',
  processing: 'Processing',
  Processing: 'Processing',
  shipped: 'Shipped',
  Shipped: 'Shipped',
  completed: 'Delivered',
  delivered: 'Delivered',
  Delivered: 'Delivered',
  cancelled: 'Cancelled',
  canceled: 'Cancelled',
  Cancelled: 'Cancelled',
};

exports.updateOrderStatus = async (req, res) => {
  const rawStatus = req.body?.status;
  const status = STATUS_BY_INPUT[rawStatus];

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status',
    });
  }

  const rawId = String(req.params.id || '');
  const isNumericId = /^\d+$/.test(rawId);

  try {
    const [result] = await db.query(
      isNumericId
        ? 'UPDATE orders SET status = ? WHERE id = ?'
        : 'UPDATE orders SET status = ? WHERE order_number = ?',
      [status, isNumericId ? Number(rawId) : rawId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: { id: rawId, status },
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order status',
    });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
        o.shipping_method, o.shipping_street, o.shipping_city, o.shipping_state,
        o.shipping_zip, o.shipping_country, o.total_amount, o.currency, o.status,
        o.payment_id, o.tracking_number, o.notes, o.created_at,
        oi.product_id, oi.title AS item_title, oi.unit_price, oi.quantity, oi.line_total
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ORDER BY o.created_at DESC, oi.id ASC`
    );

    const byId = new Map();

    for (const row of rows) {
      if (!byId.has(row.id)) {
        byId.set(row.id, {
          order: row,
          items: [],
        });
      }
      if (row.product_id != null) {
        byId.get(row.id).items.push({
          product_id: row.product_id,
          title: row.item_title,
          unit_price: row.unit_price,
          quantity: row.quantity,
          line_total: row.line_total,
        });
      }
    }

    const orders = Array.from(byId.values()).map(({ order, items }) => toClientOrder(order, items));

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};
