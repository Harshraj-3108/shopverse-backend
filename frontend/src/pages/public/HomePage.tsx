// src/pages/public/HomePage.tsx

import { Link } from 'react-router';
import { useGetHomepageDataQuery } from '../../services/api/homepageApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ProductCardSkeleton } from '../../components/ui/skeleton-loaders';
import { ShoppingBag, ArrowRight, Star, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useAddToCartMutation } from '../../services/api/cartApi';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { openCart } from '../../features/cart/cartSlice';
import toast from 'react-hot-toast';

export function HomePage() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();
  const { data: homeData, isLoading } = useGetHomepageDataQuery();
  const [addToCart] = useAddToCartMutation();

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

  const newest = homeData?.data?.newestProducts || [];
  const topRated = homeData?.data?.topRatedProducts || [];
  const categories = homeData?.data?.featuredCategories || [];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/30 py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-6 text-center sm:text-left">
            <Badge variant="outline" className="border-primary/40 text-primary px-3 py-1 gap-1.5 inline-flex">
              <Sparkles className="w-3.5 h-3.5" /> Premium Production Storefront
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
              Discover Next-Gen <span className="text-primary">E-Commerce</span> Performance.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              Explore thousands of curated products with instant Redis-cached responses, secure Razorpay checkout, and live order timeline tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-primary/20">
                  Shop All Catalog <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/categories">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Featured Categories</h2>
              <p className="text-xs text-muted-foreground">Explore our top product collections</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat._id} to={`/products?categoryId=${cat._id}`}>
                <Card className="hover:border-primary/50 hover:shadow-md transition-all text-center p-6 cursor-pointer group">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{cat.description || 'Explore products'}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Badge variant="secondary" className="mb-2">Fresh In Store</Badge>
            <h2 className="text-2xl font-bold tracking-tight">New Arrivals</h2>
          </div>
          <Link to="/products?sort=newest" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newest.map((product) => {
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
      </section>

      {/* Top Rated Products Section */}
      {topRated.length > 0 && (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge variant="outline" className="mb-2 border-amber-400/40 text-amber-500 gap-1 inline-flex">
                <TrendingUp className="w-3 h-3" /> Customer Favorites
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight">Highest Rated Products</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topRated.map((product) => {
              const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/300';
              return (
                <Card key={product._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-muted/30">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
                        <Link to={`/products/slug/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold">{product.averageRating}</span>
                        <span className="text-[11px] text-muted-foreground">({product.reviewsCount} reviews)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-base font-bold text-primary">₹{(product.salePrice || product.price).toLocaleString('en-IN')}</span>
                      <Button size="sm" onClick={() => handleAddToCart(product._id)} className="gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5" /> Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
