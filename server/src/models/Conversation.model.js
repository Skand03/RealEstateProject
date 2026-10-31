const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
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
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index — one conversation per property per buyer-seller pair
conversationSchema.index(
  { property: 1, buyer: 1, seller: 1 },
  { unique: true }
);
conversationSchema.index({ buyer: 1 });
conversationSchema.index({ seller: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
