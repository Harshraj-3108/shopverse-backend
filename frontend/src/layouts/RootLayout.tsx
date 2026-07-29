// src/layouts/RootLayout.tsx

import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/navigation/Footer';
import { CartDrawer } from '../features/cart/CartDrawer';
import { useRefreshTokenMutation } from '../services/api/authApi';
import { useGetProfileQuery } from '../services/api/userApi';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { setCredentials, setInitialized, selectIsAuthenticated } from '../features/auth/authSlice';

export function RootLayout() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [refreshToken] = useRefreshTokenMutation();

  // 1. Silent token refresh attempt on app init
  useEffect(() => {
    async function initAuth() {
      try {
        const res = await refreshToken().unwrap();
        if (res.data?.accessToken) {
          dispatch(setCredentials({ token: res.data.accessToken }));
        }
      } catch (e) {
        // Guest user or expired refresh token
      } finally {
        dispatch(setInitialized());
      }
    }
    initAuth();
  }, [refreshToken, dispatch]);

  // 2. Fetch profile data once access token is valid
  const { data: profileData } = useGetProfileQuery(undefined, { skip: !isAuthenticated });

  useEffect(() => {
    if (profileData?.data?.user) {
      dispatch(setCredentials({ user: profileData.data.user }));
    }
  }, [profileData, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
