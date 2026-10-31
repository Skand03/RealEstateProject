const Review = require('../models/Review.model');
const Property = require('../models/Property.model');
const Booking = require('../models/Booking.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { updatePropertyRating } = require('../services/review.service');
const { BOOKING_STATUS, ROLES } = require('../utils/constants');

// POST /api/reviews (buyer — eligible only)
const createReview = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { propertyId, rating, comment } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found.');

  // Check eligibility: must have a COMPLETED booking for this property
  const eligibleBooking = await Booking.findOne({
    buyer: req.user.id,
    property: propertyId,
    status: BOOKING_STATUS.COMPLETED,
  });

  if (!eligibleBooking) {
    throw new ApiError(
      403,
      'You can only review a property after a completed visit booking.'
    );
  }

  // Check for existing review
  const existingReview = await Review.findOne({
    reviewer: req.user.id,
    property: propertyId,
  });

  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this property.');
  }

  const review = await Review.create({
    reviewer: req.user.id,
    property: propertyId,
    seller: property.seller,
    rating: Number(rating),
    comment: comment.trim(),
  });

  // Recalculate property average rating
  await updatePropertyRating(property._id);

  await review.populate('reviewer', 'fullName avatar');

  res.status(201).json(
    new ApiResponse(201, { review }, 'Review submitted successfully.')
  );
});

// GET /api/reviews/property/:id (public)
const getPropertyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found.');

  const [reviews, total] = await Promise.all([
    Review.find({ property: req.params.id })
      .populate('reviewer', 'fullName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ property: req.params.id }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: buildPaginationMeta(total, page, limit),
        averageRating: property.averageRating,
        reviewCount: property.reviewCount,
      },
      'Reviews fetched.'
    )
  );
});

// GET /api/reviews/seller/:id (public — reviews for a seller)
const getSellerReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ seller: req.params.id })
      .populate('reviewer', 'fullName avatar')
      .populate('property', 'title city images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ seller: req.params.id }),
  ]);

  // Calculate seller average rating
  const ratingStats = await Review.aggregate([
    { $match: { seller: reviews[0]?.seller || require('mongoose').Types.ObjectId(req.params.id) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews,
        pagination: buildPaginationMeta(total, page, limit),
        averageRating: ratingStats[0]?.avgRating || 0,
        totalReviews: total,
      },
      'Seller reviews fetched.'
    )
  );
});

// GET /api/reviews/my (buyer — own reviews)
const getMyReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find({ reviewer: req.user.id })
      .populate('property', 'title city images price')
      .populate('seller', 'fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ reviewer: req.user.id }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { reviews, pagination: buildPaginationMeta(total, page, limit) },
      'Your reviews fetched.'
    )
  );
});

// PATCH /api/reviews/:id (reviewer only)
const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');

  if (review.reviewer.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to update this review.');
  }

  const { rating, comment } = req.body;
  if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    throw new ApiError(400, 'Rating must be between 1 and 5.');
  }
  if (typeof comment !== 'string' || comment.trim().length < 10 || comment.trim().length > 500) {
    throw new ApiError(400, 'Review comment must be 10–500 characters.');
  }

  review.rating = Number(rating);
  review.comment = comment.trim();
  await review.save();
  await updatePropertyRating(review.property);

  res.status(200).json(new ApiResponse(200, { review }, 'Review updated successfully.'));
});

// DELETE /api/reviews/:id (admin or reviewer)
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');

  if (
    review.reviewer.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN
  ) {
    throw new ApiError(403, 'You are not authorized to delete this review.');
  }

  const propertyId = review.property;
  await Review.findByIdAndDelete(req.params.id);

  // Recalculate property rating after deletion
  await updatePropertyRating(propertyId);

  res.status(200).json(
    new ApiResponse(200, null, 'Review deleted successfully.')
  );
});

// GET /api/reviews (admin — all reviews)
const getAllReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [reviews, total] = await Promise.all([
    Review.find()
      .populate('reviewer', 'fullName email')
      .populate('property', 'title city')
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { reviews, pagination: buildPaginationMeta(total, page, limit) },
      'All reviews fetched.'
    )
  );
});

module.exports = {
  createReview,
  getPropertyReviews,
  getSellerReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
};
