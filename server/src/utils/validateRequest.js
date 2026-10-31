const { validationResult } = require('express-validator');
const ApiError = require('./ApiError');

/**
 * Checks express-validator results and throws ApiError if validation failed.
 */
const validateRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw new ApiError(400, 'Validation failed.', formattedErrors);
  }
};

module.exports = validateRequest;
