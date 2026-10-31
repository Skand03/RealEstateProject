const express = require('express');
const router = express.Router();
const {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  setPrimaryImage,
} = require('../controllers/property.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const isVerifiedSeller = require('../middleware/verified.middleware');
const { uploadPropertyImages } = require('../middleware/upload.middleware');
const { propertyValidator } = require('../validators/property.validator');
const { ROLES } = require('../utils/constants');

// Public routes
router.get('/', getProperties);
router.get('/seller/mine', authMiddleware, authorizeRoles(ROLES.SELLER), getMyProperties);
router.get('/:id', getPropertyById);

// Verified seller routes
router.post(
  '/',
  authMiddleware,
  authorizeRoles(ROLES.SELLER),
  isVerifiedSeller,
  uploadPropertyImages,
  propertyValidator,
  createProperty
);

router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles(ROLES.SELLER),
  isVerifiedSeller,
  uploadPropertyImages,
  updateProperty
);

router.delete(
  '/:id',
  authMiddleware,
  deleteProperty
);

router.delete(
  '/:id/images/:imageId',
  authMiddleware,
  deletePropertyImage
);

router.patch(
  '/:id/images/:imageId/primary',
  authMiddleware,
  authorizeRoles(ROLES.SELLER),
  setPrimaryImage
);

module.exports = router;
