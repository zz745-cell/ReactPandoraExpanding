const jwt = require('jsonwebtoken');
const { config } = require('../config/config');

function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.accessTokenExpiresIn,
    ...options,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

function signRefreshToken(payload, options = {}) {
  return jwt.sign(payload, config.refreshJwtSecret, {
    expiresIn: config.refreshTokenExpiresIn,
    ...options,
  });
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshJwtSecret);
}

// Backwards-compatible aliases (older code/tests may still call these)
const signToken = signAccessToken;
const verifyToken = verifyAccessToken;

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signToken,
  verifyToken,
};


