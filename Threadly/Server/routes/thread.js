const express = require('express');
const Thread = require('../models/Thread');
const { requireAuth, validateThread } = require('../middleware/validation');
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

module.exports = router;