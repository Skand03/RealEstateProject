const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');
const { uploadPropertyImage, deleteFromCloudinary } = require('../services/cloudinary.service');
const { createSellerCommission } = require('../services/commission.service');
const { PROPERTY_STATUS, ROLES } = require('../utils/constants');

// GET /api/properties (public + filtered + paginated)
const getProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const {
    search,
    city,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    furnishingStatus,
    amenities,
    sortBy,
  } = req.query;

  const query = { status: PROPERTY_STATUS.ACTIVE };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // City filter (case-insensitive)
  if (city) {
    query.city = { $regex: city, $options: 'i' };
  }

  if (propertyType) query.propertyType = propertyType;
  if (listingType) query.listingType = listingType;

  // Price range
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
  if (bathrooms) query.bathrooms = { $gte: Number(bathrooms) };
  if (furnishingStatus) query.furnishingStatus = furnishingStatus;

  // Amenities filter (all specified amenities must exist)
  if (amenities) {
    const amenityList = Array.isArray(amenities) ? amenities : amenities.split(',');
    query.amenities = { $all: amenityList };
  }

  // Sorting
  let sort = { createdAt: -1 }; // default: newest
  if (sortBy === 'price_asc') sort = { price: 1 };
  else if (sortBy === 'price_desc') sort = { price: -1 };
  else if (sortBy === 'oldest') sort = { createdAt: 1 };

  const [properties, total] = await Promise.all([
    Property.find(query)
      .populate('seller', 'fullName email phone avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Property.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { properties, pagination: buildPaginationMeta(total, page, limit) },
      'Properties fetched.'
    )
  );
});

// GET /api/properties/:id (public)
const getPropertyById = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate('seller', 'fullName email phone avatar createdAt');

  if (!property) throw new ApiError(404, 'Property not found.');

  res.status(200).json(
    new ApiResponse(200, { property }, 'Property fetched.')
  );
});

// GET /api/properties/seller/mine (seller — own listings)
const getMyProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { status } = req.query;

  const query = { seller: req.user.id };
  if (status) query.status = status;

  const [properties, total] = await Promise.all([
    Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Property.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { properties, pagination: buildPaginationMeta(total, page, limit) },
      'Your properties fetched.'
    )
  );
});

// POST /api/properties (verified seller only)
const createProperty = asyncHandler(async (req, res) => {
  validateRequest(req);

  const {
    title, description, propertyType, listingType, price,
    city, state, address, latitude, longitude,
    bedrooms, bathrooms, area, furnishingStatus, amenities,
  } = req.body;

  // Upload images
  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      uploadPropertyImage(file.buffer, file.originalname).then((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: index === 0,
      }))
    );
    images = await Promise.all(uploadPromises);
  }

  const amenityList = amenities
    ? (Array.isArray(amenities) ? amenities : JSON.parse(amenities))
    : [];

  const property = await Property.create({
    title,
    description,
    propertyType,
    listingType,
    price: Number(price),
    city,
    state,
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    bedrooms: Number(bedrooms) || 0,
    bathrooms: Number(bathrooms) || 0,
    area: Number(area),
    furnishingStatus: furnishingStatus || '',
    amenities: amenityList,
    images,
    seller: req.user.id,
    status: PROPERTY_STATUS.ACTIVE,
  });

  // Create seller commission record
  await createSellerCommission(property);

  const populatedProperty = await Property.findById(property._id)
    .populate('seller', 'fullName email phone');

  res.status(201).json(
    new ApiResponse(201, { property: populatedProperty }, 'Property listed successfully.')
  );
});

// PATCH /api/properties/:id (owner seller only)
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.seller.toString() !== req.user.id) {
    throw new ApiError(403, 'You are not authorized to update this property.');
  }

  const allowedFields = [
    'title', 'description', 'propertyType', 'listingType', 'price',
    'city', 'state', 'address', 'latitude', 'longitude',
    'bedrooms', 'bathrooms', 'area', 'furnishingStatus', 'amenities', 'status',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      property[field] = req.body[field];
    }
  });

  // Handle new image uploads
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) =>
      uploadPropertyImage(file.buffer, file.originalname).then((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        isPrimary: false,
      }))
    );
    const newImages = await Promise.all(uploadPromises);
    property.images = [...property.images, ...newImages].slice(0, 10);
  }

  await property.save();

  res.status(200).json(
    new ApiResponse(200, { property }, 'Property updated successfully.')
  );
});

// DELETE /api/properties/:id/images/:imageId (seller removes single image)
const deletePropertyImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.seller.toString() !== req.user.id && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Not authorized.');
  }

  const imageIndex = property.images.findIndex(
    (img) => img._id.toString() === req.params.imageId
  );

  if (imageIndex === -1) throw new ApiError(404, 'Image not found.');

  const image = property.images[imageIndex];
  await deleteFromCloudinary(image.publicId);

  property.images.splice(imageIndex, 1);

  // If deleted image was primary, set next as primary
  if (image.isPrimary && property.images.length > 0) {
    property.images[0].isPrimary = true;
  }

  await property.save();

  res.status(200).json(
    new ApiResponse(200, { property }, 'Image deleted successfully.')
  );
});

// PATCH /api/properties/:id/images/:imageId/primary (set primary image)
const setPrimaryImage = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found.');

  if (property.seller.toString() !== req.user.id) {
    throw new ApiError(403, 'Not authorized.');
  }

  property.images = property.images.map((img) => ({
    ...img.toObject(),
    isPrimary: img._id.toString() === req.params.imageId,
  }));

  await property.save();

  res.status(200).json(
    new ApiResponse(200, { property }, 'Primary image updated.')
  );
});

// DELETE /api/properties/:id
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);
  if (!property) throw new ApiError(404, 'Property not found.');

  // Only owner or admin can delete
  if (
    property.seller.toString() !== req.user.id &&
    req.user.role !== ROLES.ADMIN
  ) {
    throw new ApiError(403, 'You are not authorized to delete this property.');
  }

  // Delete all images from Cloudinary
  await Promise.all(
    property.images.map((img) => deleteFromCloudinary(img.publicId).catch(() => {}))
  );

  await Property.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Property deleted successfully.')
  );
});

module.exports = {
  getProperties,
  getPropertyById,
  getMyProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  deletePropertyImage,
  setPrimaryImage,
};
