/**
 * Set Firebase custom claims for a user (Email/Password auth).
 *
 * Usage:
 *   node scripts/setCustomClaims.js <email> <role>
 *
 * Examples:
 *   node scripts/setCustomClaims.js admin@example.com admin
 *   node scripts/setCustomClaims.js test@example.com user
 *
 * Requirements (pick one):
 * - FIREBASE_SERVICE_ACCOUNT_PATH=path/to/serviceAccount.json
 * - FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
 * - GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
 */

require('dotenv').config();

const { getFirebaseAdmin } = require('../src/utils/firebaseAdmin');

async function main() {
  const email = process.argv[2];
  const role = process.argv[3];

  if (!email || !role) {
    process.stderr.write('Usage: node scripts/setCustomClaims.js <email> <role>\n');
    process.exitCode = 1;
    return;
  }

  const admin = getFirebaseAdmin();

  const user = await admin.auth().getUserByEmail(email);

  // Your API reads `role` / `roles` / `permissions` / `scope` from the token.
  // Minimal approach: just set `role` and let `requireAccess` map it to permissions.
  const claims = { role };

  await admin.auth().setCustomUserClaims(user.uid, claims);

  process.stdout.write(
    `Set custom claims for ${email} (uid=${user.uid}): ${JSON.stringify(claims)}\n`
  );
  process.stdout.write(
    'Note: the user must sign out/in (or refresh ID token) for claims to appear in their token.\n'
  );
}

main().catch((err) => {
  const msg = err && (err.stack || err.message) ? (err.stack || err.message) : String(err);
  process.stderr.write(`${msg}\n`);
  process.exitCode = 1;
});


