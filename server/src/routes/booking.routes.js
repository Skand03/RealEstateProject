const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBuyerBookings,
  getSellerBookings,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getAllBookings,
} = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { bookingValidator } = require('../validators/booking.validator');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

// Buyer routes
router.post('/', authorizeRoles(ROLES.BUYER), bookingValidator, createBooking);
router.get('/buyer/mine', authorizeRoles(ROLES.BUYER), getBuyerBookings);
router.patch('/:id/cancel', authorizeRoles(ROLES.BUYER), cancelBooking);

// Seller routes
router.get('/seller/mine', authorizeRoles(ROLES.SELLER), getSellerBookings);
router.patch('/:id/accept', authorizeRoles(ROLES.SELLER), acceptBooking);
router.patch('/:id/reject', authorizeRoles(ROLES.SELLER), rejectBooking);
router.patch('/:id/complete', authorizeRoles(ROLES.SELLER), completeBooking);

// Admin routes
router.get('/', authorizeRoles(ROLES.ADMIN), getAllBookings);

module.exports = router;
