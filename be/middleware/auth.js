const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { formatError } = require('../utils/responseFormatter');

// Helper function to get the user's primary organization ID
const getUserPrimaryOrganization = (user) => {
  // For admin users, always use their first (and typically only) organization
  if (user.isAdmin && user.organizations && user.organizations.length > 0) {
    const orgId = user.organizations[0]._id || user.organizations[0];
    console.log(`🏢 Admin user ${user.email} organization: ${orgId}`);
    return orgId;
  }
  
  // For non-admin users, we might have different logic in the future
  if (user.organizations && user.organizations.length > 0) {
    return user.organizations[0]._id || user.organizations[0];
  }
  
  return null;
};

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json(formatError('Access denied. No token provided.'));
  }

  try {
    // Debug token format
    if (!token || token.length < 10) {
      console.error('❌ Invalid token format received:', {
        tokenLength: token?.length || 0,
        tokenStart: token?.substring(0, 10) || 'null',
        headers: req.headers.authorization
      });
      return res.status(401).json(formatError('Invalid token format'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch the user from the database
    const user = await User.findById(decoded.userId).populate('organizations');
    if (!user) {
      return res.status(404).json(formatError('User not found'));
    }

    // Store both decoded token and user object
    const userObj = user.toObject();
    
    // For admin users, always use their primary organization
    // This ensures admins can only access data from their own organization
    let resolvedOrgId = null;
    if (userObj.isAdmin) {
      resolvedOrgId = getUserPrimaryOrganization(userObj);
      if (!resolvedOrgId) {
        console.error('❌ Admin user has no organization:', userObj.email);
        return res.status(403).json(formatError('Admin user must be associated with an organization'));
      }
    } else {
      // For non-admin users, check headers/query/token for organization context
      const headerOrgId = req.headers['x-organization-id'];
      const queryOrgId = req.query.organizationId;
      const tokenOrgId = decoded.organization;
      resolvedOrgId = headerOrgId || queryOrgId || tokenOrgId || getUserPrimaryOrganization(userObj);
    }

    // Normalize to string ID
    if (resolvedOrgId && typeof resolvedOrgId === 'object' && resolvedOrgId._id) {
      resolvedOrgId = resolvedOrgId._id;
    }

    // Validate organization ID format (MongoDB ObjectId)
    if (resolvedOrgId && !/^[0-9a-fA-F]{24}$/.test(resolvedOrgId)) {
      console.error('❌ Invalid organization ID format:', resolvedOrgId, 'for user:', userObj._id);
      resolvedOrgId = null;
    }

    // Get membership ID from headers
    const membershipId = req.headers['x-membership-id'];

    // If a membership is specified, prefer the membership's organization for org scoping when it belongs to the same user
    if (membershipId) {
      try {
        const Member = require('../models/Member');
        const membership = await Member.findById(membershipId).select('organization user');
        if (membership && String(membership.user) === String(userObj._id)) {
          resolvedOrgId = membership.organization?._id || membership.organization || resolvedOrgId;
        }
      } catch (e) {
        // Non-fatal if membership lookup fails
      }
    }

    req.user = {
      ...userObj,
      organizations: userObj.organizations, // Contains the populated organizations data
      // Provide a consistent shape for controllers expecting organization._id
      organization: resolvedOrgId ? { _id: resolvedOrgId } : null,
      organizationId: resolvedOrgId || null,
      membershipId: membershipId || null
    };
    req.organizationId = resolvedOrgId || null; // Make it easily accessible
    req.token = decoded;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', {
      name: error.name,
      message: error.message,
      tokenLength: token?.length || 0,
      tokenStart: token?.substring(0, 20) || 'null',
      url: req.url,
      method: req.method
    });
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatError('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatError('Token expired'));
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
    
    // For admin users, always use their primary organization
    let resolvedOrgId = null;
    if (userObj.isAdmin) {
      resolvedOrgId = getUserPrimaryOrganization(userObj);
    } else {
      // For non-admin users, check headers/query/token for organization context
      const headerOrgId = req.headers['x-organization-id'];
      const queryOrgId = req.query.organizationId;
      const tokenOrgId = decoded.organization;
      resolvedOrgId = headerOrgId || queryOrgId || tokenOrgId || getUserPrimaryOrganization(userObj);
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
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json(formatError('Access denied. Admin privileges required.'));
  }
  next();
};

// Allow access if admin, otherwise require the path param :memberId to match the authenticated membership
exports.requireAdminOrSelfMembership = (memberIdParamName = 'memberId') => (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) return next();
    const memberId = req.params[memberIdParamName];
    if (!memberId) {
      return res.status(400).json(formatError('Member ID is required'));
    }
    if (!req.user || !req.user.membershipId) {
      return res.status(403).json(formatError('Access denied'));
    }
    if (String(req.user.membershipId) !== String(memberId)) {
      return res.status(403).json(formatError('Access denied'));
    }
    return next();
  } catch (e) {
    return res.status(500).json(formatError('Authorization error', e.message));
  }
};
