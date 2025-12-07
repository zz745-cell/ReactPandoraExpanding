import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firebaseEmailPasswordLogin, getFirebaseIdToken, isFirebaseEnabled } from '../utils/firebaseAuth';

// Simple full-screen black login page.
const Login = () => {
  console.log("process.env.REACT_APP_FIREBASE_API_KEY", process.env.REACT_APP_FIREBASE_API_KEY)

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    console.log("process.env.REACT_APP_FIREBASE_API_KEY", process.env.REACT_APP_FIREBASE_API_KEY)
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (!isFirebaseEnabled()) {
        throw new Error(
          'Firebase is not configured. Add REACT_APP_FIREBASE_* env vars, then restart the frontend.'
        );
      }

      await firebaseEmailPasswordLogin(username, password);
      const idToken = await getFirebaseIdToken({ forceRefresh: true });
      if (idToken) localStorage.setItem('AUTH_TOKEN', idToken);
      // `startFirebaseTokenSync()` will keep it updated after this.

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Username / Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          className="px-4 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-white text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="px-4 py-3 rounded-md border border-neutral-800 bg-neutral-900 text-white text-base placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !isFirebaseEnabled()}
          className="px-4 py-3 rounded-md bg-white text-black font-semibold text-base hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;


