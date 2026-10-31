// User Roles
const ROLES = {
  BUYER: 'BUYER',
  SELLER: 'SELLER',
  ADMIN: 'ADMIN',
};

// Seller Verification Status
const VERIFICATION_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// Property Types
const PROPERTY_TYPES = [
  'Apartment',
  'Villa',
  'House',
  'Plot',
  'Office',
  'Shop',
  'Commercial',
  'Other',
];

// Listing Types
const LISTING_TYPES = {
  SALE: 'SALE',
  RENT: 'RENT',
};

// Property Status
const PROPERTY_STATUS = {
  ACTIVE: 'ACTIVE',
  SOLD: 'SOLD',
  RENTED: 'RENTED',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
};

// Furnishing Status
const FURNISHING_STATUS = ['Furnished', 'Semi-Furnished', 'Unfurnished'];

// Booking Status
const BOOKING_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

// Commission Status
const COMMISSION_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
};

// Commission Rates
const COMMISSION_RATES = {
  SELLER: 0.025,
  BUYER: 0.025,
};

// Transaction Types
const TRANSACTION_TYPES = {
  SALE: 'SALE',
  RENT: 'RENT',
};

// Allowed file MIME types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

// File size limits
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PROPERTY_IMAGES = 10;

module.exports = {
  ROLES,
  VERIFICATION_STATUS,
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUS,
  FURNISHING_STATUS,
  BOOKING_STATUS,
  COMMISSION_STATUS,
  COMMISSION_RATES,
  TRANSACTION_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_PROPERTY_IMAGES,
};
