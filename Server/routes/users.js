const express = require('express');
const User = require('../models/User');
const { requireAuth } = require('../middleware/validation');
const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.session.userId },
      isActive: true 
    }).select('username isAdmin').limit(50);
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;