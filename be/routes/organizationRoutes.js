const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const organizationController = require('../controllers/organizationController');

// Get organization for authenticated user
router.get('/', auth, organizationController.getOrganization);

// Update organization
router.put('/', auth, organizationController.updateOrganization);

module.exports = router;
