const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:clic03@localhost:5432/review'
});

module.exports = pool;
