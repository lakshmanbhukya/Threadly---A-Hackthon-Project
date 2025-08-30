const validateRegistration = (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { logintoken, password } = req.body;
  
  if (!logintoken || !password) {
    return res.status(400).json({ error: 'Login token and password required' });
  }
  
  if (logintoken.length < 3) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Invalid login credentials' });
  }
  
  next();
};

const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

const validateThread = (req, res, next) => {
  const { title, description, topic } = req.body;
  
  if (!title || !description || !topic) {
    return res.status(400).json({ error: 'Title, description, and topic are required' });
  }
  
  if (title.trim().length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters' });
  }
  
  if (description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters' });
  }
  
  if (topic.trim().length < 2) {
    return res.status(400).json({ error: 'Topic must be at least 2 characters' });
  }
  
  next();
};

const validatePost = (req, res, next) => {
  const { content } = req.body;
  const hasFiles = req.files && req.files.length > 0;
  
  if ((!content || content.trim().length === 0) && !hasFiles) {
    return res.status(400).json({ error: 'Post content or media is required' });
  }
  
  if (content && content.trim().length > 2000) {
    return res.status(400).json({ error: 'Post content must be less than 2000 characters' });
  }
  
  next();
};

module.exports = { validateRegistration, validateLogin, requireAuth, validateThread, validatePost };