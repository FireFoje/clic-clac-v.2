const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db/pool');
const adminReviewsRoutes = require('./routes/adminReviewsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const DEFAULT_REVIEWS_LIMIT = 10;
const MAX_REVIEWS_LIMIT = 10;

app.use(cors());
app.use(express.json());

const frontendDir = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendDir));
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'admin', 'index.html'));
});
app.get('/reviews', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'reviews', 'index.html'));
});
app.get('/photos', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'photos', 'index.html'));
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL,
      text TEXT,
      rating INTEGER,
      review_text TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Backward-compatible migration:
  // - keep old review_text data
  // - move it to the required text column
  // - ensure rating/text are present for admin endpoints
  await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS text TEXT`);
  await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER`);
  await pool.query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT`);

  await pool.query(`UPDATE reviews SET text = COALESCE(text, review_text) WHERE text IS NULL`);
  await pool.query(`UPDATE reviews SET rating = COALESCE(rating, 5) WHERE rating IS NULL`);

  await pool.query(`ALTER TABLE reviews ALTER COLUMN text SET NOT NULL`);
  await pool.query(`ALTER TABLE reviews ALTER COLUMN rating SET NOT NULL`);
  await pool.query(`ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_rating_range`);
  await pool.query(`ALTER TABLE reviews ADD CONSTRAINT reviews_rating_range CHECK (rating BETWEEN 1 AND 5)`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS photos (
      id SERIAL PRIMARY KEY,
      url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

app.get('/api/reviews', async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const requestedLimit = parsePositiveInt(req.query.limit, DEFAULT_REVIEWS_LIMIT);
    const limit = Math.min(requestedLimit, MAX_REVIEWS_LIMIT);
    const offset = (page - 1) * limit;

    const [rowsResult, countResult] = await Promise.all([
      pool.query(
        // Keep both text and review_text in response for frontend compatibility.
        'SELECT id, username, text, text AS review_text, rating, created_at FROM reviews ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      pool.query('SELECT COUNT(*)::int AS total FROM reviews')
    ]);

    res.json({
      items: rowsResult.rows,
      page,
      limit,
      total: countResult.rows[0]?.total ?? 0
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/reviews.json', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, text, text AS review_text, rating, created_at FROM reviews ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.get('/api/photos', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, url, created_at FROM photos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

async function createReview(req, res) {
  try {
    const rawUsername =
      typeof req.body.name === 'string'
        ? req.body.name.trim()
        : typeof req.body.username === 'string'
          ? req.body.username.trim()
          : '';
    const rawTextInput =
      typeof req.body.content === 'string'
        ? req.body.content.trim()
        : typeof req.body.text === 'string'
          ? req.body.text.trim()
        : typeof req.body.review_text === 'string'
          ? req.body.review_text.trim()
          : '';
    const rawRating = Number.parseInt(req.body.rating, 10);
    const rating = Number.isNaN(rawRating) ? 5 : rawRating;

    if (!rawUsername || !rawTextInput) {
      return res.status(400).json({ error: 'username and text are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const username = rawUsername.slice(0, 50);
    const text = rawTextInput.slice(0, 2000);

    const result = await pool.query(
      'INSERT INTO reviews (username, text, review_text, rating) VALUES ($1, $2, $3, $4) RETURNING id, username, text, text AS review_text, rating, created_at',
      [username, text, text, rating]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to add review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
}

app.post('/api/reviews', createReview);
app.post('/reviews', createReview);

app.use('/admin', adminReviewsRoutes);

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

