const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get rewards list with pagination and filters (any authenticated user in org)
router.get('/', rewardController.getRewards);

// Get single reward (any authenticated user in org)
router.get('/:id', rewardController.getReward);

// Redeem a reward (member uses membership context; admin allowed for POS use)
router.post('/:id/redeem', rewardController.redeemReward);

// Create new reward (admin only)
router.post('/', requireAdmin, rewardController.createReward);

// Update reward (admin only)
router.put('/:id', requireAdmin, rewardController.updateReward);

// Delete reward (admin only)
router.delete('/:id', requireAdmin, rewardController.deleteReward);

// Update reward quantity (admin only)
router.patch('/:id/quantity', requireAdmin, rewardController.updateQuantity);

module.exports = router;