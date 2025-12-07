const { verifyAccessToken } = require('../utils/token');
const { config } = require('../config/config');
const { verifyFirebaseIdToken } = require('../utils/firebaseAdmin');

function getBearerToken(req) {
  const authHeader = req.headers['authorization'] || '';
  return authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;
}

function normalizeFirebasePayload(decoded) {
  // Keep shape compatible with existing middleware expectations (`req.user`)
  // so that `requireAccess`/`requireRole` can read `role`/`roles`/`permissions`.
  return {
    id: decoded.uid,
    email: decoded.email,
    name: decoded.name,
    // Custom claims (optional)
    role: decoded.role,
    roles: decoded.roles,
    permissions: decoded.permissions,
    scope: decoded.scope,
    // Preserve raw claims if you want to inspect later
    firebase: {
      uid: decoded.uid,
      sign_in_provider: decoded.firebase && decoded.firebase.sign_in_provider,
    },
  };
}

async function authMiddleware(req, res, next) {
  const token = getBearerToken(req);

  if (!token) return res.status(401).json({ error: 'Authorization token missing' });

  const mode = config.authMode;

  // Local-only
  if (mode === 'local') {
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      req.authProvider = 'local';
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Firebase-only
  if (mode === 'firebase') {
    try {
      const decoded = await verifyFirebaseIdToken(token, { checkRevoked: false });
      req.user = normalizeFirebasePayload(decoded);
      req.authProvider = 'firebase';
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  // Any: try local first, then Firebase
  if (mode === 'any') {
    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      req.authProvider = 'local';
      return next();
    } catch (err) {
      // fall through
    }

    try {
      const decoded = await verifyFirebaseIdToken(token, { checkRevoked: false });
      req.user = normalizeFirebasePayload(decoded);
      req.authProvider = 'firebase';
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  return res.status(500).json({ error: 'Server auth mode misconfigured' });
}

module.exports = { authMiddleware };


