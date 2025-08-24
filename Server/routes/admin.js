const express = require('express');
const { requireAdmin } = require('../middleware/adminAuth');
const User = require('../models/User');
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const router = express.Router();

// Get all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all threads
router.get('/threads', requireAdmin, async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

// Get all posts
router.get('/posts', requireAdmin, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('createdBy', 'username')
      .populate('threadId', 'title')
      .sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Delete user immediately (admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete user's threads and posts
    await Thread.deleteMany({ createdBy: userId });
    await Post.deleteMany({ createdBy: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'User and all content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete thread
router.delete('/threads/:id', requireAdmin, async (req, res) => {
  try {
    await Thread.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ threadId: req.params.id });
    res.json({ message: 'Thread and related posts deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete thread' });
  }
});

// Delete post
router.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Toggle user admin status
router.put('/users/:id/admin', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: 'User admin status updated', isAdmin: user.isAdmin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user admin status' });
  }
});

module.exports = router;