const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, 'Token is invalid. User not found.');
    }

    if (user.isSuspended) {
      throw new ApiError(403, 'Your account has been suspended.');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account is not active.');
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      fullName: user.fullName,
    };
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired. Please login again.');
    }
    throw new ApiError(401, 'Invalid token.');
  }
});

module.exports = authMiddleware;
