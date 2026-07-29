// src/app/router.tsx

import { createBrowserRouter } from 'react-router';
import { RootLayout } from '../layouts/RootLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { AdminRoute } from '../components/auth/AdminRoute';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { ProductsPage } from '../pages/public/ProductsPage';
import { ProductDetailPage } from '../pages/public/ProductDetailPage';
import { CategoryPage } from '../pages/public/CategoryPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';

// Customer Pages
import { ProfilePage } from '../pages/customer/ProfilePage';
import { AddressesPage } from '../pages/customer/AddressesPage';
import { WishlistPage } from '../pages/customer/WishlistPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrdersPage } from '../pages/customer/OrdersPage';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';

// Extra Pages
import { NotFoundPage } from '../pages/extra/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/slug/:slug', element: <ProductDetailPage /> },
      { path: 'categories', element: <CategoryPage /> },

      // Auth Routes
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      { path: 'verify-email', element: <VerifyEmailPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Protected Customer Routes
      {
        path: 'customer/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'customer/addresses',
        element: (
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wishlist',
        element: (
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'customer/checkout',
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'customer/orders',
        element: (
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'customer/orders/:id',
        element: (
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  // Admin Protected Routes
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'orders', element: <AdminOrdersPage /> },
      { path: 'coupons', element: <AdminCouponsPage /> },
    ],
  },
  // 404 Catch All
  { path: '*', element: <NotFoundPage /> },
]);
