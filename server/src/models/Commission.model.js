const mongoose = require('mongoose');
const {
  COMMISSION_STATUS,
  COMMISSION_RATES,
  TRANSACTION_TYPES,
} = require('../utils/constants');

const commissionSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    transactionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerCommissionRate: {
      type: Number,
      default: COMMISSION_RATES.SELLER,
    },
    sellerCommissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    buyerCommissionRate: {
      type: Number,
      default: COMMISSION_RATES.BUYER,
    },
    buyerCommissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(COMMISSION_STATUS),
      default: COMMISSION_STATUS.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commissionSchema.index({ property: 1 });
commissionSchema.index({ seller: 1 });
commissionSchema.index({ buyer: 1 });
commissionSchema.index({ status: 1 });

const Commission = mongoose.model('Commission', commissionSchema);
module.exports = Commission;
