const Commission = require('../models/Commission.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { getCommissionSummary } = require('../services/commission.service');

// GET /api/commissions/seller/mine (seller)
const getMySellerCommissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [commissions, total] = await Promise.all([
    Commission.find({ seller: req.user.id })
      .populate('property', 'title city price listingType')
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments({ seller: req.user.id }),
  ]);

  // Calculate totals
  const totals = await Commission.aggregate([
    { $match: { seller: require('mongoose').Types.ObjectId.createFromHexString(req.user.id) } },
    {
      $group: {
        _id: null,
        totalSellerCommission: { $sum: '$sellerCommissionAmount' },
        totalBuyerCommission: { $sum: '$buyerCommissionAmount' },
        totalTransactionAmount: { $sum: '$transactionAmount' },
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        commissions,
        pagination: buildPaginationMeta(total, page, limit),
        totals: totals[0] || {
          totalSellerCommission: 0,
          totalBuyerCommission: 0,
          totalTransactionAmount: 0,
          count: 0,
        },
      },
      'Seller commissions fetched.'
    )
  );
});

// GET /api/commissions/buyer/mine (buyer)
const getMyBuyerCommissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [commissions, total] = await Promise.all([
    Commission.find({ buyer: req.user.id })
      .populate('property', 'title city price listingType')
      .populate('seller', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments({ buyer: req.user.id }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { commissions, pagination: buildPaginationMeta(total, page, limit) },
      'Buyer commissions fetched.'
    )
  );
});

// GET /api/commissions (admin — all)
const getAllCommissions = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const [commissions, total, summary] = await Promise.all([
    Commission.find(query)
      .populate('property', 'title city price listingType')
      .populate('seller', 'fullName email')
      .populate('buyer', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Commission.countDocuments(query),
    getCommissionSummary(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        commissions,
        pagination: buildPaginationMeta(total, page, limit),
        summary,
      },
      'All commissions fetched.'
    )
  );
});

module.exports = {
  getMySellerCommissions,
  getMyBuyerCommissions,
  getAllCommissions,
};
