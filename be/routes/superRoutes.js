const express = require('express');
const router = express.Router();

const superAuth = require('../middleware/superAuth');
const superController = require('../controllers/superController');

router.get('/organizations', superAuth, superController.getOrganizations);
router.get('/organizations/:organizationId', superAuth, superController.getOrganizationDetails);
router.post('/organizations/:organizationId/send-welcome', superAuth, superController.sendWelcomeEmail);
router.get('/qr-codes', superAuth, superController.getUnassignedQRCodes);
router.post('/qr-codes', superAuth, superController.createUnassignedQRCode);
router.put('/qr-codes/:id', superAuth, superController.updateUnassignedQRCode);
router.delete('/qr-codes/:id', superAuth, superController.deleteUnassignedQRCode);

module.exports = router;

