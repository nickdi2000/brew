const express = require('express');
const router = express.Router();

router.use((req, res) => {
  res.status(410).json({
    success: false,
    message: 'Frontend logging endpoints have been disabled.'
  });
});

module.exports = router;