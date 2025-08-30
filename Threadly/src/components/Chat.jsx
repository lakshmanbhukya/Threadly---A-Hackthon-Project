import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Search, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { createConversation, fetchOnlineUsers } from '../lib/chatApi';
import { toast } from 'sonner';

const Chat = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const {
    conversations,
    activeConversation,
    messages,
    onlineUsers,
    typingUsers,
    unreadCounts,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTypingIndicator,
    loadConversations
  } = useChat();
  
  const [localConversations, setLocalConversations] = useState(conversations);

  const [newMessage, setNewMessage] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (showNewChat) {
      loadAvailableUsers();
    }
  }, [showNewChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadAvailableUsers = async () => {
    try {
      const data = await fetchOnlineUsers();
      setAvailableUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      await sendMessage(activeConversation._id, newMessage);
      setNewMessage('');
      
      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(false);
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  };

  const handleStartNewChat = async (userId) => {
    try {
      const data = await createConversation(userId);
      
      // Refresh conversations list
      loadConversations();
      
      joinConversation(data.conversation);
      setShowNewChat(false);
      setSearchQuery('');
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = (conversation) => {
    const currentUsername = user?.username || sessionStorage.getItem('username') || localStorage.getItem('username');
    return conversation.participants.find(p => p.username !== currentUsername);
  };

  const filteredUsers = availableUsers.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-4xl bg-card h-full shadow-lg flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewChat(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* New Chat Modal */}
          {showNewChat && (
            <div className="absolute inset-0 bg-card z-10 flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-semibold">New Message</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewChat(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="p-4">
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => handleStartNewChat(u._id)}
                    className="p-4 hover:bg-muted cursor-pointer border-b border-border"
                  >
                    <div className="flex items-center space-x-3">
                      {u.profilePicture ? (
                        <img 
                          src={u.profilePicture} 
                          alt={u.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">
                            {u.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{u.username}</p>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = getOtherParticipant(conversation);
                const unreadCount = unreadCounts[conversation._id] || 0;
                
                return (
                  <div
                    key={conversation._id}
                    onClick={() => joinConversation(conversation)}
                    className={`p-4 cursor-pointer border-b border-border hover:bg-muted ${
                      activeConversation?._id === conversation._id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        {otherUser?.profilePicture ? (
                          <img 
                            src={otherUser.profilePicture} 
                            alt={otherUser.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-sm">
                              {otherUser?.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{otherUser?.username}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                        {conversation.lastActivity && (
                          <p className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastActivity)}
                          </p>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  {getOtherParticipant(activeConversation)?.profilePicture ? (
                    <img 
                      src={getOtherParticipant(activeConversation).profilePicture} 
                      alt={getOtherParticipant(activeConversation).username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">
                        {getOtherParticipant(activeConversation)?.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium">
                      {getOtherParticipant(activeConversation)?.username}
                    </p>

                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const senderUsername = typeof message.sender === 'object' ? message.sender.username : 'Unknown';
                  const isOwnMessage = senderUsername === user?.username;
                  
                  return (
                    <div
                      key={message._id}
                      className={`flex w-full ${
                        isOwnMessage ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-md lg:max-w-lg px-3 py-1 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className="text-[10px] opacity-70 mt-1 text-right">
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                
                {/* Typing indicator */}
                {Object.entries(typingUsers).some(([userId, isTyping]) => 
                  isTyping && userId !== user._id
                ) && (
                  <div className="flex justify-start">
                    <div className="bg-muted text-foreground px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={handleInputChange}
                    placeholder="Type a message..."
                    className="flex-1"
                    maxLength={1000}
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;