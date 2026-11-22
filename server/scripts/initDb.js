// Prepares the database before the server starts. Safe to run on every start:
// - creates missing tables from database/schema.sql (CREATE TABLE IF NOT EXISTS)
// - fills the catalog from database/seed-products.json only when products is empty
// - creates the first admin only when there is no admin and ADMIN_EMAIL / ADMIN_PASSWORD are set
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dbOptions = require('../config/dbOptions');

const schemaPath = path.resolve(__dirname, '../database/schema.sql');
const seedPath = path.resolve(__dirname, '../database/seed-products.json');

async function connectWithRetry(attempts = 6) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await mysql.createConnection({ ...dbOptions, multipleStatements: true });
    } catch (error) {
      if (attempt >= attempts) throw error;
      console.log(`initDb: database not reachable (${error.code || error.message}), retry ${attempt}/${attempts - 1}`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

async function seedProducts(connection) {
  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM products');
  if (count > 0 || !fs.existsSync(seedPath)) return;

  const products = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  for (const product of products) {
    await connection.query(
      `INSERT INTO products
        (category, title, title_en, description, description_en, price, price_usd, stock, allow_preorder, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.category,
        product.title,
        product.title_en || null,
        product.description || null,
        product.description_en || null,
        product.price,
        product.price,
        product.stock ?? 0,
        product.allow_preorder ? 1 : 0,
        product.image_url || null,
      ]
    );
  }
  console.log(`initDb: added ${products.length} catalog products`);
}

async function createFirstAdmin(connection) {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;

  const [[{ count }]] = await connection.query('SELECT COUNT(*) AS count FROM admins');
  if (count > 0) return;

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await connection.query(
    'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
    [ADMIN_EMAIL, hash, ADMIN_NAME || 'Raziel', 'super_admin']
  );
  console.log('initDb: created the first admin');
}

async function main() {
  const connection = await connectWithRetry();
  try {
    await connection.query(fs.readFileSync(schemaPath, 'utf8'));
    await seedProducts(connection);
    await createFirstAdmin(connection);
    console.log('initDb: database ready');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('initDb failed:', error.message);
  process.exit(1);
});
