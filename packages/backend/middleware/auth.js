const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const authConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../auth.json'), 'utf8'));
const JWT_SECRET = process.env.JWT_SECRET || 'expenses-secret-key';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Check if it's a predefined token
  if (authConfig.tokens.includes(token)) {
    req.user = { type: 'service' };
    return next();
  }

  // Verify JWT token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken, authConfig, JWT_SECRET };