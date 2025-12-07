const { getFirebaseAdmin } = require('../utils/firebaseAdmin');

function parseClaims(body) {
  if (body?.claims && typeof body.claims === 'object') {
    return body.claims;
  }
  if (body?.claim && typeof body.claim === 'object') {
    return body.claim;
  }
  if (body?.role) {
    return { role: body.role };
  }
  return null;
}

function sanitizeUserRecord(record) {
  return {
    uid: record.uid,
    email: record.email,
    displayName: record.displayName,
    disabled: Boolean(record.disabled),
    customClaims: record.customClaims || {},
  };
}

async function listUsers(req, res, next) {
  try {
    const admin = getFirebaseAdmin();
    const maxResults = Math.min(
      Math.max(Number(req.query.maxResults) || 100, 1),
      1000
    );
    const pageToken = req.query.pageToken;
    const response = await admin.auth().listUsers(maxResults, pageToken);
    const currentUid = req.user?.id || req.user?.uid;
    const users = response.users.map((userRecord) => {
      return {
        ...sanitizeUserRecord(userRecord),
        currentActiveUser: userRecord.uid === currentUid,
      };
    });

    return res.json({ users, nextPageToken: response.pageToken || null });
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password are required' });
    }

    const claims = parseClaims(req.body);
    if (!claims || Object.keys(claims).length === 0) {
      return res
        .status(400)
        .json({ error: 'A custom claim payload must be provided' });
    }

    const admin = getFirebaseAdmin();
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    await admin.auth().setCustomUserClaims(userRecord.uid, claims);

    return res.status(201).json({
      user: sanitizeUserRecord(userRecord),
      claims,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {

    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    const { email, password } = req.body;
    const wantsClaimUpdate =
      !!req.body.claim || !!req.body.claims || !!req.body.role;
    if (!email && !password && !wantsClaimUpdate) {
      return res
        .status(400)
        .json({ error: 'At least one of email, password, or claim must be provided' });
    }

    const admin = getFirebaseAdmin();
    const updatePayload = {};
    if (email) updatePayload.email = email;
    if (password) updatePayload.password = password;

    const updateResponse = Object.keys(updatePayload).length
      ? await admin.auth().updateUser(uid, updatePayload)
      : null;

    const claims = parseClaims(req.body);
    if (claims && Object.keys(claims).length > 0) {
      const originalRecord = updateResponse
        ? updateResponse
        : await admin.auth().getUser(uid);
      const mergedClaims = { ...(originalRecord.customClaims || {}) };
      Object.entries(claims).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          delete mergedClaims[key];
        } else {
          mergedClaims[key] = value;
        }
      });
      await admin.auth().setCustomUserClaims(uid, mergedClaims);
    }

    const userRecord =
      updateResponse || (await admin.auth().getUser(uid));

    return res.json({
      user: sanitizeUserRecord(userRecord),
      claims: userRecord.customClaims || {},
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ error: 'User UID is required' });
    }

    const admin = getFirebaseAdmin();
    await admin.auth().deleteUser(uid);
    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};

