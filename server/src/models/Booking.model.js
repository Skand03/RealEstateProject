const mongoose = require('mongoose');
const { BOOKING_STATUS } = require('../utils/constants');

const bookingSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    requestedDate: {
      type: Date,
      required: [true, 'Requested visit date is required'],
    },
    requestedTime: {
      type: String,
      required: [true, 'Requested visit time is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    sellerNote: {
      type: String,
      trim: true,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
bookingSchema.index({ buyer: 1 });
bookingSchema.index({ seller: 1 });
bookingSchema.index({ property: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ buyer: 1, property: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
