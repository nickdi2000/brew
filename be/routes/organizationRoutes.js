const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const organizationController = require('../controllers/organizationController');

// Public: get organization by code
router.get('/by-code/:code', organizationController.getOrganizationByCode);

// Get organization for authenticated user
router.get('/', auth, organizationController.getOrganization);

// Update organization
router.put('/', auth, organizationController.updateOrganization);

// Upload banner image
router.post('/banner-image', auth, organizationController.uploadBannerImage);

module.exports = router;
