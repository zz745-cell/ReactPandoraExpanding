const express = require('express');
const { login } = require('../controllers/auth.controller');

const router = express.Router();

// Public route – does not require a token
router.post('/login', login);

module.exports = router;


