const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken: auth } = require('../middleware/auth');

// Member management routes (protected by auth middleware)
router.get('/members', auth, userController.getOrganizationMembers);
router.get('/members/:id', auth, userController.getMemberDetails);
router.post('/members', auth, userController.createMember);
router.put('/members/:id', auth, userController.updateMember);
router.delete('/members/:id', auth, userController.deleteMember);

// Member status and points management
router.patch('/members/:id/status', auth, userController.updateMemberStatus);
router.patch('/members/:id/points', auth, userController.updateMemberPoints);

// Profile picture proxy endpoint
router.get('/:userId/picture', userController.getProfilePicture);

module.exports = router;
