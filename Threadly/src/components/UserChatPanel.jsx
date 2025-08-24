import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, User, Search } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { fetchUsers } from "../lib/users";

const UserChatPanel = ({ isOpen, onClose }) => {
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (socket && isOpen && user) {
      console.log('Setting up socket listeners for user:', user._id);
      
      socket.on('connect', () => {
        console.log('Socket connected in chat panel');
        setSocketConnected(true);
        socket.emit('join', user._id);
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected in chat panel');
        setSocketConnected(false);
      });
      
      socket.on('privateMessage', (data) => {
        console.log('Received private message:', data);
        const chatId = getChatId(user._id, data.from);
        setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), data]
        }));
      });

      // Check if already connected
      if (socket.connected) {
        setSocketConnected(true);
        socket.emit('join', user._id);
      }

      return () => {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('privateMessage');
      };
    }
  }, [socket, isOpen, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('_');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !activeChat) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      from: user._id,
      to: activeChat._id,
      fromUsername: user.username,
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', message);
    socket.emit('sendPrivateMessage', message);
    
    const chatId = getChatId(user._id, activeChat._id);
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
    
    setNewMessage("");
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full max-w-2xl bg-card h-full shadow-lg border-l border-border flex">
        {/* Users List */}
        <div className="w-1/3 border-r border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
              <h3 className="font-semibold">Messages</h3>
              <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`} title={socketConnected ? 'Connected' : 'Disconnected'} />
            </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredUsers.map((chatUser) => (
              <div
                key={chatUser._id}
                onClick={() => setActiveChat(chatUser)}
                className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 ${
                  activeChat?._id === chatUser._id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">
                      {chatUser.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{chatUser.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {chatUser.isAdmin ? 'Admin' : 'User'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-bold">
                      {activeChat.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{activeChat.username}</div>
                    <div className="text-xs text-muted-foreground">
                      {activeChat.isAdmin ? 'Admin' : 'User'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(messages[getChatId(user._id, activeChat._id)] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.from === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.from === user._id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <div className="text-sm">{message.text}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message ${activeChat.username}...`}
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    maxLength={500}
                  />
                  <Button type="submit" size="sm" disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a user to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserChatPanel;