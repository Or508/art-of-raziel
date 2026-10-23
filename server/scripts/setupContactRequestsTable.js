// server/scripts/setupContactRequestsTable.js
//
// Simple one-time setup script to create the `contact_requests` table
// using the existing MySQL connection pool configuration.

const db = require('../config/db');

const createTableSQL = `
  CREATE TABLE IF NOT EXISTS contact_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    meeting_type VARCHAR(100),
    channel VARCHAR(50),
    notes TEXT,
    meeting_date DATE,
    meeting_time VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

async function setupContactRequestsTable() {
  try {
    console.log('🔧 Creating contact_requests table if it does not exist...');
    await db.execute(createTableSQL);
    console.log('✅ contact_requests table is ready.');
  } catch (error) {
    console.error('❌ Error creating contact_requests table:', error);
  } finally {
    // End pool so the script can exit cleanly
    db.end && db.end();
    process.exit(0);
  }
}

setupContactRequestsTable();

