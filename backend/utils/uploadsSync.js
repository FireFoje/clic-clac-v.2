const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

const frontendDir = path.resolve(__dirname, '../../frontend');
const uploadsDir = path.join(frontendDir, 'uploads');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']);

async function syncUploadsToDb() {
  await fs.promises.mkdir(uploadsDir, { recursive: true });

  const entries = await fs.promises.readdir(uploadsDir, { withFileTypes: true });
  const urls = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .map((name) => `/uploads/${name}`);

  if (urls.length === 0) {
    return;
  }

  const existing = await pool.query('SELECT url FROM photos WHERE url = ANY($1::text[])', [urls]);
  const existingUrls = new Set(existing.rows.map((row) => row.url));
  const missing = urls.filter((url) => !existingUrls.has(url));

  if (missing.length === 0) {
    return;
  }

  await pool.query('INSERT INTO photos (url) SELECT unnest($1::text[])', [missing]);
}

module.exports = {
  syncUploadsToDb,
  uploadsDir
};
