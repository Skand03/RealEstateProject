const Booking = require('../models/Booking.model');
const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { BOOKING_STATUS, PROPERTY_STATUS, ROLES } = require('../utils/constants');
const { recordBuyerCommission } = require('../services/commission.service');

// POST /api/bookings (buyer)
const createBooking = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { propertyId, requestedDate, requestedTime, message } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.status !== PROPERTY_STATUS.ACTIVE) {
    throw new ApiError(400, 'This property is not available for booking.');
  }

  // Prevent seller from booking own property
  if (property.seller.toString() === req.user.id) {
    throw new ApiError(400, 'You cannot book your own property.');
  }

  // Check for existing pending/accepted booking for same property by same buyer
  const existingBooking = await Booking.findOne({
    buyer: req.user.id,
    property: propertyId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED] },
  });

  if (existingBooking) {
    throw new ApiError(
      409,
      'You already have an active booking for this property.'
    );
  }

  const booking = await Booking.create({
    buyer: req.user.id,
    seller: property.seller,
    property: propertyId,
    requestedDate: new Date(requestedDate),
    requestedTime,
    message: message || '',
    status: BOOKING_STATUS.PENDING,
  });

  await booking.populate([
    { path: 'property', select: 'title city address images price' },
    { path: 'seller', select: 'fullName email phone' },
  ]);

  res.status(201).json(
    new ApiResponse(201, { booking }, 'Booking request submitted successfully.')
  );
});

// GET /api/bookings/buyer/mine (buyer)
const getBuyerBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = { buyer: req.user.id };
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('property', 'title city address images price listingType')
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { bookings, pagination: buildPaginationMeta(total, page, limit) },
      'Your bookings fetched.'
    )
  );
});

// GET /api/bookings/seller/mine (seller)
const getSellerBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = { seller: req.user.id };
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('property', 'title city address images price listingType')
      .populate('buyer', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { bookings, pagination: buildPaginationMeta(total, page, limit) },
      'Booking requests fetched.'
    )
  );
});

// PATCH /api/bookings/:id/cancel (buyer cancels)
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  if (booking.buyer.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to cancel this booking.');
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Cannot cancel a booking with status: ${booking.status}. Only PENDING bookings can be cancelled.`
    );
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking cancelled successfully.')
  );
});

// PATCH /api/bookings/:id/accept (seller accepts)
const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  if (booking.seller.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to accept this booking.');
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(400, `Cannot accept a booking with status: ${booking.status}.`);
  }

  booking.status = BOOKING_STATUS.ACCEPTED;
  // The seller can accept without supplying an optional note.
  if (req.body?.sellerNote) booking.sellerNote = req.body.sellerNote;
  await booking.save();

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking accepted.')
  );
});

// PATCH /api/bookings/:id/reject (seller rejects)
const rejectBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  if (booking.seller.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to reject this booking.');
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new ApiError(400, `Cannot reject a booking with status: ${booking.status}.`);
  }

  booking.status = BOOKING_STATUS.REJECTED;
  // The seller can reject without supplying an optional note.
  if (req.body?.sellerNote) booking.sellerNote = req.body.sellerNote;
  await booking.save();

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking rejected.')
  );
});

// PATCH /api/bookings/:id/complete (seller marks complete)
const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Booking not found.');

  if (booking.seller.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to complete this booking.');
  }

  if (booking.status !== BOOKING_STATUS.ACCEPTED) {
    throw new ApiError(
      400,
      `Cannot complete a booking with status: ${booking.status}. Only ACCEPTED bookings can be completed.`
    );
  }

  booking.status = BOOKING_STATUS.COMPLETED;
  await booking.save();

  // Record buyer commission
  await recordBuyerCommission(booking);

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Booking marked as completed. Buyer is now eligible to leave a review.')
  );
});

// GET /api/bookings (admin)
const getAllBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate('property', 'title city price')
      .populate('buyer', 'fullName email')
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Booking.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { bookings, pagination: buildPaginationMeta(total, page, limit) },
      'All bookings fetched.'
    )
  );
});

module.exports = {
  createBooking,
  getBuyerBookings,
  getSellerBookings,
  cancelBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getAllBookings,
};
