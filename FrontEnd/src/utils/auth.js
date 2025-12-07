// Simple auth helpers for the frontend.
// Role is derived from the signed JWT payload so users can't just edit a stored role.

export const getToken = () => localStorage.getItem('AUTH_TOKEN');
export const getRefreshToken = () => localStorage.getItem('AUTH_REFRESH_TOKEN');

export const clearAuth = () => {
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('AUTH_REFRESH_TOKEN');
  localStorage.removeItem('AUTH_USER');
};

export const getTokenPayload = () => {
  const token = getToken();
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload?.role || null;
};

export const isAuthenticated = () => !!getTokenPayload();

export const isAdmin = () => getUserRole() === 'admin';


