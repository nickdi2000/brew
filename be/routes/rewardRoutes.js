const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get rewards list with pagination and filters
router.get('/', rewardController.getRewards);

// Get single reward
router.get('/:id', rewardController.getReward);

// Create new reward
router.post('/', rewardController.createReward);

// Update reward
router.put('/:id', rewardController.updateReward);

// Delete reward
router.delete('/:id', rewardController.deleteReward);

// Update reward quantity
router.patch('/:id/quantity', rewardController.updateQuantity);

module.exports = router;