// server/scripts/setupContactRequestsAddBookingColumns.js
//
// One-time setup script:
// Adds booking columns to `contact_requests` table.

const db = require('../config/db');

async function setup() {
  try {
    console.log('🔧 Adding meeting_date and meeting_time columns to contact_requests...');

    // Some MySQL versions don't support IF NOT EXISTS for columns.
    // We run two separate ALTER statements to keep error handling simple.
    try {
      await db.execute(`ALTER TABLE contact_requests ADD COLUMN meeting_date DATE`);
    } catch (err) {
      if (err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060)) {
        console.warn('ℹ️ meeting_date already exists, skipping.');
      } else {
        throw err;
      }
    }

    try {
      await db.execute(`ALTER TABLE contact_requests ADD COLUMN meeting_time VARCHAR(50)`);
    } catch (err) {
      if (err && (err.code === 'ER_DUP_FIELDNAME' || err.errno === 1060)) {
        console.warn('ℹ️ meeting_time already exists, skipping.');
      } else {
        throw err;
      }
    }

    console.log('✅ Booking columns are ready on contact_requests table.');
  } catch (error) {
    console.error('❌ Error adding booking columns:', error);
  } finally {
    db.end && db.end();
    process.exit(0);
  }
}

setup();

