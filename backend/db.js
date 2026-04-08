const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Simple helper for raw queries
module.exports = {
  query: (text, params) => pool.query(text, params),
};