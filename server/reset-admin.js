// server/reset-admin.js
//
// Emergency admin/user password reset script.
// Resets password for a specific email in the `users` table.

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const TARGET_EMAIL = process.env.ADMIN_RESET_EMAIL;
const NEW_PASSWORD = process.env.ADMIN_RESET_PASSWORD;

if (!TARGET_EMAIL || !NEW_PASSWORD) {
  console.error('Set ADMIN_RESET_EMAIL and ADMIN_RESET_PASSWORD in the root .env file. This script has no default password.');
  process.exit(1);
}

const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function run() {
  try {
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);

    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, TARGET_EMAIL]
    );

    // result is a mysql2 OkPacket
    const affectedRows = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;

    if (affectedRows === 0) {
      console.warn(`No user found (or no change) for email: ${TARGET_EMAIL}`);
      return;
    }

    console.log('Password updated successfully');
  } catch (error) {
    console.error('Password reset failed:', error);
    process.exitCode = 1;
  } finally {
    // Attempt to end pool if supported
    if (typeof db.end === 'function') {
      try {
        await db.end();
      } catch (_) {
        // ignore
      }
    }
  }
}

run();

