const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdminOrSelfMembership, requireAdmin } = require('../middleware/auth');
const transactionController = require('../controllers/transactionController');

// All routes require authentication
router.use(authenticateToken);

// List all transactions for the organization (admin only) - must come before /:memberId
router.get('/', requireAdmin, transactionController.listAll);

// List transactions for a member (admin or the member themselves)
router.get('/:memberId', requireAdminOrSelfMembership('memberId'), transactionController.list);

// Get balance for a member (admin or the member themselves)
router.get('/:memberId/balance', requireAdminOrSelfMembership('memberId'), transactionController.balance);

// Create a new transaction (admin only)
router.post('/:memberId', require('../middleware/auth').requireAdmin, transactionController.create);

// Redeem reward (admin or the member themselves)
router.post('/:memberId/redeem', requireAdminOrSelfMembership('memberId'), transactionController.redeem);

module.exports = router;