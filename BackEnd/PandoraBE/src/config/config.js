require('dotenv').config();

const config = {
  port: process.env.PORT || 5001,
  // Auth mode:
  // - local: verify tokens signed by this API (`JWT_SECRET`)
  // - firebase: verify Firebase ID tokens
  // - any: accept either local JWT or Firebase ID token
  authMode: (process.env.AUTH_MODE || 'local').toLowerCase(),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  // Token lifetimes (can be overridden via env)
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  // Separate refresh secret is recommended; falls back to jwtSecret for dev simplicity.
  refreshJwtSecret: process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET || 'dev-secret-change-me',
  // Max number of active refresh sessions per user (devices/browsers)
  refreshMaxSessionsPerUser: Number(process.env.REFRESH_MAX_SESSIONS_PER_USER || 3),
};

module.exports = { config };


