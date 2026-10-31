const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');
const Commission = require('../models/Commission.model');
const SellerVerification = require('../models/SellerVerification.model');
const ApiError = require('../utils/ApiError');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { VERIFICATION_STATUS, PROPERTY_STATUS, BOOKING_STATUS, ROLES } = require('../utils/constants');

// GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBuyers,
    totalSellers,
    totalAdmins,
    suspendedUsers,
    totalProperties,
    activeProperties,
    soldProperties,
    rentedProperties,
    inactiveProperties,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalReviews,
    pendingVerifications,
    approvedVerifications,
    rejectedVerifications,
    commissionStats,
    recentPendingVerifications,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: ROLES.BUYER }),
    User.countDocuments({ role: ROLES.SELLER }),
    User.countDocuments({ role: ROLES.ADMIN }),
    User.countDocuments({ isSuspended: true }),
    Property.countDocuments(),
    Property.countDocuments({ status: PROPERTY_STATUS.ACTIVE }),
    Property.countDocuments({ status: PROPERTY_STATUS.SOLD }),
    Property.countDocuments({ status: PROPERTY_STATUS.RENTED }),
    Property.countDocuments({ status: PROPERTY_STATUS.INACTIVE }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: BOOKING_STATUS.PENDING }),
    Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED }),
    Review.countDocuments(),
    SellerVerification.countDocuments({ status: VERIFICATION_STATUS.PENDING }),
    SellerVerification.countDocuments({ status: VERIFICATION_STATUS.APPROVED }),
    SellerVerification.countDocuments({ status: VERIFICATION_STATUS.REJECTED }),
    Commission.aggregate([
      {
        $group: {
          _id: null,
          totalSellerCommission: { $sum: '$sellerCommissionAmount' },
          totalBuyerCommission: { $sum: '$buyerCommissionAmount' },
          totalPlatformRevenue: {
            $sum: { $add: ['$sellerCommissionAmount', '$buyerCommissionAmount'] },
          },
          totalTransactions: { $sum: 1 },
        },
      },
    ]),
    SellerVerification.find({ status: VERIFICATION_STATUS.PENDING })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('seller', 'fullName email phone'),
    User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt'),
  ]);

  const stats = {
    users: {
      total: totalUsers,
      buyers: totalBuyers,
      sellers: totalSellers,
      admins: totalAdmins,
      suspended: suspendedUsers,
    },
    properties: {
      total: totalProperties,
      active: activeProperties,
      sold: soldProperties,
      rented: rentedProperties,
      inactive: inactiveProperties,
    },
    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      completed: completedBookings,
    },
    reviews: {
      total: totalReviews,
    },
    verifications: {
      pending: pendingVerifications,
      approved: approvedVerifications,
      rejected: rejectedVerifications,
    },
    commissions: commissionStats[0] || {
      totalSellerCommission: 0,
      totalBuyerCommission: 0,
      totalPlatformRevenue: 0,
      totalTransactions: 0,
    },
    recentPendingVerifications,
    recentUsers,
  };

  res.status(200).json(
    new ApiResponse(200, { stats }, 'Dashboard stats fetched.')
  );
});

// GET /api/admin/recent-activity
const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentUsers, recentProperties, recentBookings, recentReviews] = await Promise.all([
    User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt'),
    Property.find().sort({ createdAt: -1 }).limit(5)
      .select('title city price status createdAt')
      .populate('seller', 'fullName'),
    Booking.find().sort({ createdAt: -1 }).limit(5)
      .populate('property', 'title city')
      .populate('buyer', 'fullName')
      .select('status createdAt requestedDate'),
    Review.find().sort({ createdAt: -1 }).limit(5)
      .populate('reviewer', 'fullName')
      .populate('property', 'title')
      .select('rating comment createdAt'),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { recentUsers, recentProperties, recentBookings, recentReviews },
      'Recent activity fetched.'
    )
  );
});

// GET /api/admin/properties (admin)
const getAllProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, status, propertyType, listingType } = req.query;
  const query = {};

  if (search) query.$text = { $search: search };
  if (status) query.status = status;
  if (propertyType) query.propertyType = propertyType;
  if (listingType) query.listingType = listingType;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate('seller', 'fullName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(query),
  ]);

  res.status(200).json(new ApiResponse(
    200,
    { properties, pagination: buildPaginationMeta(total, page, limit) },
    'All properties fetched.'
  ));
});

// PATCH /api/admin/properties/:id/status (admin)
const updatePropertyStatus = asyncHandler(async (req, res) => {
  const { status } = req.body || {};
  if (!Object.values(PROPERTY_STATUS).includes(status)) {
    throw new ApiError(400, 'Please provide a valid property status.');
  }

  const property = await Property.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );
  if (!property) throw new ApiError(404, 'Property not found.');

  res.status(200).json(new ApiResponse(200, { property }, 'Property status updated.'));
});

module.exports = { getDashboardStats, getRecentActivity, getAllProperties, updatePropertyStatus };
