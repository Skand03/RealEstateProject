const Property = require('../models/Property.model');
const Review = require('../models/Review.model');

/**
 * Recalculates and updates a property's average rating and review count.
 * Called after any review is created or deleted.
 */
const updatePropertyRating = async (propertyId) => {
  const stats = await Review.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: '$property',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    // No reviews left — reset
    await Property.findByIdAndUpdate(propertyId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

module.exports = { updatePropertyRating };
