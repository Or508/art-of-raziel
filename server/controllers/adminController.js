const db = require('../config/db');

// GET /api/admin/customers
// Returns a list of unique customers (registered users + guest buyers if available)
exports.getCustomers = async (req, res) => {
  try {
    // 1) Registered users
    const [registeredUsers] = await db.query(`
      SELECT 
        id,
        CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) AS name,
        email,
        phone,
        NULL AS city,
        NULL AS country,
        created_at AS joinDate
      FROM users
      WHERE is_active = TRUE
    `);

    // 2) Guest buyers from orders table, if it exists
    let guestCustomers = [];
    try {
      const [guestRows] = await db.query(`
        SELECT 
          NULL AS id,
          COALESCE(customer_name, '') AS name,
          customer_email AS email,
          customer_phone AS phone,
          shipping_city AS city,
          shipping_country AS country,
          created_at AS joinDate
        FROM orders
        GROUP BY customer_email, customer_name, customer_phone, shipping_city, shipping_country, created_at
      `);
      guestCustomers = guestRows || [];
    } catch (ordersError) {
      // If orders table does not exist or query fails, log and continue with registered only
      console.warn('Orders table not available for guest customers:', ordersError.message);
    }

    // Combine and deduplicate by email
    const byEmail = new Map();

    const addCustomer = (c, source) => {
      if (!c.email) return;
      const key = c.email.toLowerCase();
      if (!byEmail.has(key)) {
        byEmail.set(key, {
          id: c.id || null,
          name: c.name && c.name.trim().length > 0 ? c.name.trim() : c.email,
          email: c.email,
          phone: c.phone || null,
          city: c.city || null,
          country: c.country || null,
          joinDate: c.joinDate,
          source,
        });
      }
    };

    registeredUsers.forEach(u => addCustomer(u, 'registered'));
    guestCustomers.forEach(g => addCustomer(g, 'guest'));

    const customers = Array.from(byEmail.values()).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: [c.city, c.country].filter(Boolean).join(', ') || null,
      joinDate: c.joinDate,
    }));

    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
    });
  }
};

// GET /api/admin/meetings
// Fetch upcoming/internal meetings from contact_requests
exports.getMeetings = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        full_name,
        phone,
        email,
        meeting_type,
        meeting_date,
        meeting_time,
        channel,
        status,
        notes,
        created_at
      FROM contact_requests
      WHERE meeting_date IS NOT NULL
      ORDER BY meeting_date ASC, meeting_time ASC
    `);

    return res.status(200).json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch meetings',
    });
  }
};

