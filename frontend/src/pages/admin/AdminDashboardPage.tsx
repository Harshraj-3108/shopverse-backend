// src/pages/admin/AdminDashboardPage.tsx

import { useGetAllOrdersAdminQuery } from '../../services/api/orderApi';
import { useGetCacheStatsQuery, useInvalidateAllCacheMutation } from '../../services/api/cacheAdminApi';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DollarSign, ShoppingCart, Database, RefreshCw, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminDashboardPage() {
  const { data: ordersData, isLoading } = useGetAllOrdersAdminQuery();
  const { data: cacheData, refetch: refetchCache } = useGetCacheStatsQuery();
  const [flushAllCache, { isLoading: isFlushing }] = useInvalidateAllCacheMutation();

  const orders = ordersData?.data?.orders || [];
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0);
  const cacheStats = cacheData?.data?.cache;

  const handleFlushCache = async () => {
    if (confirm('Flush all Redis cache keys? This will clear cache-aside memory.')) {
      try {
        await flushAllCache().unwrap();
        toast.success('Redis cache flushed successfully');
        refetchCache();
      } catch (err: any) {
        toast.error('Failed to flush cache');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">High-level sales revenue, metrics, and Redis cache controls</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">₹{totalRevenue.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Paid Order Transactions
          </span>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{orders.length}</p>
          <span className="text-[11px] text-muted-foreground">Across all fulfillment statuses</span>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Redis Cache Status</span>
            <Database className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-foreground">
            {cacheStats?.connected ? (
              <Badge variant="success">CONNECTED ({cacheStats.totalKeys || 0} keys)</Badge>
            ) : (
              <Badge variant="secondary">CACHE DEGRADED</Badge>
            )}
          </p>
          <span className="text-[11px] text-muted-foreground">Cache-aside speedup active</span>
        </Card>

        <Card className="p-6 space-y-2 flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cache Actions</span>
          <Button size="sm" variant="outline" onClick={handleFlushCache} loading={isFlushing} className="gap-1.5 w-full">
            <RefreshCw className="w-3.5 h-3.5" /> Flush Redis Cache
          </Button>
        </Card>
      </div>

      {/* Recent Orders List */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-bold">Recent Customer Orders</h2>
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading recent orders...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-muted-foreground">No customer orders placed yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold text-primary">{order.orderNumber}</td>
                    <td className="p-3 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Badge variant={order.paymentStatus === 'paid' ? 'success' : 'outline'}>
                        {order.paymentStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary">{order.status.toUpperCase()}</Badge>
                    </td>
                    <td className="p-3 text-right font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
