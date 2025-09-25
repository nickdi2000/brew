const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

// GET /api/dashboard/overview
router.get('/overview', authenticateToken, dashboardController.getOverview);

module.exports = router;


