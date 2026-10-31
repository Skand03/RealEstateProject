const SellerVerification = require('../models/SellerVerification.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { uploadVerificationDocument } = require('../services/cloudinary.service');
const { deleteFromCloudinary } = require('../services/cloudinary.service');
const { VERIFICATION_STATUS } = require('../utils/constants');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// POST /api/seller-verification/submit
const submitVerification = asyncHandler(async (req, res) => {
  const files = req.files;

  if (!files || !files.identityProof || !files.ownershipProof) {
    throw new ApiError(
      400,
      'Both identity proof and ownership proof documents are required.'
    );
  }

  let verification = await SellerVerification.findOne({ seller: req.user.id });

  if (!verification) {
    verification = new SellerVerification({ seller: req.user.id });
  }

  // Only allow re-submission if NOT_SUBMITTED or REJECTED
  if (
    verification.status === VERIFICATION_STATUS.PENDING ||
    verification.status === VERIFICATION_STATUS.APPROVED
  ) {
    throw new ApiError(
      400,
      verification.status === VERIFICATION_STATUS.PENDING
        ? 'Your verification is already under review.'
        : 'Your verification is already approved.'
    );
  }

  // Delete old documents from Cloudinary if they exist
  if (verification.identityProof && verification.identityProof.publicId) {
    await deleteFromCloudinary(verification.identityProof.publicId, 'raw').catch(() => {});
  }
  if (verification.ownershipProof && verification.ownershipProof.publicId) {
    await deleteFromCloudinary(verification.ownershipProof.publicId, 'raw').catch(() => {});
  }

  // Upload new documents
  const identityFile = files.identityProof[0];
  const ownershipFile = files.ownershipProof[0];

  const [identityResult, ownershipResult] = await Promise.all([
    uploadVerificationDocument(identityFile.buffer, 'identity'),
    uploadVerificationDocument(ownershipFile.buffer, 'ownership'),
  ]);

  verification.identityProof = {
    url: identityResult.secure_url,
    publicId: identityResult.public_id,
    fileType: identityFile.mimetype,
    originalName: identityFile.originalname,
  };

  verification.ownershipProof = {
    url: ownershipResult.secure_url,
    publicId: ownershipResult.public_id,
    fileType: ownershipFile.mimetype,
    originalName: ownershipFile.originalname,
  };

  verification.status = VERIFICATION_STATUS.PENDING;
  verification.adminNote = '';
  verification.reviewedBy = null;
  verification.reviewedAt = null;

  await verification.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { verification },
      'Verification documents submitted successfully. Please wait for admin review.'
    )
  );
});

// GET /api/seller-verification/status (seller — own status)
const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const verification = await SellerVerification.findOne({
    seller: req.user.id,
  });

  if (!verification) {
    throw new ApiError(404, 'Verification record not found.');
  }

  res.status(200).json(
    new ApiResponse(200, { verification }, 'Verification status fetched.')
  );
});

// GET /api/seller-verification (admin — all verifications)
const getAllVerifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = {};
  if (status) query.status = status;

  const [verifications, total] = await Promise.all([
    SellerVerification.find(query)
      .populate('seller', 'fullName email phone createdAt')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SellerVerification.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { verifications, pagination: buildPaginationMeta(total, page, limit) },
      'Verifications fetched.'
    )
  );
});

// GET /api/seller-verification/:id (admin — single)
const getVerificationById = asyncHandler(async (req, res) => {
  const verification = await SellerVerification.findById(req.params.id)
    .populate('seller', 'fullName email phone createdAt')
    .populate('reviewedBy', 'fullName email');

  if (!verification) {
    throw new ApiError(404, 'Verification record not found.');
  }

  res.status(200).json(
    new ApiResponse(200, { verification }, 'Verification fetched.')
  );
});

// PATCH /api/seller-verification/:id/approve (admin)
const approveVerification = asyncHandler(async (req, res) => {
  const verification = await SellerVerification.findById(req.params.id);

  if (!verification) {
    throw new ApiError(404, 'Verification record not found.');
  }

  if (verification.status !== VERIFICATION_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Cannot approve a verification with status: ${verification.status}`
    );
  }

  verification.status = VERIFICATION_STATUS.APPROVED;
  verification.adminNote = req.body?.adminNote || '';
  verification.reviewedBy = req.user.id;
  verification.reviewedAt = new Date();

  await verification.save();

  res.status(200).json(
    new ApiResponse(200, { verification }, 'Seller verification approved.')
  );
});

// PATCH /api/seller-verification/:id/reject (admin)
const rejectVerification = asyncHandler(async (req, res) => {
  const { adminNote } = req.body;

  if (!adminNote || !adminNote.trim()) {
    throw new ApiError(400, 'A reason (adminNote) is required when rejecting verification.');
  }

  const verification = await SellerVerification.findById(req.params.id);

  if (!verification) {
    throw new ApiError(404, 'Verification record not found.');
  }

  if (verification.status !== VERIFICATION_STATUS.PENDING) {
    throw new ApiError(
      400,
      `Cannot reject a verification with status: ${verification.status}`
    );
  }

  verification.status = VERIFICATION_STATUS.REJECTED;
  verification.adminNote = adminNote.trim();
  verification.reviewedBy = req.user.id;
  verification.reviewedAt = new Date();

  await verification.save();

  res.status(200).json(
    new ApiResponse(200, { verification }, 'Seller verification rejected.')
  );
});

module.exports = {
  submitVerification,
  getMyVerificationStatus,
  getAllVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
};
