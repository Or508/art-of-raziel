const mysql = require('mysql2');
const path = require('path');
// טעינת קובץ ההגדרות מהתיקייה הראשית
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ שגיאה בחיבור למסד הנתונים:', err.message);
        return;
    }
    console.log('✅ מחובר למסד הנתונים Art of Raziel בהצלחה!');
    connection.release();
});

module.exports = pool.promise();