const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.get('/', logController.getLatestLogs);
router.post('/', logController.createLog);
router.post('/batch', logController.createBatchLogs);

module.exports = router;