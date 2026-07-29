// src/pages/public/CategoryPage.tsx

import { Link } from 'react-router';
import { useGetCategoriesQuery } from '../../services/api/categoryApi';
import { Card, CardTitle, CardDescription } from '../../components/ui/card';
import { FolderTree, ArrowRight } from 'lucide-react';

export function CategoryPage() {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({ format: 'tree' });
  const categories = categoriesData?.data || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FolderTree className="w-7 h-7 text-primary" /> Product Categories
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Explore our nested category hierarchy</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading categories tree...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Card key={cat._id} className="p-6 space-y-4 hover:border-primary/50 transition-colors">
              <div>
                <CardTitle className="text-lg font-bold text-primary flex items-center justify-between">
                  <span>{cat.name}</span>
                  <Link to={`/products?categoryId=${cat._id}`}>
                    <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
                  </Link>
                </CardTitle>
                <CardDescription className="text-xs mt-1">{cat.description || 'Main Category'}</CardDescription>
              </div>

              {cat.children && cat.children.length > 0 && (
                <div className="space-y-1.5 border-t pt-3">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Subcategories:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.children.map((child) => (
                      <Link key={child._id} to={`/products?categoryId=${child._id}`}>
                        <span className="text-xs bg-muted hover:bg-primary hover:text-primary-foreground px-2.5 py-1 rounded-md transition-colors inline-block">
                          {child.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
