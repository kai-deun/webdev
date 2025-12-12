const sql = require('mysql2/promise');
require('dotenv').config();

const pool = sql.createPool(
    {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
);

module.exports = pool;