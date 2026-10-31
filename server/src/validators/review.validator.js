const { body } = require('express-validator');

const reviewValidator = [
  body('propertyId')
    .notEmpty().withMessage('Property ID is required.')
    .isMongoId().withMessage('Invalid property ID.'),

  body('rating')
    .notEmpty().withMessage('Rating is required.')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Review comment is required.')
    .isLength({ min: 10, max: 500 }).withMessage('Comment must be 10–500 characters.'),
];

module.exports = { reviewValidator };
