import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { firebaseAuth, firebaseEnabled } from '../firebase/client';

function clearStoredAuth() {
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('AUTH_REFRESH_TOKEN');
  localStorage.removeItem('AUTH_USER');
}

export function isFirebaseEnabled() {
  return firebaseEnabled;
}

export async function firebaseEmailPasswordLogin(email, password) {
  if (!firebaseAuth) throw new Error('Firebase is not configured');
  return await signInWithEmailAndPassword(firebaseAuth, email, password);
}

export async function firebaseLogout() {
  if (!firebaseAuth) {
    clearStoredAuth();
    return;
  }
  await signOut(firebaseAuth);
  clearStoredAuth();
}

export async function getFirebaseIdToken({ forceRefresh = false } = {}) {
  if (!firebaseAuth || !firebaseAuth.currentUser) return null;
  return await firebaseAuth.currentUser.getIdToken(forceRefresh);
}

export function startFirebaseTokenSync() {
  if (!firebaseAuth) return () => {};

  // Keep localStorage in sync so existing guards/helpers can keep working.
  return onIdTokenChanged(firebaseAuth, async (user) => {
    try {
      if (!user) {
        clearStoredAuth();
        return;
      }

      const token = await user.getIdToken(false);
      localStorage.setItem('AUTH_TOKEN', token);
      localStorage.setItem(
        'AUTH_USER',
        JSON.stringify({ id: user.uid, email: user.email })
      );
    } catch {
      // If token refresh fails, clear and let API calls force re-login.
      clearStoredAuth();
    }
  });
}


