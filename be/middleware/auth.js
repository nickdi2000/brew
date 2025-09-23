const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatError } = require('../utils/responseFormatter');

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(formatError('Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user from the database
    const user = await User.findById(decoded.userId).populate('organizations');
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Store both decoded token and user object
    const userObj = user.toObject();
    req.user = {
      ...userObj,
      organizations: userObj.organizations // Now contains the populated organizations data
    };
    req.token = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatError('Invalid token'));
    }
    res.status(500).json(formatError('Authentication error', error.message));
  }
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json(formatError('Access denied. Admin privileges required.'));
  }
  next();
};
