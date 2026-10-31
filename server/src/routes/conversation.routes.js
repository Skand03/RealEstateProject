const express = require('express');
const router = express.Router();
const {
  createOrGetConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} = require('../controllers/conversation.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { conversationValidator, messageValidator } = require('../validators/message.validator');

router.use(authMiddleware);

router.post('/', conversationValidator, createOrGetConversation);
router.get('/', getMyConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', messageValidator, sendMessage);

module.exports = router;
