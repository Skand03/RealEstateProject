const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentActivity,
  getAllProperties,
  updatePropertyStatus,
} = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/stats', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/properties', getAllProperties);
router.patch('/properties/:id/status', updatePropertyStatus);

module.exports = router;
