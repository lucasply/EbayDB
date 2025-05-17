const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: process.env.DB_PASSWORD,
  database: 'webdb',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
