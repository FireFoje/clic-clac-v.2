const pool = require('../db/pool');

async function getAdminReviews(_req, res) {
  try {
    const result = await pool.query(
      'SELECT id, username, text, rating, created_at FROM reviews ORDER BY created_at DESC'
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch admin reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
}

async function deleteAdminReview(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    // Parameterized query prevents SQL injection on path params.
    await pool.query('DELETE FROM reviews WHERE id = $1', [id]);

    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete admin review:', error);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
}

async function updateAdminReview(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    const rawUsername = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const rawText = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    const rawRating = Number.parseInt(req.body.rating, 10);

    if (!rawUsername || !rawText) {
      return res.status(400).json({ error: 'username and text are required' });
    }

    if (Number.isNaN(rawRating) || rawRating < 1 || rawRating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const username = rawUsername.slice(0, 50);
    const text = rawText.slice(0, 2000);
    const rating = rawRating;

    const result = await pool.query(
      'UPDATE reviews SET username = $1, text = $2, review_text = $2, rating = $3 WHERE id = $4 RETURNING id, username, text, rating, created_at',
      [username, text, rating, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update admin review:', error);
    return res.status(500).json({ error: 'Failed to update review' });
  }
}

module.exports = {
  getAdminReviews,
  deleteAdminReview,
  updateAdminReview
};
