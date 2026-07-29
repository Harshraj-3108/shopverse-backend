// src/pages/customer/OrdersPage.tsx

import { Link } from 'react-router';
import { useGetOrdersQuery } from '../../services/api/orderApi';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Package, Clock, ChevronRight } from 'lucide-react';

export function OrdersPage() {
  const { data: ordersData, isLoading } = useGetOrdersQuery();
  const orders = ordersData?.data?.orders || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Package className="w-7 h-7 text-primary" /> My Orders
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Track current orders and view historical receipts</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card space-y-4">
          <Package className="w-12 h-12 text-muted-foreground mx-auto opacity-30" />
          <h2 className="text-lg font-bold">No Orders Placed Yet</h2>
          <p className="text-xs text-muted-foreground">Your completed purchases will appear here.</p>
          <Link to="/products"><Button>Explore Catalog</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id} className="p-6 hover:border-primary/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-base text-primary">{order.orderNumber}</span>
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
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3.5 h-3.5" /> Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Total Amount</span>
                    <span className="text-lg font-extrabold text-foreground">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <Link to={`/customer/orders/${order._id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Items ({order.items.length}):</span>
                {order.items.map((item, i) => (
                  <span key={i} className="bg-muted px-2.5 py-1 rounded-md">
                    {item.name} x{item.quantity}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
