const express = require('express');
const checkAdminKey = require('../middleware/checkAdminKey');
const {
  getAdminReviews,
  deleteAdminReview,
  updateAdminReview
} = require('../controllers/adminReviewsController');

const router = express.Router();

// Every admin review endpoint requires a valid x-admin-key header.
router.get('/reviews', checkAdminKey, getAdminReviews);
router.put('/reviews/:id', checkAdminKey, updateAdminReview);
router.delete('/reviews/:id', checkAdminKey, deleteAdminReview);

module.exports = router;
