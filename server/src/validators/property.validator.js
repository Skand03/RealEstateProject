const { body } = require('express-validator');
const {
  PROPERTY_TYPES,
  LISTING_TYPES,
  FURNISHING_STATUS,
} = require('../utils/constants');

const propertyValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters.'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ min: 20, max: 2000 }).withMessage('Description must be 20–2000 characters.'),

  body('propertyType')
    .notEmpty().withMessage('Property type is required.')
    .isIn(PROPERTY_TYPES).withMessage(`Property type must be one of: ${PROPERTY_TYPES.join(', ')}.`),

  body('listingType')
    .notEmpty().withMessage('Listing type is required.')
    .isIn(Object.values(LISTING_TYPES)).withMessage('Listing type must be SALE or RENT.'),

  body('price')
    .notEmpty().withMessage('Price is required.')
    .isNumeric().withMessage('Price must be a number.')
    .custom((v) => v >= 0).withMessage('Price cannot be negative.'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required.'),

  body('state')
    .trim()
    .notEmpty().withMessage('State is required.'),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required.'),

  body('latitude')
    .notEmpty().withMessage('Latitude is required.')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90.'),

  body('longitude')
    .notEmpty().withMessage('Longitude is required.')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180.'),

  body('area')
    .notEmpty().withMessage('Area is required.')
    .isNumeric().withMessage('Area must be a number.')
    .custom((v) => v >= 1).withMessage('Area must be at least 1 sq ft.'),

  body('bedrooms')
    .optional()
    .isInt({ min: 0 }).withMessage('Bedrooms must be a non-negative integer.'),

  body('bathrooms')
    .optional()
    .isInt({ min: 0 }).withMessage('Bathrooms must be a non-negative integer.'),

  body('furnishingStatus')
    .optional()
    .isIn([...FURNISHING_STATUS, '']).withMessage(
      `Furnishing status must be one of: ${FURNISHING_STATUS.join(', ')}.`
    ),

  body('amenities')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      try {
        return Array.isArray(JSON.parse(value));
      } catch {
        throw new Error('Amenities must be an array.');
      }
    }),
];

const updatePropertyValidator = propertyValidator.map((v) => v.optional());

module.exports = { propertyValidator, updatePropertyValidator };
