import api from './api';

export const conversationService = {
  createOrGetConversation: (propertyId) =>
    api.post('/conversations', { propertyId }),
  getConversations: (params) => api.get('/conversations', { params }),
  getMessages: (conversationId, params) =>
    api.get(`/conversations/${conversationId}/messages`, { params }),
  sendMessage: (conversationId, content) =>
    api.post(`/conversations/${conversationId}/messages`, { content }),
};
