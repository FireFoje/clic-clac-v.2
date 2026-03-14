const pool = require('../db/pool');
const { syncUploadsToDb } = require('../utils/uploadsSync');

async function getAdminPhotos(_req, res) {
  try {
    await syncUploadsToDb();
    const result = await pool.query('SELECT id, url, created_at FROM photos ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch admin photos:', error);
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
}

module.exports = {
  getAdminPhotos
};
