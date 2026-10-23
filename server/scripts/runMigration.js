// One-time migration for the live art_of_raziel_db database.
// Adds the catalog columns the storefront and order API read, then creates
// orders and order_items to match server/database/schema.sql.
// user_id is signed INT so it can reference the existing users.id column.

const db = require('../config/db');

async function columnExists(table, column) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS n
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0].n) > 0;
}

async function addColumn(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`skip ${table}.${column} (already exists)`);
    return;
  }
  await db.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  console.log(`added ${table}.${column}`);
}

async function migrate() {
  await addColumn('products', 'stock', 'INT NOT NULL DEFAULT 10');
  await addColumn('products', 'price', 'DECIMAL(10, 2) NOT NULL DEFAULT 0.00');
  await addColumn('products', 'title_en', 'VARCHAR(255) NULL');
  await addColumn('products', 'image_url', 'VARCHAR(500) NULL');

  const [priceResult] = await db.query(
    `UPDATE products
     SET price = price_usd
     WHERE (price IS NULL OR price = 0)
       AND price_usd IS NOT NULL`
  );
  console.log(`copied price_usd into price on ${priceResult.affectedRows} row(s)`);

  const [stockResult] = await db.query(
    `UPDATE products
     SET stock = 10
     WHERE stock IS NULL OR stock = 0`
  );
  console.log(`set stock = 10 on ${stockResult.affectedRows} row(s)`);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_number VARCHAR(40) NOT NULL,
      user_id INT NULL,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_phone VARCHAR(32) NOT NULL,
      shipping_method ENUM('delivery', 'pickup') NOT NULL,
      shipping_street VARCHAR(255) NOT NULL,
      shipping_city VARCHAR(100) NOT NULL,
      shipping_state VARCHAR(100) NULL,
      shipping_zip VARCHAR(20) NOT NULL,
      shipping_country CHAR(2) NOT NULL,
      total_amount DECIMAL(10, 2) NOT NULL,
      currency ENUM('USD', 'ILS', 'EUR') NOT NULL DEFAULT 'USD',
      status ENUM('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
      payment_id VARCHAR(64) NULL,
      tracking_number VARCHAR(64) NULL,
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_orders_order_number (order_number),
      UNIQUE KEY uq_orders_payment_id (payment_id),
      KEY idx_orders_user (user_id),
      KEY idx_orders_customer_email (customer_email),
      KEY idx_orders_status_created (status, created_at),
      CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      CONSTRAINT chk_orders_email CHECK (
        customer_email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\\\.[A-Za-z]{2,}$'
      ),
      CONSTRAINT chk_orders_total CHECK (total_amount >= 0),
      CONSTRAINT chk_orders_country CHECK (shipping_country REGEXP '^[A-Z]{2}$')
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('orders table ready');

  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_id INT UNSIGNED NOT NULL,
      product_id INT UNSIGNED NOT NULL,
      title VARCHAR(255) NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL,
      quantity INT UNSIGNED NOT NULL,
      line_total DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_order_items_order (order_id),
      KEY idx_order_items_product (product_id),
      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      CONSTRAINT chk_order_items_price CHECK (unit_price >= 0),
      CONSTRAINT chk_order_items_qty CHECK (quantity >= 1),
      CONSTRAINT chk_order_items_line_total CHECK (line_total >= 0)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log('order_items table ready');

  const [summary] = await db.query(
    `SELECT COUNT(*) AS products,
            SUM(stock > 0) AS in_stock,
            SUM(price > 0) AS priced
     FROM products`
  );
  console.log(
    `products=${summary[0].products} in_stock=${summary[0].in_stock} priced=${summary[0].priced}`
  );
}

migrate()
  .then(() => db.end())
  .catch(async (error) => {
    console.error('migration failed:', error.code || '', error.message);
    try {
      await db.end();
    } catch (closeError) {
      console.error('pool close failed:', closeError.message);
    }
    process.exit(1);
  });
