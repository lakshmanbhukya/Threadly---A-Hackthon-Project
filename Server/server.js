require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/user');
const threadRoutes = require('./routes/thread');
const postRoutes = require('./routes/post');
const notificationRoutes = require('./routes/notification');
const healthRoutes = require('./routes/health');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const User = require('./models/User');
const { initializeSocket } = require('./utils/notifications');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://3.110.124.251:3000',
    credentials: true
  }
});
const PORT = process.env.PORT || 3000;

const connectDB = require('./DB/Connection');
connectDB();
// Store online users for chat
const onlineUsers = new Map(); // username -> socketId
const deleteExpiredAccounts = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await User.deleteMany({
      deletionRequested: true,
      deletionRequestDate: { $lte: thirtyDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      console.log(`Deleted ${result.deletedCount} expired accounts`);
    }
  } catch (error) {
    console.error('Error deleting expired accounts:', error);
  }
};

setInterval(deleteExpiredAccounts, 60 * 60 * 1000);
deleteExpiredAccounts();
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.use('/users', userRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/threads', threadRoutes);
app.use('/posts', postRoutes);
app.use('/notifications', notificationRoutes);
app.use('/', healthRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);
app.use('/chat', chatRoutes);

// WebSocket chat functionality
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their username
  socket.on('join', (username) => {
    socket.username = username;
    onlineUsers.set(username, socket.id);
    
    // Broadcast updated online users list
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
  });

  // Join specific conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave conversation room
  socket.on('leaveConversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Handle private messages
  socket.on('sendMessage', (data) => {
    const { conversationId, message } = data;
    
    // Broadcast to all users in the conversation
    socket.to(conversationId).emit('newMessage', {
      ...message,
      conversation: conversationId,
      timestamp: new Date().toISOString()
    });
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { conversationId, isTyping } = data;
    socket.to(conversationId).emit('userTyping', {
      userId: socket.userId,
      isTyping
    });
  });

  // Handle message read receipts
  socket.on('messageRead', (data) => {
    const { conversationId, messageId } = data;
    socket.to(conversationId).emit('messageRead', {
      messageId,
      readBy: socket.userId,
      readAt: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.username) {
      onlineUsers.delete(socket.username);
      // Broadcast updated online users list
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Account deletion job started');
  console.log('Socket.IO chat initialized');
});