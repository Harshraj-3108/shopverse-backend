// src/features/cart/CartDrawer.tsx

import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { selectIsCartOpen, closeCart } from './cartSlice';
import { useGetCartQuery, useUpdateCartItemQuantityMutation, useRemoveFromCartMutation, useClearCartMutation } from '../../services/api/cartApi';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { ShoppingBag, X, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isOpen = useAppSelector(selectIsCartOpen);
  const { isAuthenticated } = useAuth();

  const { data: cartData, isLoading } = useGetCartQuery(undefined, { skip: !isOpen || !isAuthenticated });
  const [updateQuantity] = useUpdateCartItemQuantityMutation();
  const [removeItem] = useRemoveFromCartMutation();
  const [clearCart] = useClearCartMutation();

  if (!isOpen) return null;

  const cart = cartData?.data?.cart;
  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/customer/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in">
      <div className="absolute inset-0" onClick={() => dispatch(closeCart())} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-background border-l shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <span>Shopping Cart ({items.reduce((acc, item) => acc + item.quantity, 0)})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => dispatch(closeCart())}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!isAuthenticated ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground text-sm">Please log in to view your shopping cart.</p>
                <Button onClick={() => { dispatch(closeCart()); navigate('/login'); }}>
                  Log In Now
                </Button>
              </div>
            ) : isLoading ? (
              <div className="text-center py-12 text-muted-foreground text-sm">Loading cart contents...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
                <p className="text-muted-foreground text-sm">Your shopping cart is empty.</p>
                <Button variant="outline" onClick={() => { dispatch(closeCart()); navigate('/products'); }}>
                  Explore Catalog
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const product = typeof item.productId === 'object' ? item.productId : null;
                const primaryImage = product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url || 'https://via.placeholder.com/150';

                return (
                  <div key={item._id || (product ? product._id : Math.random().toString())} className="flex gap-4 p-3 rounded-lg border bg-card/50">
                    <img
                      src={primaryImage}
                      alt={product?.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="text-xs font-semibold line-clamp-1">{product?.name || 'Product Item'}</h4>
                      <p className="text-xs text-primary font-bold">₹{(item.price || product?.salePrice || product?.price || 0).toLocaleString('en-IN')}</p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex items-center border rounded-md">
                          <button
                            type="button"
                            className="px-2 py-0.5 text-xs hover:bg-muted"
                            onClick={() => {
                              if (product) {
                                if (item.quantity > 1) {
                                  updateQuantity({ productId: product._id, quantity: item.quantity - 1 });
                                } else {
                                  removeItem(product._id);
                                }
                              }
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            className="px-2 py-0.5 text-xs hover:bg-muted"
                            onClick={() => product && updateQuantity({ productId: product._id, quantity: item.quantity + 1 })}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                          onClick={() => product && removeItem(product._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {isAuthenticated && items.length > 0 && (
            <div className="p-6 border-t bg-muted/20 space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Subtotal</span>
                <span className="text-lg font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Taxes and shipping calculated at checkout.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => clearCart()}>
                  Clear Cart
                </Button>
                <Button size="sm" onClick={handleCheckout} className="gap-1.5">
                  Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
