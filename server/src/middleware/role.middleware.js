const ApiError = require('../utils/ApiError');

/**
 * Middleware factory that checks if the authenticated user has one of the allowed roles.
 * Usage: authorizeRoles('ADMIN', 'SELLER')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Access denied. Required role(s): ${roles.join(', ')}.`
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
