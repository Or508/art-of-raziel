// server/scripts/setupContactRequestsMeetingTimeVarchar10.js
//
// Ensures `meeting_time` column is VARCHAR(10) (e.g. "09:00").

const db = require('../config/db');

async function setup() {
  try {
    console.log('🔧 Ensuring meeting_time is VARCHAR(10)...');
    await db.execute(`
      ALTER TABLE contact_requests
      MODIFY meeting_time VARCHAR(10)
    `);
    console.log('✅ meeting_time column type is ready.');
  } catch (error) {
    console.error('❌ Error modifying meeting_time type:', error);
  } finally {
    db.end && db.end();
    process.exit(0);
  }
}

setup();

