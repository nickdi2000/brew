const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuthenticate, requireAdmin } = require('../middleware/auth');
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

// Get all members for the organization (admin only)
router.get('/', [logRequest, authenticateToken, requireAdmin], memberController.getMembers);

// Get a specific member (admin only)
router.get('/:id', [authenticateToken, requireAdmin], memberController.getMemberById);

// Create a new member (admin only)
router.post('/', [authenticateToken, requireAdmin], memberController.createMember);

// Update a member (admin only)
router.put('/:id', [authenticateToken, requireAdmin], memberController.updateMember);

// Delete a member (admin only)
router.delete('/:id', [authenticateToken, requireAdmin], memberController.deleteMember);

// Update member status (admin only)
router.patch('/:id/status', [authenticateToken, requireAdmin], memberController.updateMemberStatus);

// Update member points (admin only)
router.patch('/:id/points', [authenticateToken, requireAdmin], memberController.updateMemberPoints);

// Get current user's membership for an org by code (public endpoint for member portal)
// Use optional auth to attach user if token is present, otherwise return null data
router.get('/by-code/:code', optionalAuthenticate, memberController.getMembershipByCode);

// Get current user's membership by organization ID (requires authentication)
router.get('/by-organization/:organizationId', [logRequest, authenticateToken], memberController.getMembershipByOrganization);

module.exports = router;

