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
const User = require('./models/User');
const { initializeSocket } = require('./utils/notifications');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
});
const PORT = process.env.PORT || 3000;

const connectDB = require('./DB/Connection');
connectDB();

initializeSocket(io);

// Store online users for chat
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    console.log(`User ${userId} joined room user_${userId}`);
    socket.join(`user_${userId}`);
  });

  // Chat functionality
  socket.on('joinChat', (userData) => {
    if (userData.userId && userData.username) {
      onlineUsers.set(socket.id, userData);
      socket.join('globalChat');
      socket.join(`user_${userData.userId}`); // Join user's notification room
      
      // Broadcast updated online users list
      const usersList = Array.from(onlineUsers.values());
      io.to('globalChat').emit('onlineUsers', usersList);
    }
  });

  socket.on('sendChatMessage', (message) => {
    // Broadcast message to all users in global chat
    io.to('globalChat').emit('chatMessage', message);
  });

  socket.on('sendPrivateMessage', (message) => {
    console.log('Server received private message:', message);
    // Send private message to specific user
    io.to(`user_${message.to}`).emit('privateMessage', message);
    console.log(`Sent message to user_${message.to}`);
  });
  
  socket.on('disconnect', () => {
    // Remove user from online users
    onlineUsers.delete(socket.id);
    
    // Broadcast updated online users list
    const usersList = Array.from(onlineUsers.values());
    io.to('globalChat').emit('onlineUsers', usersList);
    
    console.log('User disconnected');
  });
});
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

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Frontend should connect to: http://localhost:3000');
  console.log('Account deletion job started');
  console.log('Socket.IO initialized');
});