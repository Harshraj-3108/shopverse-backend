// src/pages/public/ProductDetailPage.tsx

import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { useGetProductBySlugQuery } from '../../services/api/productApi';
import { useGetProductReviewsQuery, useCreateReviewMutation } from '../../services/api/reviewApi';
import { useAddToCartMutation } from '../../services/api/cartApi';
import { useAddToWishlistMutation } from '../../services/api/wishlistApi';
import { useAuth } from '../../hooks/useAuth';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { openCart } from '../../features/cart/cartSlice';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Plus, Minus, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const { data: productData, isLoading, isError } = useGetProductBySlugQuery(slug || '', { skip: !slug });
  const product = productData?.data?.product;

  const { data: reviewsData } = useGetProductReviewsQuery({ productId: product?._id || '' }, { skip: !product?._id });
  const [addToCart] = useAddToCartMutation();
  const [addToWishlist] = useAddToWishlistMutation();
  const [createReview, { isLoading: isSubmittingReview }] = useCreateReviewMutation();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        Loading product details...
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Product Not Found</h2>
        <p className="text-sm text-muted-foreground">The requested product does not exist or has been removed.</p>
        <Link to="/products"><Button>Back to Catalog</Button></Link>
      </div>
    );
  }

  const images = product.images || [];
  const activeImage = images[selectedImage]?.url || 'https://via.placeholder.com/600';
  const reviews = reviewsData?.data?.reviews || [];

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to cart');
      return;
    }
    try {
      await addToCart({ productId: product._id, quantity }).unwrap();
      toast.success('Added to cart!');
      dispatch(openCart());
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add to cart');
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to wishlist');
      return;
    }
    try {
      await addToWishlist({ productId: product._id }).unwrap();
      toast.success('Saved to wishlist!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Already in wishlist');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      return;
    }
    try {
      await createReview({ productId: product._id, rating, comment }).unwrap();
      toast.success('Review submitted successfully!');
      setComment('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Product Main Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-square rounded-2xl overflow-hidden border bg-muted/20 relative">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
            {product.salePrice && (
              <Badge className="absolute top-4 left-4 bg-rose-500 text-white text-xs px-3 py-1">SALE</Badge>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === index ? 'border-primary scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Purchase Form */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              SKU: {product.sku}
            </span>
            <h1 className="text-3xl font-bold tracking-tight mt-1">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold ml-1 text-foreground">{product.averageRating || 4.5}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewsCount} verified reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 border-y py-4">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-extrabold text-primary">₹{product.salePrice.toLocaleString('en-IN')}</span>
                <span className="text-lg text-muted-foreground line-through">₹{product.price.toLocaleString('en-IN')}</span>
                <Badge variant="success">
                  Save ₹{(product.price - product.salePrice).toLocaleString('en-IN')}
                </Badge>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">Availability:</span>
            {product.stockQuantity > 0 ? (
              <Badge variant="success">In Stock ({product.stockQuantity} available)</Badge>
            ) : (
              <Badge variant="destructive">Out of Stock</Badge>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  type="button"
                  className="px-3 py-1.5 hover:bg-muted"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 hover:bg-muted"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={product.stockQuantity === 0}>
                <ShoppingBag className="w-5 h-5" /> Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
                <Heart className="w-5 h-5 text-rose-500" />
              </Button>
            </div>
          </div>

          {/* Delivery Promises */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t text-center text-xs">
            <div className="space-y-1">
              <Truck className="w-5 h-5 text-primary mx-auto" />
              <p className="font-semibold">Fast Shipping</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 text-primary mx-auto" />
              <p className="font-semibold">Original Product</p>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-5 h-5 text-primary mx-auto" />
              <p className="font-semibold">7 Days Return</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-12 space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" /> Customer Reviews ({reviews.length})
          </h2>
        </div>

        {/* Submit Review Form */}
        {isAuthenticated && (
          <Card className="p-6">
            <h3 className="font-bold text-sm mb-4">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Your Rating:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'text-muted'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Share your experience with this product..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full h-24 p-3 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <Button size="sm" type="submit" loading={isSubmittingReview}>
                Submit Review
              </Button>
            </form>
          </Card>
        )}

        {/* Review List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((rev) => (
              <Card key={rev._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`w-4 h-4 ${s <= rev.rating ? 'fill-current' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                {rev.comment && <p className="text-xs text-muted-foreground mt-2">{rev.comment}</p>}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
