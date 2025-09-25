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
    
    // Get organization ID from headers, query, token, or user's first organization
    const headerOrgId = req.headers['x-organization-id'];
    const queryOrgId = req.query.organizationId;
    const tokenOrgId = decoded.organization;

    let resolvedOrgId = headerOrgId || queryOrgId || tokenOrgId || userObj.organization;
    if (!resolvedOrgId && Array.isArray(userObj.organizations) && userObj.organizations.length > 0) {
      const firstOrg = userObj.organizations[0];
      resolvedOrgId = (firstOrg && (firstOrg._id || firstOrg)) || null;
    }

    // Normalize to string ID
    if (resolvedOrgId && typeof resolvedOrgId === 'object' && resolvedOrgId._id) {
      resolvedOrgId = resolvedOrgId._id;
    }

    req.user = {
      ...userObj,
      organizations: userObj.organizations, // Contains the populated organizations data
      // Provide a consistent shape for controllers expecting organization._id
      organization: resolvedOrgId ? { _id: resolvedOrgId } : null,
      organizationId: resolvedOrgId || null
    };
    req.organizationId = resolvedOrgId || null; // Make it easily accessible
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

// Optional authentication: populate req.user if a valid token is provided,
// otherwise continue as public access without failing the request.
exports.optionalAuthenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).populate('organizations');
    if (!user) {
      return next();
    }

    const userObj = user.toObject();
    const headerOrgId = req.headers['x-organization-id'];
    const queryOrgId = req.query.organizationId;
    const tokenOrgId = decoded.organization;

    let resolvedOrgId = headerOrgId || queryOrgId || tokenOrgId || userObj.organization;
    if (!resolvedOrgId && Array.isArray(userObj.organizations) && userObj.organizations.length > 0) {
      const firstOrg = userObj.organizations[0];
      resolvedOrgId = (firstOrg && (firstOrg._id || firstOrg)) || null;
    }

    if (resolvedOrgId && typeof resolvedOrgId === 'object' && resolvedOrgId._id) {
      resolvedOrgId = resolvedOrgId._id;
    }

    req.user = {
      ...userObj,
      organizations: userObj.organizations,
      organization: resolvedOrgId ? { _id: resolvedOrgId } : null,
      organizationId: resolvedOrgId || null
    };
    req.organizationId = resolvedOrgId || null;
    req.token = decoded;
  } catch (error) {
    // If token is invalid, treat as unauthenticated for this optional path
    return next();
  }

  return next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json(formatError('Access denied. Admin privileges required.'));
  }
  next();
};
