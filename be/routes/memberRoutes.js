const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const memberController = require('../controllers/memberController');

// Get current user's membership for an org by code
router.get('/by-code/:code', authenticateToken, memberController.getMembershipByCode);

module.exports = router;


