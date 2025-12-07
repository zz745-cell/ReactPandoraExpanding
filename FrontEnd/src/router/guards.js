import { redirect } from 'react-router-dom';
import { isAdmin, isAuthenticated } from '../utils/auth';

export function requireAuth() {
  if (!isAuthenticated()) {
    throw redirect('/login');
  }
  return null;
}

export function requireAdmin() {
  if (!isAuthenticated()) {
    throw redirect('/login');
  }
  if (!isAdmin()) {
    throw redirect('/');
  }
  return null;
}


