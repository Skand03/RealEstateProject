const { body } = require('express-validator');

const messageValidator = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content is required.')
    .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1–1000 characters.'),
];

const conversationValidator = [
  body('propertyId')
    .notEmpty().withMessage('Property ID is required.')
    .isMongoId().withMessage('Invalid property ID.'),
];

module.exports = { messageValidator, conversationValidator };
