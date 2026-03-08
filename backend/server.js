const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:clic03@localhost:5432/review'
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      review_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/reviews', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, review_text, created_at FROM reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/reviews', async (req, res) => {
  try {
    const rawUsername = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const rawReview = typeof req.body.review_text === 'string' ? req.body.review_text.trim() : '';

    if (!rawUsername || !rawReview) {
      return res.status(400).json({ error: 'username and review_text are required' });
    }

    const username = rawUsername.slice(0, 50);
    const reviewText = rawReview.slice(0, 2000);

    const result = await pool.query(
      'INSERT INTO reviews (username, review_text) VALUES ($1, $2) RETURNING id, username, review_text, created_at',
      [username, reviewText]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to add review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database init failed:', error);
    process.exit(1);
  });
