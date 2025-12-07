const admin = require('firebase-admin');
const path = require('path');

let initialized = false;

function tryParseServiceAccountJson(json) {
  if (!json) return null;

  let parsed;
  try {
    parsed = JSON.parse(json);
  } catch (err) {
    throw new Error(
      `Invalid FIREBASE_SERVICE_ACCOUNT_JSON: ${err.message || 'malformed JSON'}`
    );
  }

  // Common gotcha when storing private key in env vars
  if (parsed && parsed.private_key && typeof parsed.private_key === 'string') {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  return parsed;
}

function initFirebaseAdmin() {
  if (initialized) return;

  // Prefer a file path in dev environments
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  let credential;

  if (serviceAccountPath) {
    // Path can be relative to the backend package root
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const serviceAccount = require(path.resolve(process.cwd(), serviceAccountPath));
    credential = admin.credential.cert(serviceAccount);
  } else if (serviceAccountJson) {
    const serviceAccount = tryParseServiceAccountJson(serviceAccountJson);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Let the SDK discover credentials
    credential = admin.credential.applicationDefault();
  } else {
    throw new Error(
      'Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON, or GOOGLE_APPLICATION_CREDENTIALS.'
    );
  }

  admin.initializeApp({ credential });
  initialized = true;
}

function getFirebaseAdmin() {
  initFirebaseAdmin();
  return admin;
}

async function verifyFirebaseIdToken(idToken, options = {}) {
  const { checkRevoked = false } = options;
  const a = getFirebaseAdmin();
  return await a.auth().verifyIdToken(idToken, checkRevoked);
}

module.exports = { getFirebaseAdmin, verifyFirebaseIdToken };


