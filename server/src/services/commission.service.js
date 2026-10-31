const Commission = require('../models/Commission.model');
const { COMMISSION_RATES, COMMISSION_STATUS } = require('../utils/constants');

/**
 * Create seller commission record when a property is listed.
 * Seller pays 2.5% of listing price.
 */
const createSellerCommission = async (property) => {
  const sellerCommissionAmount =
    property.price * COMMISSION_RATES.SELLER;

  const commission = await Commission.create({
    property: property._id,
    seller: property.seller,
    transactionAmount: property.price,
    sellerCommissionRate: COMMISSION_RATES.SELLER,
    sellerCommissionAmount,
    buyerCommissionRate: COMMISSION_RATES.BUYER,
    buyerCommissionAmount: 0,
    transactionType: property.listingType,
    status: COMMISSION_STATUS.PENDING,
  });

  return commission;
};

/**
 * Update commission record with buyer details when booking is completed.
 * Buyer pays 2.5% of transaction amount.
 */
const recordBuyerCommission = async (booking) => {
  const { property, buyer } = booking;

  // Find the existing seller commission for this property
  let commission = await Commission.findOne({ property: property._id || property });

  const transactionAmount = commission ? commission.transactionAmount : 0;
  const buyerCommissionAmount = transactionAmount * COMMISSION_RATES.BUYER;

  if (commission) {
    commission.buyer = buyer;
    commission.booking = booking._id;
    commission.buyerCommissionAmount = buyerCommissionAmount;
    await commission.save();
  } else {
    // Fallback: create a new record if seller commission doesn't exist
    commission = await Commission.create({
      property: property._id || property,
      seller: booking.seller,
      buyer,
      booking: booking._id,
      transactionAmount: 0,
      sellerCommissionRate: COMMISSION_RATES.SELLER,
      sellerCommissionAmount: 0,
      buyerCommissionRate: COMMISSION_RATES.BUYER,
      buyerCommissionAmount: 0,
      transactionType: 'SALE',
      status: COMMISSION_STATUS.PENDING,
    });
  }

  return commission;
};

/**
 * Get commission summary for admin dashboard.
 */
const getCommissionSummary = async () => {
  const summary = await Commission.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSellerCommission: { $sum: '$sellerCommissionAmount' },
        totalBuyerCommission: { $sum: '$buyerCommissionAmount' },
        totalAmount: {
          $sum: { $add: ['$sellerCommissionAmount', '$buyerCommissionAmount'] },
        },
      },
    },
  ]);

  return summary;
};

module.exports = {
  createSellerCommission,
  recordBuyerCommission,
  getCommissionSummary,
};
