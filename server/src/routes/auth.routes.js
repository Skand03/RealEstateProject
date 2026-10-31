const express = require('express');
const router = express.Router();
const {
  register,
  login,
  loginWithSupabase,
  getMe,
  changePassword,
  updateProfile,
} = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadSingleImage } = require('../middleware/upload.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', authLimiter, registerValidator, register);
router.post('/login', authLimiter, loginValidator, login);
router.post('/supabase', authLimiter, loginWithSupabase);
router.get('/me', authMiddleware, getMe);
router.patch('/change-password', authMiddleware, changePasswordValidator, changePassword);
router.patch('/profile', authMiddleware, uploadSingleImage, updateProfile);

module.exports = router;
