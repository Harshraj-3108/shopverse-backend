// src/components/auth/AdminRoute.tsx

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAuthenticated, isAdmin, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl font-bold text-destructive mb-2">403 Forbidden</h1>
        <p className="text-muted-foreground mb-6">You do not have administrative privileges to access this area.</p>
        <a href="/" className="text-primary underline">Return to Storefront</a>
      </div>
    );
  }

  return <>{children}</>;
}
