// src/pages/customer/WishlistPage.tsx

import { useGetWishlistQuery, useRemoveFromWishlistMutation, useMoveToCartMutation } from '../../services/api/wishlistApi';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { openCart } from '../../features/cart/cartSlice';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

export function WishlistPage() {
  const dispatch = useAppDispatch();
  const { data: wishlistData, isLoading } = useGetWishlistQuery();
  const [removeFromWishlist] = useRemoveFromWishlistMutation();
  const [moveToCart] = useMoveToCartMutation();

  const items = wishlistData?.data?.items || [];

  const handleMoveToCart = async (productId: string) => {
    try {
      await moveToCart({ productId }).unwrap();
      toast.success('Moved to cart!');
      dispatch(openCart());
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to move item to cart');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId).unwrap();
      toast.success('Removed from wishlist');
    } catch (err: any) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" /> Saved Wishlist
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Bookmarked items for later purchase ({items.length})</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading saved items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card space-y-4">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto opacity-30" />
          <h2 className="text-lg font-bold">Your Wishlist is Empty</h2>
          <p className="text-xs text-muted-foreground">Explore products and click the heart icon to save items here.</p>
          <Link to="/products">
            <Button className="gap-1.5">
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.productId;
            if (!product) return null;
            const primaryImg = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://via.placeholder.com/300';

            return (
              <Card key={product._id} className="overflow-hidden group hover:shadow-lg transition-all flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-muted/30">
                  <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemove(product._id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-white transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-1">
                      <Link to={`/products/slug/${product.slug}`}>{product.name}</Link>
                    </h3>
                    <p className="text-xs text-primary font-bold mt-1">₹{(product.salePrice || product.price).toLocaleString('en-IN')}</p>
                  </div>

                  <Button size="sm" onClick={() => handleMoveToCart(product._id)} className="w-full gap-1.5">
                    <ShoppingBag className="w-4 h-4" /> Move to Cart
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
