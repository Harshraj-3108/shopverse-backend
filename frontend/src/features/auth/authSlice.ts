// src/features/auth/authSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user?: User; token?: string }>
    ) => {
      if (action.payload.user !== undefined) {
        state.user = action.payload.user;
      }
      if (action.payload.token !== undefined) {
        state.token = action.payload.token;
      }
      state.isAuthenticated = Boolean(state.token || state.user);
      state.isInitialized = true;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    },
  },
});

export const { setCredentials, updateUser, logout, setInitialized } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';
export const selectAuthInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
