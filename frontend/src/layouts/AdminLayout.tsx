// src/layouts/AdminLayout.tsx

import { Link, Outlet, useLocation } from 'react-router';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Ticket, Database, ArrowLeft } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const links = [
    { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card/50 p-6 space-y-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <LayoutDashboard className="w-5 h-5" /> Admin Portal
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Storefront
          </Link>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;

            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
