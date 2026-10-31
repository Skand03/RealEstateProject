const { body } = require('express-validator');

const bookingValidator = [
  body('propertyId')
    .notEmpty().withMessage('Property ID is required.')
    .isMongoId().withMessage('Invalid property ID.'),

  body('requestedDate')
    .notEmpty().withMessage('Requested date is required.')
    .isISO8601().withMessage('Invalid date format. Use ISO 8601 (YYYY-MM-DD).')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Requested date cannot be in the past.');
      }
      return true;
    }),

  body('requestedTime')
    .notEmpty().withMessage('Requested time is required.')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format. Use HH:MM.'),

  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Message cannot exceed 500 characters.'),
];

module.exports = { bookingValidator };
