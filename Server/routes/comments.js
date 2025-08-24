const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const { requireAuth } = require('../middleware/validation'); 
const router = express.Router();

// Create a comment
router.post('/create', requireAuth, async (req, res) => {
  try {
    const { content, postId, threadId, isAnonymous } = req.body;
    const userId = req.session.userId;

    if (!content || (!postId && !threadId)) {
      return res.status(400).json({ error: 'Content and either postId or threadId are required' });
    }

    if (postId) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
    }

    const comment = new Comment({
      content,
      postId: postId || null,
      threadId: threadId || null,
      createdBy: userId,
      isAnonymous: isAnonymous === 'true'
    });

    await comment.save();
    const populatedComment = await comment.populate('createdBy', 'username profilePicture');

    res.status(201).json({ message: 'Comment created', comment: populatedComment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Get all comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .populate('createdBy', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Get all comments for a thread
router.get('/thread/:threadId', async (req, res) => {
  try {
    const comments = await Comment.find({ threadId: req.params.threadId, postId: null })
      .populate('createdBy', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Like/unlike a comment
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const isLiked = comment.likes.includes(userId);
    if (isLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    res.json({ 
      message: isLiked ? 'Comment unliked' : 'Comment liked', 
      likesCount: comment.likes.length, 
      isLiked: !isLiked 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// Delete a comment
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    const user = await User.findById(userId);
    const isOwner = comment.createdBy.toString() === userId.toString();
    const isAdmin = user.isAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
