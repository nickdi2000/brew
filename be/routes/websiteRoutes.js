const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { authenticateToken: auth, requireAdmin } = require('../middleware/auth');

// Public route (no auth required)
router.get('/public/:code', websiteController.getPublicWebsite);

// Admin routes (require authentication)
router.get('/', [auth, requireAdmin], websiteController.getWebsite);
router.post('/', [auth, requireAdmin], websiteController.createWebsite);
router.put('/', [auth, requireAdmin], websiteController.updateWebsite);
router.delete('/', [auth, requireAdmin], websiteController.deleteWebsite);
router.patch('/publish', [auth, requireAdmin], websiteController.togglePublish);

module.exports = router;

