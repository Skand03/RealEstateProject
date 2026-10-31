const express = require('express');
const router = express.Router();
const {
  createReview,
  getPropertyReviews,
  getSellerReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
} = require('../controllers/review.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { reviewValidator } = require('../validators/review.validator');
const { ROLES } = require('../utils/constants');

// Public
router.get('/property/:id', getPropertyReviews);
router.get('/seller/:id', getSellerReviews);

// Authenticated
router.post('/', authMiddleware, authorizeRoles(ROLES.BUYER), reviewValidator, createReview);
router.get('/my', authMiddleware, authorizeRoles(ROLES.BUYER), getMyReviews);
router.patch('/:id', authMiddleware, authorizeRoles(ROLES.BUYER), updateReview);
router.delete('/:id', authMiddleware, deleteReview);

// Admin
router.get('/', authMiddleware, authorizeRoles(ROLES.ADMIN), getAllReviews);

module.exports = router;
