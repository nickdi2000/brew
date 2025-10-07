const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken: auth, requireAdmin } = require('../middleware/auth');

// Member management routes (admin-only)
router.get('/members', [auth, requireAdmin], userController.getOrganizationMembers);
router.get('/members/:id', [auth, requireAdmin], userController.getMemberDetails);
router.post('/members', [auth, requireAdmin], userController.createMember);
router.put('/members/:id', [auth, requireAdmin], userController.updateMember);
router.delete('/members/:id', [auth, requireAdmin], userController.deleteMember);

// Member status and points management (admin-only)
router.patch('/members/:id/status', [auth, requireAdmin], userController.updateMemberStatus);
router.patch('/members/:id/points', [auth, requireAdmin], userController.updateMemberPoints);

// Profile picture proxy endpoint
router.get('/:userId/picture', userController.getProfilePicture);

module.exports = router;
