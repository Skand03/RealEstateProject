const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const SellerVerification = require('../models/SellerVerification.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');
const { ROLES, VERIFICATION_STATUS } = require('../utils/constants');
const { uploadAvatar } = require('../services/cloudinary.service');
const { deleteFromCloudinary } = require('../services/cloudinary.service');
const getSupabase = require('../config/supabase');
const { logAuthEvent } = require('../utils/authLogger');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { fullName, email, phone, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    logAuthEvent('registration_rejected', { reason: 'email_exists' });
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const userRole = role === ROLES.SELLER ? ROLES.SELLER : ROLES.BUYER;

  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    role: userRole,
  });

  // If seller, create verification record
  if (userRole === ROLES.SELLER) {
    await SellerVerification.create({
      seller: user._id,
      status: VERIFICATION_STATUS.NOT_SUBMITTED,
    });
  }

  const token = generateToken(user);
  logAuthEvent('registration_succeeded', { userId: user._id.toString(), role: user.role });

  res.status(201).json(
    new ApiResponse(201, { user, token }, 'Registration successful.')
  );
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    logAuthEvent('password_login_rejected', { reason: 'invalid_credentials' });
    throw new ApiError(401, 'Invalid email or password.');
  }

  if (!user.password) {
    throw new ApiError(
      400,
      'This account was created with Google sign-in. Please click "Continue with Google".'
    );
  }

  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    logAuthEvent('password_login_rejected', { reason: 'invalid_credentials' });
    throw new ApiError(401, 'Invalid email or password.');
  }

  const token = generateToken(user);
  logAuthEvent('password_login_succeeded', { userId: user._id.toString(), role: user.role });

  // Get verification status for sellers
  let verificationStatus = null;
  if (user.role === ROLES.SELLER) {
    const verification = await SellerVerification.findOne({ seller: user._id });
    verificationStatus = verification ? verification.status : VERIFICATION_STATUS.NOT_SUBMITTED;
  }

  const userObj = user.toJSON();

  res.status(200).json(
    new ApiResponse(
      200,
      { user: userObj, token, verificationStatus },
      'Login successful.'
    )
  );
});

// POST /api/auth/supabase
const loginWithSupabase = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    logAuthEvent('google_login_rejected', { reason: 'missing_access_token' });
    throw new ApiError(400, 'Supabase access token is required.');
  }

  const { data, error } = await getSupabase().auth.getUser(accessToken);
  if (error || !data.user?.email) {
    logAuthEvent('google_login_rejected', {
      reason: 'invalid_supabase_session',
      providerError: error?.message || null,
    });
    throw new ApiError(401, 'Supabase session is invalid or has expired.');
  }

  const email = data.user.email.toLowerCase();
  const metadata = data.user.user_metadata || {};
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      fullName: metadata.full_name || metadata.name || email.split('@')[0],
      email,
      phone: '',
      role: ROLES.BUYER,
      avatar: { url: metadata.avatar_url || '', publicId: '' },
    });
    logAuthEvent('google_user_created', { userId: user._id.toString(), role: user.role });
  }

  if (user.isSuspended) {
    throw new ApiError(403, 'Your account has been suspended. Please contact support.');
  }

  const token = generateToken(user);
  logAuthEvent('google_login_succeeded', { userId: user._id.toString(), role: user.role });
  let verificationStatus = null;
  if (user.role === ROLES.SELLER) {
    const verification = await SellerVerification.findOne({ seller: user._id });
    verificationStatus = verification ? verification.status : VERIFICATION_STATUS.NOT_SUBMITTED;
  }

  res.status(200).json(
    new ApiResponse(200, { user, token, verificationStatus }, 'Google login successful.')
  );
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found.');

  let verificationStatus = null;
  if (user.role === ROLES.SELLER) {
    const verification = await SellerVerification.findOne({ seller: user._id });
    verificationStatus = verification ? verification.status : VERIFICATION_STATUS.NOT_SUBMITTED;
  }

  res.status(200).json(
    new ApiResponse(200, { user, verificationStatus }, 'User profile fetched.')
  );
});

// PATCH /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully.'));
});

// PATCH /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, phone } = req.body;
  const updates = {};

  if (fullName) updates.fullName = fullName.trim();
  if (phone) updates.phone = phone.trim();

  // Handle avatar upload
  if (req.file) {
    const user = await User.findById(req.user.id);
    // Delete old avatar if exists
    if (user.avatar && user.avatar.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }
    const result = await uploadAvatar(req.file.buffer);
    updates.avatar = { url: result.secure_url, publicId: result.public_id };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully.'));
});

module.exports = { register, login, loginWithSupabase, getMe, changePassword, updateProfile };
