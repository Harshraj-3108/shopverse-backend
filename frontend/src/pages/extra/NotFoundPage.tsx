// src/pages/extra/NotFoundPage.tsx

import { Link } from 'react-router';
import { Button } from '../../components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <h1 className="text-8xl font-extrabold tracking-widest text-primary/30">404</h1>
      <h2 className="text-3xl font-bold tracking-tight mt-4">Page Not Found</h2>
      <p className="text-muted-foreground text-sm max-w-md mt-2 mb-8">
        Sorry, the page you are looking for doesn't exist, was removed, or is temporarily unavailable.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/">
          <Button className="gap-2">
            <Home className="w-4 h-4" /> Go to Home
          </Button>
        </Link>
        <Link to="/products">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Browse Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
