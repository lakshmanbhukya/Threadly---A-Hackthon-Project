import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from '../hooks/useSocket';
import { fetchConversations, fetchMessages, sendMessage as sendMessageApi } from '../lib/chatApi';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});

  // Load conversations when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    }
  }, [isAuthenticated, user]);

  // Socket event listeners
  useEffect(() => {
    const username = user?.username || sessionStorage.getItem('username') || localStorage.getItem('username');
    
    if (socket && username) {
      socket.emit('join', username);

      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      // Listen for new messages
      socket.on('newMessage', (message) => {
        setMessages(prev => ({
          ...prev,
          [message.conversation]: [
            ...(prev[message.conversation] || []),
            message
          ]
        }));

        // Update conversation list with new message
        setConversations(prev => 
          prev.map(conv => 
            conv._id === message.conversation 
              ? { ...conv, lastMessage: message, lastActivity: new Date() }
              : conv
          ).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        );

        // Update unread count if not in active conversation
        if (activeConversation?._id !== message.conversation) {
          setUnreadCounts(prev => ({
            ...prev,
            [message.conversation]: (prev[message.conversation] || 0) + 1
          }));
        }
      });

      // Listen for typing indicators
      socket.on('userTyping', ({ userId, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: isTyping
        }));
      });

      // Listen for message read receipts
      socket.on('messageRead', ({ messageId, readBy, readAt }) => {
        setMessages(prev => {
          const updatedMessages = { ...prev };
          Object.keys(updatedMessages).forEach(conversationId => {
            updatedMessages[conversationId] = updatedMessages[conversationId].map(msg => {
              if (msg._id === messageId) {
                return {
                  ...msg,
                  readBy: [...(msg.readBy || []), { user: readBy, readAt }]
                };
              }
              return msg;
            });
          });
          return updatedMessages;
        });
      });

      return () => {
        socket.off('onlineUsers');
        socket.off('newMessage');
        socket.off('userTyping');
        socket.off('messageRead');
      };
    }
  }, [socket, isAuthenticated, user, activeConversation]);

  const loadConversations = async () => {
    try {
      const data = await fetchConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await fetchMessages(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: data.messages
      }));
      
      // Clear unread count
      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async (conversationId, content) => {
    try {
      const data = await sendMessageApi(conversationId, content);
      const message = data.message;

      // Add message to local state
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), message]
      }));

      // Update or add conversation to list
      setConversations(prev => {
        const existingConvIndex = prev.findIndex(conv => conv._id === conversationId);
        if (existingConvIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingConvIndex] = {
            ...updated[existingConvIndex],
            lastMessage: message,
            lastActivity: new Date()
          };
          return updated.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
        } else if (data.conversation) {
          // Add new conversation
          return [{
            ...data.conversation,
            lastMessage: message,
            lastActivity: new Date()
          }, ...prev];
        }
        return prev;
      });

      // Emit to socket for real-time delivery
      if (socket) {
        socket.emit('sendMessage', {
          conversationId,
          message
        });
      }

      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const joinConversation = (conversation) => {
    setActiveConversation(conversation);
    
    if (socket) {
      socket.emit('joinConversation', conversation._id);
    }
    
    // Load messages if not already loaded
    if (!messages[conversation._id]) {
      loadMessages(conversation._id);
    }
  };

  const leaveConversation = () => {
    if (activeConversation && socket) {
      socket.emit('leaveConversation', activeConversation._id);
    }
    setActiveConversation(null);
  };

  const sendTypingIndicator = (isTyping) => {
    if (socket && activeConversation) {
      socket.emit('typing', {
        conversationId: activeConversation._id,
        isTyping
      });
    }
  };

  const value = {
    conversations,
    activeConversation,
    messages: messages[activeConversation?._id] || [],
    onlineUsers,
    typingUsers,
    unreadCounts,
    loadConversations,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};