const express = require('express');
const router = express.Router();

const superAuth = require('../middleware/superAuth');
const superController = require('../controllers/superController');

router.get('/organizations', superAuth, superController.getOrganizations);

module.exports = router;

