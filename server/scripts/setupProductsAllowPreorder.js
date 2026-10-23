// server/scripts/setupProductsAllowPreorder.js
//
// One-time setup script to add the `allow_preorder` column to the products table.

const db = require('../config/db');

async function setupProductsAllowPreorder() {
  try {
    console.log('🔧 Adding allow_preorder column to products (if it does not exist)...');
    await db.execute(`
      ALTER TABLE products
      ADD COLUMN allow_preorder TINYINT(1) NOT NULL DEFAULT 0;
    `);
    console.log('✅ allow_preorder column created on products table.');
  } catch (error) {
    // If the column already exists, ignore the duplicate-field error
    if (error && (error.code === 'ER_DUP_FIELDNAME' || error.errno === 1060)) {
      console.warn('ℹ️ allow_preorder column already exists, skipping creation.');
    } else {
      console.error('❌ Error adding allow_preorder column:', error);
    }
  } finally {
    db.end && db.end();
    process.exit(0);
  }
}

setupProductsAllowPreorder();

