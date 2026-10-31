const mongoose = require('mongoose');
const {
  PROPERTY_TYPES,
  LISTING_TYPES,
  PROPERTY_STATUS,
  FURNISHING_STATUS,
} = require('../utils/constants');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: true }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: [true, 'Property type is required'],
    },
    listingType: {
      type: String,
      enum: Object.values(LISTING_TYPES),
      required: [true, 'Listing type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
      default: 0,
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
      default: 0,
    },
    area: {
      type: Number,
      required: [true, 'Area is required'],
      min: [1, 'Area must be at least 1 sq ft'],
    },
    furnishingStatus: {
      type: String,
      enum: [...FURNISHING_STATUS, ''],
      default: '',
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [imageSchema],
      default: [],
      validate: {
        validator: function (images) {
          return images.length <= 10;
        },
        message: 'Cannot upload more than 10 images',
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PROPERTY_STATUS),
      default: PROPERTY_STATUS.ACTIVE,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search/filter performance
propertySchema.index({ city: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ seller: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ city: 'text', title: 'text', address: 'text' });
propertySchema.index({ status: 1, listingType: 1, city: 1 });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;
