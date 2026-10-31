const express = require('express');
const router = express.Router();
const {
  submitVerification,
  getMyVerificationStatus,
  getAllVerifications,
  getVerificationById,
  approveVerification,
  rejectVerification,
} = require('../controllers/sellerVerification.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { uploadVerificationDocs } = require('../middleware/upload.middleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

// Seller routes
router.post(
  '/submit',
  authorizeRoles(ROLES.SELLER),
  uploadVerificationDocs,
  submitVerification
);
router.get('/status', authorizeRoles(ROLES.SELLER), getMyVerificationStatus);

// Admin routes
router.get('/', authorizeRoles(ROLES.ADMIN), getAllVerifications);
router.get('/:id', authorizeRoles(ROLES.ADMIN), getVerificationById);
router.patch('/:id/approve', authorizeRoles(ROLES.ADMIN), approveVerification);
router.patch('/:id/reject', authorizeRoles(ROLES.ADMIN), rejectVerification);

module.exports = router;
