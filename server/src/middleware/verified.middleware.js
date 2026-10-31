const SellerVerification = require('../models/SellerVerification.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { VERIFICATION_STATUS, ROLES } = require('../utils/constants');

/**
 * Middleware: Ensures the authenticated seller has APPROVED verification status.
 * Must be used after authMiddleware and authorizeRoles('SELLER').
 */
const isVerifiedSeller = asyncHandler(async (req, res, next) => {
  if (req.user.role !== ROLES.SELLER) {
    throw new ApiError(403, 'Only sellers can perform this action.');
  }

  const verification = await SellerVerification.findOne({
    seller: req.user.id,
  });

  if (!verification) {
    throw new ApiError(
      403,
      'Verification record not found. Please contact support.'
    );
  }

  if (verification.status === VERIFICATION_STATUS.NOT_SUBMITTED) {
    throw new ApiError(
      403,
      'You must submit your verification documents before listing properties.'
    );
  }

  if (verification.status === VERIFICATION_STATUS.PENDING) {
    throw new ApiError(
      403,
      'Your verification is currently under review. Please wait for admin approval.'
    );
  }

  if (verification.status === VERIFICATION_STATUS.REJECTED) {
    throw new ApiError(
      403,
      `Your verification was rejected. Reason: ${verification.adminNote || 'No reason provided'}. Please re-submit your documents.`
    );
  }

  if (verification.status !== VERIFICATION_STATUS.APPROVED) {
    throw new ApiError(403, 'Seller verification is not approved.');
  }

  next();
});

module.exports = isVerifiedSeller;
