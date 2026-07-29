// src/pages/public/ProductsPage.tsx

import { useSearchParams, Link } from 'react-router';
import { useGetProductsQuery } from '../../services/api/productApi';
import { useGetCategoriesQuery } from '../../services/api/categoryApi';
import { useAddToCartMutation } from '../../services/api/cartApi';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { openCart } from '../../features/cart/cartSlice';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { ProductCardSkeleton } from '../../components/ui/skeleton-loaders';
import { ShoppingBag, Star, Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const [addToCart] = useAddToCartMutation();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const sort = searchParams.get('sort') || 'newest';

  const { data: productsData, isLoading } = useGetProductsQuery({
    page,
    limit: 12,
    search: search || undefined,
    categoryId: categoryId || undefined,
    sort,
  });

  const { data: categoriesData } = useGetCategoriesQuery();

  const handleAddToCart = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 }).unwrap();
      toast.success('Added to cart!');
      dispatch(openCart());
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add item to cart');
    }
  };

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination;
  const categories = categoriesData?.data || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse our full range of enterprise products ({pagination?.totalItems || 0} items found)
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground">Sort By:</label>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="h-9 rounded-lg border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="space-y-6 lg:col-span-1">
          <div className="border rounded-xl p-5 bg-card space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
              </h3>
              {(search || categoryId) && (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Reset All
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Search</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Keyword..."
                  value={search}
                  onChange={(e) => updateParam('search', e.target.value)}
                  className="pl-8 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-3" />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Category</label>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => updateParam('categoryId', '')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                    !categoryId ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => updateParam('categoryId', cat._id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                      categoryId === cat._id ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-card/50 space-y-4">
              <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
              <h3 className="text-lg font-bold">No Products Found</h3>
              <p className="text-xs text-muted-foreground">Try broadening your search query or selecting another category.</p>
              <Button variant="outline" size="sm" onClick={() => setSearchParams({})}>
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => {
                const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/300';
                return (
                  <Card key={product._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-muted/30">
                      <img
                        src={primaryImg}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.salePrice && (
                        <Badge className="absolute top-3 left-3 bg-rose-500 text-white">Sale</Badge>
                      )}
                    </div>
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          <Link to={`/products/slug/${product.slug}`}>{product.name}</Link>
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium">{product.averageRating || 4.5}</span>
                          <span className="text-[11px] text-muted-foreground">({product.reviewsCount})</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <div>
                          {product.salePrice ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-base font-bold text-primary">₹{product.salePrice.toLocaleString('en-IN')}</span>
                              <span className="text-xs text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                          ) : (
                            <span className="text-base font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
                          )}
                        </div>

                        <Button size="sm" onClick={() => handleAddToCart(product._id)} className="gap-1.5">
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParam('page', (page - 1).toString())}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs font-medium px-3">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.totalPages}
                onClick={() => updateParam('page', (page + 1).toString())}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
