const sql = require('mysql2/promise');
require('dotenv').config();

const pool = sql.createPool(
    {
        host: process.env.HOST,
        user: process.env.USER,
        password: process.env.PASS,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
);

module.exports = pool;