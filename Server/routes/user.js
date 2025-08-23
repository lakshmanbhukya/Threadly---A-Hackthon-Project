const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { upload, uploadToCloudinary } = require('../middleware/upload');
const router = express.Router();

router.get('/auto-login', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'No valid session' });
  }
  
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Auto-login successful', 
      user: { id: user._id, username: user.username } 
    });
  } catch (error) {
    req.session.destroy();
    res.status(401).json({ error: 'Invalid session' });
  }
});


router.post('/register', validateRegistration, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});


router.post('/login', validateLogin, async (req, res) => {
  try {
    const { logintoken, password } = req.body;
    
    if (!logintoken || !password) {
      return res.status(400).json({ error: 'Login token and password required' });
    }
    
    const user = await User.findOne({
      $or: [
        { email: logintoken },
        { username: logintoken }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive or scheduled for deletion' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user._id;
    
    res.json({ message: 'Login successful', user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});


router.put('/profile', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { username, about, phone, location } = req.body;
    
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.session.userId } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    const updateData = {};
    if (username) updateData.username = username;
    if (about !== undefined) updateData.about = about;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    
    const user = await User.findByIdAndUpdate(req.session.userId, updateData, { new: true });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        about: user.about,
        profilePicture: user.profilePicture,
        phone: user.phone,
        location: user.location
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

router.put('/password', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.session.userId, { password: hashedNewPassword });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password update failed' });
  }
});

router.delete('/account', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);
    
    await User.findByIdAndUpdate(req.session.userId, {
      isActive: false,
      deletionRequested: true,
      deletionRequestDate: new Date()
    });
    
    req.session.destroy();
    
    res.json({ 
      message: 'Account deletion requested. Account will be deleted in 30 days.',
      deletionDate: deletionDate.toISOString().split('T')[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Account deletion request failed' });
  }
});

router.post('/account/cancel-deletion', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const user = await User.findOne({ email, deletionRequested: true });
    if (!user) {
      return res.status(404).json({ error: 'No deletion request found for this account' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await User.findByIdAndUpdate(user._id, {
      isActive: true,
      deletionRequested: false,
      deletionRequestDate: null
    });
    
    res.json({ message: 'Account deletion cancelled. Account reactivated.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel account deletion' });
  }
});

router.post('/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = await uploadToCloudinary(req.file.buffer);
    
    await User.findByIdAndUpdate(req.session.userId, { profilePicture: imageUrl });
    
    res.json({ message: 'Profile picture updated successfully', profilePicture: imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Profile picture upload failed' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful' });
  });
});


module.exports = router;