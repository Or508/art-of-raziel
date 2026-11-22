const mysql = require('mysql2');
const dbOptions = require('./dbOptions');

const pool = mysql.createPool({
    ...dbOptions,
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
