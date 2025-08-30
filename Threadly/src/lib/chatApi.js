import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

const chatApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get user's conversations
export const fetchConversations = async () => {
  try {
    const response = await chatApi.get('/chat/conversations');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
  }
};

// Create or get conversation with another user
export const createConversation = async (participantId) => {
  try {
    const response = await chatApi.post('/chat/conversations', {
      participantId,
      type: 'direct'
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create conversation');
  }
};

// Get messages for a conversation
export const fetchMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await chatApi.get(`/chat/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch messages');
  }
};

// Send a message
export const sendMessage = async (conversationId, content, type = 'text') => {
  try {
    const response = await chatApi.post(`/chat/conversations/${conversationId}/messages`, {
      content,
      type
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
  try {
    const response = await chatApi.put(`/chat/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to mark messages as read');
  }
};

// Get online users
export const fetchOnlineUsers = async () => {
  try {
    const response = await chatApi.get('/chat/users/online');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch online users');
  }
};

export default chatApi;