// src/features/theme/themeSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  const saved = localStorage.getItem('shopverse_theme') as ThemeMode;
  if (saved && ['light', 'dark', 'system'].includes(saved)) {
    return saved;
  }
  return 'system';
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      localStorage.setItem('shopverse_theme', action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;

export default themeSlice.reducer;

export const selectThemeMode = (state: { theme: ThemeState }) => state.theme.mode;
