// src/hooks/useAuth.ts

import { useAppSelector } from './reduxHooks';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectAuthInitialized,
} from '../features/auth/authSlice';

export function useAuth() {
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isInitialized = useAppSelector(selectAuthInitialized);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isInitialized,
    isEmailVerified: Boolean(user?.isEmailVerified),
  };
}
