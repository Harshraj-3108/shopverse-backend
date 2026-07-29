// src/pages/customer/OrderDetailPage.tsx

import { useParams, Link } from 'react-router';
import { useGetOrderDetailsQuery, useGetOrderTimelineQuery, useCancelOrderMutation } from '../../services/api/orderApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Package, Clock, Truck, MapPin, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: orderData, isLoading } = useGetOrderDetailsQuery(id || '', { skip: !id });
  const { data: timelineData } = useGetOrderTimelineQuery(id || '', { skip: !id });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const order = orderData?.data?.order;
  const timeline = timelineData?.data?.timeline || order?.timeline || [];

  const handleCancelOrder = async () => {
    if (!id) return;
    if (confirm('Are you sure you want to cancel this order? Item stock will be automatically restored.')) {
      try {
        await cancelOrder({ id, reason: 'Customer requested cancellation' }).unwrap();
        toast.success('Order cancelled successfully!');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to cancel order');
      }
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-16 text-center text-muted-foreground text-sm">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Order Not Found</h2>
        <Link to="/customer/orders"><Button>Back to Orders</Button></Link>
      </div>
    );
  }

  const isCancellable = ['pending', 'processing'].includes(order.status);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Link to="/customer/orders" className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Order History
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
            <Badge
              variant={
                order.status === 'delivered'
                  ? 'success'
                  : order.status === 'cancelled'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {order.status.toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
          </p>
        </div>

        {isCancellable && (
          <Button variant="destructive" size="sm" onClick={handleCancelOrder} loading={isCancelling}>
            Cancel Order
          </Button>
        )}
      </div>

      {/* Status Audit Timeline */}
      <Card className="p-6 space-y-4">
        <h2 className="font-bold text-sm flex items-center gap-2 border-b pb-3">
          <Clock className="w-4 h-4 text-primary" /> Order Timeline Audit Trail
        </h2>

        <div className="relative border-l-2 border-primary/20 ml-4 space-y-6 pt-2">
          {timeline.map((event, idx) => (
            <div key={idx} className="relative pl-6">
              <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-primary border-4 border-background" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs capitalize">{event.status}</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground uppercase">
                    Actor: {event.actor}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{event.description}</p>
                <span className="text-[10px] text-muted-foreground block">
                  {new Date(event.timestamp).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping & Delivery Info */}
      {order.shippingInfo && (
        <Card className="p-6 space-y-3 bg-primary/5 border-primary/20">
          <h2 className="font-bold text-sm flex items-center gap-2 text-primary">
            <Truck className="w-4 h-4" /> Shipping & Tracking Information
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block">Courier</span>
              <span className="font-semibold">{order.shippingInfo.courier || 'Standard Express'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Tracking ID</span>
              <span className="font-mono font-semibold">{order.shippingInfo.trackingId || 'Pending'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Estimated Delivery</span>
              <span className="font-semibold">{order.shippingInfo.estimatedDelivery || '3-5 Business Days'}</span>
            </div>
            {order.shippingInfo.trackingUrl && (
              <div>
                <a href={order.shippingInfo.trackingUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">
                  Track Package →
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Address & Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 md:col-span-1 space-y-2">
          <h3 className="font-bold text-xs flex items-center gap-1.5 border-b pb-2">
            <MapPin className="w-4 h-4 text-primary" /> Delivery Address
          </h3>
          <p className="text-xs font-semibold">{order.shippingAddress.street}</p>
          <p className="text-xs text-muted-foreground">
            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
          </p>
          <p className="text-xs text-muted-foreground">{order.shippingAddress.country}</p>
        </Card>

        <Card className="p-5 md:col-span-2 space-y-4">
          <h3 className="font-bold text-xs border-b pb-2">Purchased Items</h3>
          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs border-b pb-2 last:border-0">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <span className="text-muted-foreground">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <span className="font-bold">₹{(item.quantity * item.price).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t text-xs space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>₹{(order.subtotal || order.totalAmount).toLocaleString('en-IN')}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>-₹{order.discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t">
              <span>Total Paid</span>
              <span className="text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
