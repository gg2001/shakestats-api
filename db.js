require('dotenv').config();
const Pool = require("pg").Pool;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: 5432,
  database: "shakestats"
});

module.exports = pool;
