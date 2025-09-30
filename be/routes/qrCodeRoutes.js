const express = require('express');
const router = express.Router();
const controller = require('../controllers/qrCodeController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, controller.list);
router.post('/', authenticateToken, controller.create);
router.put('/:id', authenticateToken, controller.update);
router.delete('/:id', authenticateToken, controller.remove);
router.post('/:id/redeem', controller.redeem); // No auth required for QR code redemption
router.get('/lookup/:code', controller.lookup); // No auth required for QR code lookup

module.exports = router;


