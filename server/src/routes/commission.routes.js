const express = require('express');
const router = express.Router();
const {
  getMySellerCommissions,
  getMyBuyerCommissions,
  getAllCommissions,
} = require('../controllers/commission.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

router.get('/seller/mine', authorizeRoles(ROLES.SELLER), getMySellerCommissions);
router.get('/buyer/mine', authorizeRoles(ROLES.BUYER), getMyBuyerCommissions);
router.get('/', authorizeRoles(ROLES.ADMIN), getAllCommissions);

module.exports = router;
