const crypto = require('crypto');
const { config } = require('../config/config');

// In-memory refresh session store.
// NOTE: For production, move this to persistent storage (DB/Redis) and hash tokens.
// Map<userId, Array<{ jti: string, createdAt: number, revokedAt: number|null }>>
const sessionsByUser = new Map();

function now() {
  return Date.now();
}

function generateJti() {
  // Node 16 compatible
  return crypto.randomBytes(16).toString('hex');
}

function getUserSessions(userId) {
  if (!sessionsByUser.has(userId)) sessionsByUser.set(userId, []);
  return sessionsByUser.get(userId);
}

function countActive(sessions) {
  return sessions.filter((s) => !s.revokedAt).length;
}

function revokeOldestToLimit(userId) {
  const sessions = getUserSessions(userId);
  const max = config.refreshMaxSessionsPerUser;
  if (!max || max < 1) return;

  // Revoke oldest active sessions until within limit.
  while (countActive(sessions) > max) {
    const oldestActive = sessions
      .filter((s) => !s.revokedAt)
      .sort((a, b) => a.createdAt - b.createdAt)[0];
    if (!oldestActive) break;
    oldestActive.revokedAt = now();
  }
}

function createRefreshSession(userId) {
  const jti = generateJti();
  const sessions = getUserSessions(userId);
  sessions.push({ jti, createdAt: now(), revokedAt: null });
  revokeOldestToLimit(userId);
  return { jti };
}

function isRefreshSessionActive(userId, jti) {
  const sessions = getUserSessions(userId);
  const s = sessions.find((x) => x.jti === jti);
  return !!(s && !s.revokedAt);
}

function revokeRefreshSession(userId, jti) {
  const sessions = getUserSessions(userId);
  const s = sessions.find((x) => x.jti === jti);
  if (s && !s.revokedAt) s.revokedAt = now();
}

function revokeAllRefreshSessions(userId) {
  const sessions = getUserSessions(userId);
  sessions.forEach((s) => {
    if (!s.revokedAt) s.revokedAt = now();
  });
}

// Test helper
function _clearAll() {
  sessionsByUser.clear();
}

module.exports = {
  createRefreshSession,
  isRefreshSessionActive,
  revokeRefreshSession,
  revokeAllRefreshSessions,
  _clearAll,
};


