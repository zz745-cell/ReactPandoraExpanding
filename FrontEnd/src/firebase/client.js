import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

function readFirebaseEnv() {
  const cfg = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
  };
  return cfg;
}

export const firebaseConfig = readFirebaseEnv();

export const firebaseEnabled = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

export const firebaseApp = firebaseEnabled
  ? (getApps()[0] || initializeApp(firebaseConfig))
  : null;

export const firebaseAuth = firebaseEnabled ? getAuth(firebaseApp) : null;


