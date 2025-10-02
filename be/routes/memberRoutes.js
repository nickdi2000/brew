const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth');
const memberController = require('../controllers/memberController');

// Request logging middleware
const logRequest = (req, res, next) => {
  console.log('🔍 Member API Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    params: req.params,
    user: req.user?._id,
    organization: req.user?.organization
  });
  next();
};

// Get all members for the organization
router.get('/', [logRequest, authenticateToken], memberController.getMembers);

// Get a specific member
router.get('/:id', authenticateToken, memberController.getMemberById);

// Create a new member
router.post('/', authenticateToken, memberController.createMember);

// Update a member
router.put('/:id', authenticateToken, memberController.updateMember);

// Delete a member
router.delete('/:id', authenticateToken, memberController.deleteMember);

// Update member status
router.patch('/:id/status', authenticateToken, memberController.updateMemberStatus);

// Update member points
router.patch('/:id/points', authenticateToken, memberController.updateMemberPoints);

// Get current user's membership for an org by code (public endpoint for member portal)
// Use optional auth to attach user if token is present, otherwise return null data
router.get('/by-code/:code', optionalAuthenticate, memberController.getMembershipByCode);

// Get current user's membership by organization ID (requires authentication)
router.get('/by-organization/:organizationId', [logRequest, authenticateToken], memberController.getMembershipByOrganization);

module.exports = router;

