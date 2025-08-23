const express = require('express');
const Thread = require('../models/Thread');
const User = require('../models/User');
const { requireAuth, validateThread } = require('../middleware/validation');
const { notifyNewThread } = require('../utils/notifications');
const router = express.Router();

router.post('/create', requireAuth, validateThread, async (req, res) => {
  try {
    const { title, description, topic } = req.body;
    
    const thread = new Thread({
      title: title.trim(),
      description: description.trim(),
      topic: topic.trim(),
      createdBy: req.session.userId
    });
    
    await thread.save();
    
    // Send notifications
    notifyNewThread(thread);
    
    res.status(201).json({ 
      message: 'Thread created successfully', 
      threadId: thread._id 
    });
  } catch (error) {
    res.status(500).json({ error: 'Thread creation failed' });
  }
});

router.get('/', async (req, res) => {
  try {
    const threads = await Thread.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch threads' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    res.json({ thread });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

router.put('/:id', requireAuth, validateThread, async (req, res) => {
  try {
    const { title, description, topic } = req.body;
    
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    if (thread.createdBy.toString() !== req.session.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to update this thread' });
    }
    
    const updatedThread = await Thread.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description.trim(),
        topic: topic.trim()
      },
      { new: true }
    ).populate('createdBy', 'username');
    
    res.json({ 
      message: 'Thread updated successfully', 
      thread: updatedThread 
    });
  } catch (error) {
    res.status(500).json({ error: 'Thread update failed' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const thread = await Thread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    const user = await User.findById(req.session.userId);
    const isOwner = thread.createdBy.toString() === req.session.userId.toString();
    const isAdmin = user.isAdmin;
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this thread' });
    }
    
    await Thread.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Thread deletion failed' });
  }
});

module.exports = router;