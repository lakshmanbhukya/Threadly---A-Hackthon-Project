const express = require('express');
const Post = require('../models/Post');
const Thread = require('../models/Thread');
const User = require('../models/User');
const { uploadMedia, uploadMediaToCloudinary } = require('../middleware/upload');
const { validatePost } = require('../middleware/validation');
const { notifyNewPost, notifyPostLiked } = require('../utils/notifications');
const router = express.Router();

router.post('/create', uploadMedia.array('media', 5), validatePost, async (req, res) => {
  try {
    const { content, threadId, isAnonymous } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }


    if (threadId) {
      const thread = await Thread.findById(threadId);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }
    }

    const mediaFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadMediaToCloudinary(file.buffer, file.mimetype);
        mediaFiles.push(uploadResult);
      }
    }

    const post = new Post({
      content: content.trim(),
      media: mediaFiles,
      threadId: threadId || null,
      createdBy: (isAnonymous === 'true' || !req.session?.userId) ? null : req.session.userId,
      isAnonymous: isAnonymous === 'true'
    });

    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('createdBy', 'username')
      .populate('threadId', 'title');

    notifyNewPost(post);

    res.status(201).json({ 
      message: 'Post created successfully', 
      post: populatedPost 
    });
  } catch (error) {
    res.status(500).json({ error: 'Post creation failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { threadId, page = 1, limit = 10 } = req.query;
    const filter = threadId ? { threadId } : {};
    
    const posts = await Post.find(filter)
      .populate('createdBy', 'username')
      .populate('threadId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(filter);

    res.json({ 
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('createdBy', 'username')
      .populate('threadId', 'title');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.session.userId;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    if (!isLiked) {
      notifyPostLiked(post, userId);
    }

    res.json({ 
      message: isLiked ? 'Post unliked' : 'Post liked',
      likesCount: post.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const user = await User.findById(req.session.userId);
    const isOwner = post.createdBy && post.createdBy.toString() === req.session.userId.toString();
    const isAdmin = user.isAdmin;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Post deletion failed' });
  }
});

module.exports = router;