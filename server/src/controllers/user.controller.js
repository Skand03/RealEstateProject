const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { ROLES } = require('../utils/constants');

// GET /api/users (admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { role, search } = req.query;

  const query = {};
  if (role) query.role = role;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { users, pagination: buildPaginationMeta(total, page, limit) },
      'Users fetched.'
    )
  );
});

// GET /api/users/:id (admin or self)
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  // Non-admin users can only view their own profile
  if (req.user.role !== ROLES.ADMIN && req.user.id !== req.params.id) {
    throw new ApiError(403, 'Access denied.');
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User fetched.'));
});

// PATCH /api/users/:id (self)
const updateUser = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'You can only update your own profile.');
  }

  const allowedFields = ['fullName', 'phone'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found.');

  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated.'));
});

// PATCH /api/users/:id/suspend (admin)
const suspendUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (user.role === ROLES.ADMIN) {
    throw new ApiError(400, 'Cannot suspend an admin account.');
  }

  user.isSuspended = !user.isSuspended;
  await user.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { user },
      `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully.`
    )
  );
});

// DELETE /api/users/:id (admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');

  if (user.role === ROLES.ADMIN) {
    throw new ApiError(400, 'Cannot delete an admin account.');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully.'));
});

module.exports = { getAllUsers, getUserById, updateUser, suspendUser, deleteUser };
