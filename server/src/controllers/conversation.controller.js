const Conversation = require('../models/Conversation.model');
const Message = require('../models/Message.model');
const Property = require('../models/Property.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const validateRequest = require('../utils/validateRequest');
const { getPagination, buildPaginationMeta } = require('../utils/pagination');

// POST /api/conversations (buyer initiates)
const createOrGetConversation = asyncHandler(async (req, res) => {
  validateRequest(req);

  const { propertyId } = req.body;

  const property = await Property.findById(propertyId);
  if (!property) throw new ApiError(404, 'Property not found.');

  // Prevent seller from messaging themselves
  if (property.seller.toString() === req.user.id) {
    throw new ApiError(400, 'You cannot start a conversation about your own property.');
  }

  // Check if conversation already exists
  let conversation = await Conversation.findOne({
    property: propertyId,
    buyer: req.user.id,
    seller: property.seller,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      property: propertyId,
      buyer: req.user.id,
      seller: property.seller,
    });
  }

  await conversation.populate([
    { path: 'property', select: 'title city images price' },
    { path: 'buyer', select: 'fullName email avatar' },
    { path: 'seller', select: 'fullName email avatar' },
  ]);

  res.status(200).json(
    new ApiResponse(200, { conversation }, 'Conversation ready.')
  );
});

// GET /api/conversations (authenticated user — own conversations)
const getMyConversations = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  // Find conversations where user is either buyer or seller
  const query = {
    $or: [{ buyer: req.user.id }, { seller: req.user.id }],
  };

  const [conversations, total] = await Promise.all([
    Conversation.find(query)
      .populate('property', 'title city images price')
      .populate('buyer', 'fullName email avatar')
      .populate('seller', 'fullName email avatar')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit),
    Conversation.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { conversations, pagination: buildPaginationMeta(total, page, limit) },
      'Conversations fetched.'
    )
  );
});

// GET /api/conversations/:id/messages
const getMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  // Verify participant
  const isParticipant =
    conversation.buyer.toString() === req.user.id ||
    conversation.seller.toString() === req.user.id;

  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this conversation.');
  }

  const [messages, total] = await Promise.all([
    Message.find({ conversation: req.params.id })
      .populate('sender', 'fullName avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Message.countDocuments({ conversation: req.params.id }),
  ]);

  // Mark messages as read (messages from other party)
  await Message.updateMany(
    {
      conversation: req.params.id,
      sender: { $ne: req.user.id },
      isRead: false,
    },
    { isRead: true }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { messages, pagination: buildPaginationMeta(total, page, limit) },
      'Messages fetched.'
    )
  );
});

// POST /api/conversations/:id/messages
const sendMessage = asyncHandler(async (req, res) => {
  validateRequest(req);

  const conversation = await Conversation.findById(req.params.id);
  if (!conversation) throw new ApiError(404, 'Conversation not found.');

  // Verify participant
  const isParticipant =
    conversation.buyer.toString() === req.user.id ||
    conversation.seller.toString() === req.user.id;

  if (!isParticipant) {
    throw new ApiError(403, 'You do not have access to this conversation.');
  }

  const message = await Message.create({
    conversation: req.params.id,
    sender: req.user.id,
    content: req.body.content,
  });

  // Update conversation lastMessage
  conversation.lastMessage = req.body.content.substring(0, 100);
  conversation.lastMessageAt = new Date();
  await conversation.save();

  await message.populate('sender', 'fullName avatar');

  res.status(201).json(
    new ApiResponse(201, { message }, 'Message sent.')
  );
});

module.exports = {
  createOrGetConversation,
  getMyConversations,
  getMessages,
  sendMessage,
};
