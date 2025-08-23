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
const User = require('./models/User');
const { initializeSocket } = require('./utils/notifications');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});
const PORT = process.env.PORT || 3000;

// MongoDB connection
const connectDB = require('./DB/Connection');
connectDB();

// Initialize Socket.IO
initializeSocket(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Auto-delete accounts after 30 days
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

// Run deletion check every hour
setInterval(deleteExpiredAccounts, 60 * 60 * 1000);
// Run once on startup
deleteExpiredAccounts();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Routes
app.use('/users', userRoutes);
app.use('/threads', threadRoutes);
app.use('/posts', postRoutes);
app.use('/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Account deletion job started');
  console.log('Socket.IO initialized');
});