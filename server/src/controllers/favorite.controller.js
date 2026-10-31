const Favorite = require('../models/Favorite.model');
const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// GET /api/favorites (buyer)
const getFavorites = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const [favorites, total] = await Promise.all([
    Favorite.find({ buyer: req.user.id })
      .populate({
        path: 'property',
        populate: { path: 'seller', select: 'fullName email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Favorite.countDocuments({ buyer: req.user.id }),
  ]);

  // Filter out favorites where property has been deleted
  const validFavorites = favorites.filter((f) => f.property !== null);

  res.status(200).json(
    new ApiResponse(
      200,
      { favorites: validFavorites, pagination: buildPaginationMeta(total, page, limit) },
      'Favorites fetched.'
    )
  );
});

// POST /api/favorites
const addFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.body;

  if (!propertyId) throw new ApiError(400, 'Property ID is required.');

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found.');

  // Check duplicate
  const existing = await Favorite.findOne({
    buyer: req.user.id,
    property: propertyId,
  });

  if (existing) {
    throw new ApiError(409, 'This property is already in your favorites.');
  }

  const favorite = await Favorite.create({
    buyer: req.user.id,
    property: propertyId,
  });

  await favorite.populate('property');

  res.status(201).json(
    new ApiResponse(201, { favorite }, 'Property added to favorites.')
  );
});

// DELETE /api/favorites/:propertyId
const removeFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOneAndDelete({
    buyer: req.user.id,
    property: req.params.propertyId,
  });

  if (!favorite) {
    throw new ApiError(404, 'Favorite not found.');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Property removed from favorites.')
  );
});

// GET /api/favorites/check/:propertyId
const checkFavorite = asyncHandler(async (req, res) => {
  const favorite = await Favorite.findOne({
    buyer: req.user.id,
    property: req.params.propertyId,
  });

  res.status(200).json(
    new ApiResponse(200, { isFavorite: !!favorite }, 'Favorite status checked.')
  );
});

module.exports = { getFavorites, addFavorite, removeFavorite, checkFavorite };
