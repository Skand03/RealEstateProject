const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  suspendUser,
  deleteUser,
} = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(authMiddleware);

router.get('/', authorizeRoles(ROLES.ADMIN), getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/suspend', authorizeRoles(ROLES.ADMIN), suspendUser);
router.delete('/:id', authorizeRoles(ROLES.ADMIN), deleteUser);

module.exports = router;
