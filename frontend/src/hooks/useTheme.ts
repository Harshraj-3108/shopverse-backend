// src/hooks/useTheme.ts

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './reduxHooks';
import { setTheme as setReduxTheme, selectThemeMode, ThemeMode } from '../features/theme/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectThemeMode);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    dispatch(setReduxTheme(mode));
  };

  return { theme, setTheme };
}
