const mongoose = require('mongoose');
const { VERIFICATION_STATUS } = require('../utils/constants');

const documentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, required: true },
    originalName: { type: String },
  },
  { _id: false }
);

const sellerVerificationSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    identityProof: {
      type: documentSchema,
      default: null,
    },
    ownershipProof: {
      type: documentSchema,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.NOT_SUBMITTED,
    },
    adminNote: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// The unique seller field already creates its index.
sellerVerificationSchema.index({ status: 1 });

const SellerVerification = mongoose.model(
  'SellerVerification',
  sellerVerificationSchema
);
module.exports = SellerVerification;
