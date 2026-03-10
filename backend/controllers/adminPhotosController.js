const pool = require('../db/pool');

async function getAdminPhotos(_req, res) {
  try {
    const result = await pool.query('SELECT id, url, created_at FROM photos ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch admin photos:', error);
    return res.status(500).json({ error: 'Failed to fetch photos' });
  }
}

async function createAdminPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Photo file is required' });
    }

    const url = `/uploads/${req.file.filename}`;
    const result = await pool.query(
      'INSERT INTO photos (url) VALUES ($1) RETURNING id, url, created_at',
      [url]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Failed to create admin photo:', error);
    return res.status(500).json({ error: 'Failed to save photo' });
  }
}

module.exports = {
  getAdminPhotos,
  createAdminPhoto
};
