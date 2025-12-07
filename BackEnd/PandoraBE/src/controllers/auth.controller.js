const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/token');
const { authenticateUser } = require('../services/user.service');
const {
  createRefreshSession,
  isRefreshSessionActive,
  revokeRefreshSession,
  revokeAllRefreshSessions,
} = require('../services/refreshSession.service');
const { config } = require('../config/config');
const {
  getFirebaseAdmin,
  verifyFirebaseIdToken,
} = require('../utils/firebaseAdmin');

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await authenticateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(userPayload);

    // Create a server-side refresh session (max N per user) and issue refresh token with jti.
    const { jti } = createRefreshSession(userPayload.id);
    const refreshToken = signRefreshToken(userPayload, { jwtid: jti });

    // Backwards-compatible: keep `token` as the access token for existing frontend usage.
    return res.json({ token: accessToken, accessToken, refreshToken, user: userPayload });
  } catch (err) {
    return next(err);
  }
}

async function refreshToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const bodyRefreshToken = req.body && (req.body.refreshToken || req.body.token);

    const refresh = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : bodyRefreshToken;

    if (!refresh) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refresh);

    // Strip standard JWT fields we don't want to copy blindly
    // eslint-disable-next-line no-unused-vars
    const { iat, exp, nbf, jti, ...userPayload } = decoded;

    if (!jti || !userPayload.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Enforce rotation: refresh token must correspond to an active server-side session.
    if (!isRefreshSessionActive(userPayload.id, jti)) {
      // Possible reuse (token stolen / replay). Revoke all sessions for safety.
      revokeAllRefreshSessions(userPayload.id);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const newAccessToken = signAccessToken(userPayload);

    // Rotate refresh token: revoke old session+jti and mint a new one.
    revokeRefreshSession(userPayload.id, jti);
    const { jti: newJti } = createRefreshSession(userPayload.id);
    const newRefreshToken = signRefreshToken(userPayload, { jwtid: newJti });

    return res.json({
      token: newAccessToken,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: userPayload,
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

async function logout(req, res, next) {
  try {
    const authHeader = req.headers['authorization'] || '';
    const bodyRefreshToken = req.body && (req.body.refreshToken || req.body.token);

    const refresh = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : bodyRefreshToken;
    const firebaseToken =
      authHeader.startsWith('Bearer ') && !refresh ? authHeader.slice(7) : null;

    if (!refresh) {
      if (
        firebaseToken &&
        (config.authMode === 'firebase' || config.authMode === 'any')
      ) {
        try {
          const decoded = await verifyFirebaseIdToken(firebaseToken, {
            checkRevoked: false,
          });
          await getFirebaseAdmin().auth().revokeRefreshTokens(decoded.uid);
          return res.sendStatus(204);
        } catch (err) {
          return res.status(401).json({ error: 'Invalid or expired token' });
        }
      }

      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refresh);

    // eslint-disable-next-line no-unused-vars
    const { iat, exp, nbf, jti, ...userPayload } = decoded;

    if (!jti || !userPayload.id) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Targeted revoke of this refresh session (device/browser)
    revokeRefreshSession(userPayload.id, jti);

    return res.sendStatus(204);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { login, refreshToken, logout };


