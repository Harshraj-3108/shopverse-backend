// src/components/navigation/Footer.tsx

import { Link } from 'react-router';
import { ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 transition-colors">
      {/* Value Proposition Badges */}
      <div className="border-b bg-background/50 py-8">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 px-4 text-center">
          <div className="flex flex-col items-center space-y-2 p-2">
            <Truck className="h-6 w-6 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Fast Delivery</h4>
            <p className="text-xs text-muted-foreground">Standard & express shipping available</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Secure Payment</h4>
            <p className="text-xs text-muted-foreground">Encrypted Razorpay transactions</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <RotateCcw className="h-6 w-6 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">Easy Returns</h4>
            <p className="text-xs text-muted-foreground">Hassle-free order cancellation</p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-2">
            <Headphones className="h-6 w-6 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider">24/7 Support</h4>
            <p className="text-xs text-muted-foreground">Dedicated customer care desk</p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-primary text-primary-foreground px-2.5 py-1 rounded-lg">Shop</span>
            <span>Verse</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enterprise-grade production e-commerce REST API platform engineered with Clean Architecture, Redis caching, and OWASP security hardening.
          </p>
        </div>

        <div>
          <h5 className="text-sm font-semibold mb-4">Shop & Browse</h5>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li><Link to="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
            <li><Link to="/categories" className="hover:text-foreground transition-colors">Categories Tree</Link></li>
            <li><Link to="/products?sort=newest" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold mb-4">Account & Support</h5>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li><Link to="/customer/profile" className="hover:text-foreground transition-colors">My Profile</Link></li>
            <li><Link to="/customer/orders" className="hover:text-foreground transition-colors">Track Orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-foreground transition-colors">Saved Wishlist</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-sm font-semibold mb-4">System</h5>
          <ul className="space-y-2.5 text-xs text-muted-foreground">
            <li><a href="/api/v1/docs" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Swagger OpenAPI Docs</a></li>
            <li><a href="/health" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">System Health Status</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} ShopVerse E-Commerce Inc. All rights reserved.
      </div>
    </footer>
  );
}
