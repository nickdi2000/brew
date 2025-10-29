const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/check-credentials', authController.checkUserCredentials);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/magic-login/generate', authController.requestAdminMagicLink);
router.post('/magic-login/consume', authController.consumeAdminMagicLink);

module.exports = router;
