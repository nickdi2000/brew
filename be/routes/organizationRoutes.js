const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const organizationController = require('../controllers/organizationController');

// Public: get organization by code
router.get('/by-code/:code', organizationController.getOrganizationByCode);
// Public: get organization details by code
router.get('/by-code/:code/details', organizationController.getOrganizationDetailsByCode);

// Get organization for authenticated user
router.get('/', auth, organizationController.getOrganization);
// Authenticated: get and upsert details for current organization
router.get('/details', auth, organizationController.getOrganizationDetails);
router.put('/details', auth, organizationController.upsertOrganizationDetails);

// Update organization
router.put('/', auth, organizationController.updateOrganization);

// Upload banner image
router.post('/banner-image', auth, organizationController.uploadBannerImage);

module.exports = router;
