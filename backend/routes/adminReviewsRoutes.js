const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const checkAdminKey = require('../middleware/checkAdminKey');
const {
  getAdminReviews,
  deleteAdminReview,
  updateAdminReview
} = require('../controllers/adminReviewsController');
const { getAdminPhotos, createAdminPhoto } = require('../controllers/adminPhotosController');

const router = express.Router();

const uploadsDir = path.resolve(__dirname, '../../frontend/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext) ? ext : '';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `photo-${unique}${safeExt || ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function uploadPhotoMiddleware(req, res, next) {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Upload failed' });
    }
    return next();
  });
}

// Every admin review endpoint requires a valid x-admin-key header.
router.get('/reviews', checkAdminKey, getAdminReviews);
router.put('/reviews/:id', checkAdminKey, updateAdminReview);
router.delete('/reviews/:id', checkAdminKey, deleteAdminReview);

router.get('/photos', checkAdminKey, getAdminPhotos);
router.post('/photos', checkAdminKey, uploadPhotoMiddleware, createAdminPhoto);

module.exports = router;
