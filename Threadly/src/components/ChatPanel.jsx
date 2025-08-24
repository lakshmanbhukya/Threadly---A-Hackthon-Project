import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../hooks/useSocket";

const ChatPanel = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (socket && isOpen) {
      // Join global chat room
      socket.emit('joinChat', { userId: user?._id, username: user?.username });

      // Listen for messages
      socket.on('chatMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      // Listen for online users
      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off('chatMessage');
        socket.off('onlineUsers');
      };
    }
  }, [socket, isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      username: user?.username || 'Anonymous',
      userId: user?._id,
      timestamp: new Date().toISOString()
    };

    socket.emit('sendChatMessage', message);
    setNewMessage("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-md bg-card h-full shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Global Chat</h2>
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {onlineUsers.length} online
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Online Users */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>Online: </span>
            <div className="flex flex-wrap gap-1">
              {onlineUsers.slice(0, 5).map((onlineUser, index) => (
                <span key={index} className="bg-muted px-2 py-1 rounded text-xs">
                  {onlineUser.username}
                </span>
              ))}
              {onlineUsers.length > 5 && (
                <span className="text-xs">+{onlineUsers.length - 5} more</span>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-8">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.userId === user?._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.userId === user?._id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">
                    {message.username} • {formatTime(message.timestamp)}
                  </div>
                  <div className="text-sm">{message.text}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              maxLength={500}
            />
            <Button type="submit" size="sm" disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;