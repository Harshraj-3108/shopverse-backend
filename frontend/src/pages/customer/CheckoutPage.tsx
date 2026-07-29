// src/pages/customer/CheckoutPage.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetCartQuery } from '../../services/api/cartApi';
import { useGetAddressesQuery } from '../../services/api/userApi';
import { useValidateCouponMutation } from '../../services/api/couponApi';
import { usePlaceOrderMutation } from '../../services/api/orderApi';
import { useCreateRazorpayOrderMutation, useVerifyPaymentMutation } from '../../services/api/paymentApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { MapPin, CreditCard, Ticket, CheckCircle2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export function CheckoutPage() {
  const navigate = useNavigate();

  const { data: cartData } = useGetCartQuery();
  const { data: addressData } = useGetAddressesQuery();
  const [validateCoupon, { isLoading: isValidatingCoupon }] = useValidateCouponMutation();
  const [placeOrder, { isLoading: isPlacingOrder }] = usePlaceOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyPayment] = useVerifyPaymentMutation();

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  const cart = cartData?.data?.cart;
  const items = cart?.items || [];
  const addresses = addressData?.data?.addresses || [];
  const subtotal = cart?.totalAmount || 0;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await validateCoupon({ code: couponCode.trim(), orderTotal: subtotal }).unwrap();
      if (res.data) {
        setAppliedCoupon({ code: couponCode.trim(), discountAmount: res.data.discountAmount });
        toast.success(`Coupon ${couponCode.toUpperCase()} applied! Saved ₹${res.data.discountAmount}`);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid or expired coupon');
    }
  };

  const handlePlaceOrder = async () => {
    if (addresses.length === 0) {
      toast.error('Please add a delivery address first');
      navigate('/customer/addresses');
      return;
    }

    const selectedAddress = addresses[selectedAddressIndex];
    const orderPayload = {
      shippingAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        country: selectedAddress.country,
      },
      paymentMethod,
      couponCode: appliedCoupon?.code,
    };

    try {
      const res = await placeOrder(orderPayload).unwrap();
      const order = res.data?.order;

      if (!order) {
        toast.error('Order creation failed');
        return;
      }

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        navigate(`/customer/orders/${order._id}`);
      } else {
        // Razorpay Payment Flow
        const razorpayRes = await createRazorpayOrder({ orderId: order._id }).unwrap();
        const razorData = razorpayRes.data;

        if (razorData) {
          const options = {
            key: razorData.keyId,
            amount: razorData.amount,
            currency: razorData.currency,
            name: 'ShopVerse',
            description: `Order ${razorData.orderNumber}`,
            order_id: razorData.orderId,
            handler: async function (response: any) {
              try {
                await verifyPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: order._id,
                }).unwrap();
                toast.success('Payment verified & order placed!');
                navigate(`/customer/orders/${order._id}`);
              } catch (e: any) {
                toast.error('Payment verification failed');
              }
            },
            theme: { color: '#3b82f6' },
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Checkout failed. Please check item stock.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground">Add items to your cart before proceeding to checkout.</p>
        <Button onClick={() => navigate('/products')}>Explore Catalog</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">Review items and select shipping & payment options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Address */}
          <Card className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" /> 1. Shipping Address
            </h2>

            {addresses.length === 0 ? (
              <div className="text-center py-6 border rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">No saved addresses found.</p>
                <Button size="sm" onClick={() => navigate('/customer/addresses')}>
                  Add Address Now
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAddressIndex === idx ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm">{addr.street}</p>
                      {selectedAddressIndex === idx && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {addr.city}, {addr.state} - {addr.zipCode}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{addr.country}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Step 2: Payment Method */}
          <Card className="p-6">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Cash on Delivery (COD)</p>
                  <p className="text-xs text-muted-foreground">Pay with cash upon order delivery</p>
                </div>
                {paymentMethod === 'cod' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>

              <div
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === 'razorpay' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Razorpay (Cards/UPI/Netbanking)</p>
                  <p className="text-xs text-muted-foreground">Secure online payment portal</p>
                </div>
                {paymentMethod === 'razorpay' && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-bold border-b pb-3">Order Summary</h2>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-primary" /> Apply Promo Code
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="SAVE20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-xs uppercase"
                />
                <Button size="sm" onClick={handleApplyCoupon} loading={isValidatingCoupon}>
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <Badge variant="success" className="text-[11px] w-full justify-center">
                  Code '{appliedCoupon.code}' Applied! (-₹{appliedCoupon.discountAmount})
                </Badge>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-2 border-t text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Cart Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Shipping</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t text-foreground">
                <span>Final Total</span>
                <span className="text-primary">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Button size="lg" className="w-full gap-2 mt-4" onClick={handlePlaceOrder} loading={isPlacingOrder}>
              Complete Order <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
