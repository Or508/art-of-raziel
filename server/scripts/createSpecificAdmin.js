// Creates or updates one admin from the environment.
// There is no built-in email or password.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Super Admin';
const role = 'super_admin';

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in the root .env file before running this script.');
  process.exit(1);
}

const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function createSpecificAdmin() {
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const [existing] = await db.query(
      'SELECT id FROM admins WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE admins SET password = ?, name = ?, role = ?, is_active = TRUE WHERE email = ?',
        [hashedPassword, name, role, email]
      );
      console.log('Admin password updated.');
    } else {
      await db.query(
        'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, role]
      );
      console.log('Admin created.');
    }

    console.log('Email:', email);
    console.log('Role:', role);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

createSpecificAdmin();
