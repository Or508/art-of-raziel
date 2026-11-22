const path = require('path');
// Local development reads the repo-root .env. On a host, variables come from the environment.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = process.env;

// DB_* names win. Railway's MySQL service exposes MYSQL* names, so linking those
// variables to the web service is enough without renaming them.
const options = {
    host: env.DB_HOST || env.MYSQLHOST,
    port: Number(env.DB_PORT || env.MYSQLPORT) || 3306,
    user: env.DB_USER || env.MYSQLUSER,
    password: env.DB_PASS || env.MYSQLPASSWORD,
    database: env.DB_NAME || env.MYSQLDATABASE,
    // Hosted MySQL reached over a public address usually requires TLS.
    ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: env.DB_SSL_INSECURE !== 'true' } : undefined,
    charset: 'utf8mb4',
};

module.exports = options;
