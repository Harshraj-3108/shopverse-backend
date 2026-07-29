// src/app/store.ts

import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../services/api/baseApi';
import authReducer from '../features/auth/authSlice';
import cartUiReducer from '../features/cart/cartSlice';
import themeReducer from '../features/theme/themeSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cartUi: cartUiReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
