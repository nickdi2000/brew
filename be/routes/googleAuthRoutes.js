const express = require('express');
const router = express.Router();
const { googleLogin } = require('../controllers/googleAuthController');

router.post('/google/login', googleLogin);
router.post('/google/admin/login', googleLogin);

module.exports = router;
