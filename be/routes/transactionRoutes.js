const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// All routes require authentication
router.use(authenticateToken);

// List transactions for a member
router.get('/:memberId', transactionController.list);

// Get balance for a member
router.get('/:memberId/balance', transactionController.balance);

// Create a new transaction (for both earn and adjust)
router.post('/:memberId', transactionController.create);

// Redeem reward
router.post('/:memberId/redeem', transactionController.redeem);

module.exports = router;