const express = require('express');
const { login, refreshToken, logout } = require('../controllers/auth.controller');

const router = express.Router();

// Public routes – do not require a token
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

module.exports = router;

