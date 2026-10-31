const express = require('express');
const router = express.Router();
const {
  getFavorites,
  addFavorite,
  removeFavorite,
  checkFavorite,
} = require('../controllers/favorite.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);
router.use(authorizeRoles(ROLES.BUYER));

router.get('/', getFavorites);
router.post('/', addFavorite);
router.get('/check/:propertyId', checkFavorite);
router.delete('/:propertyId', removeFavorite);

module.exports = router;
