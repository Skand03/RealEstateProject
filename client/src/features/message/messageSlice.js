import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { conversationService } from '../../services/conversation.service';

export const fetchConversations = createAsyncThunk(
  'message/fetchConversations',
  async (params, { rejectWithValue }) => {
    try {
      const res = await conversationService.getConversations(params);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conversations.');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'message/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const res = await conversationService.getMessages(conversationId);
      return { conversationId, ...res.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages.');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/send',
  async ({ conversationId, content }, { rejectWithValue }) => {
    try {
      const res = await conversationService.sendMessage(conversationId, content);
      return { conversationId, message: res.data.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message.');
    }
  }
);

export const createOrGetConversation = createAsyncThunk(
  'message/createConversation',
  async (propertyId, { rejectWithValue }) => {
    try {
      const res = await conversationService.createOrGetConversation(propertyId);
      return res.data.data.conversation;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start conversation.');
    }
  }
);

const messageSlice = createSlice({
  name: 'message',
  initialState: {
    conversations: [],
    messages: {},
    activeConversation: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations = action.payload.conversations;
        state.loading = false;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages[action.payload.conversationId] = action.payload.messages;
        state.loading = false;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
        // Update last message in conversation list
        const conv = state.conversations.find((c) => c._id === conversationId);
        if (conv) {
          conv.lastMessage = message.content;
          conv.lastMessageAt = message.createdAt;
        }
      })
      .addCase(createOrGetConversation.fulfilled, (state, action) => {
        state.activeConversation = action.payload;
        const exists = state.conversations.find((c) => c._id === action.payload._id);
        if (!exists) state.conversations.unshift(action.payload);
      });
  },
});

export const { setActiveConversation, clearError } = messageSlice.actions;
export const selectConversations = (state) => state.message.conversations;
export const selectMessages = (conversationId) => (state) =>
  state.message.messages[conversationId] || [];
export const selectActiveConversation = (state) => state.message.activeConversation;
export const selectMessageLoading = (state) => state.message.loading;

export default messageSlice.reducer;
