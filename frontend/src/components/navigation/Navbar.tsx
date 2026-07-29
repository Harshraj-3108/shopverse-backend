// src/components/navigation/Navbar.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { openCart } from '../../features/cart/cartSlice';
import { useGetCartQuery } from '../../services/api/cartApi';
import { useGetWishlistQuery } from '../../services/api/wishlistApi';
import { useLogoutUserMutation } from '../../services/api/authApi';
import { logout as logoutAction } from '../../features/auth/authSlice';
import { ThemeToggle } from './ThemeToggle';
import { Button } from '../ui/button';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  LogOut,
  Shield,
  Menu,
  X,
  Package,
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Navbar() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: cartData } = useGetCartQuery(undefined, { skip: !isAuthenticated });
  const { data: wishlistData } = useGetWishlistQuery(undefined, { skip: !isAuthenticated });
  const [logoutUser] = useLogoutUserMutation();

  const cartItemCount = cartData?.data?.cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const wishlistItemCount = wishlistData?.data?.items?.length || 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      dispatch(logoutAction());
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">Shop</span>
            <span className="text-foreground">Verse</span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/products" className="text-muted-foreground hover:text-foreground transition-colors">
              Catalog
            </Link>
            <Link to="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
              Categories
            </Link>
          </nav>
        </div>

        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative w-72">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-full border bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
        </form>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {/* Wishlist Button */}
          {isAuthenticated && (
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative" aria-label="Wishlist">
                <Heart className="h-5 w-5 text-muted-foreground hover:text-rose-500 transition-colors" />
                {wishlistItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Shopping Cart Drawer Toggle */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => dispatch(openCart())}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4.5 w-4.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </Button>
          )}

          {/* Auth State Button / User Dropdown */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin/dashboard">
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 border-primary/40 text-primary">
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/customer/profile">
                <Button variant="ghost" size="sm" className="gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium text-xs">{user?.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm rounded-lg border bg-muted/50 focus:bg-background"
            />
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          </form>

          <nav className="flex flex-col space-y-2 pt-2 text-sm font-medium">
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent"
            >
              All Products
            </Link>
            <Link
              to="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-accent"
            >
              Categories
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/customer/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md hover:bg-accent flex items-center gap-2"
                >
                  <Package className="w-4 h-4" /> My Orders
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md hover:bg-accent flex items-center gap-2 text-primary font-semibold"
                  >
                    <Shield className="w-4 h-4" /> Admin Portal
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
