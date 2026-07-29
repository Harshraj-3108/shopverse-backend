// src/pages/admin/AdminOrdersPage.tsx

import { useState } from 'react';
import { useGetAllOrdersAdminQuery, useUpdateOrderStatusAdminMutation, useUpdateShippingInfoAdminMutation } from '../../services/api/orderApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Truck } from 'lucide-react';
import type { OrderStatus } from '../../types';
import toast from 'react-hot-toast';

export function AdminOrdersPage() {
  const { data: ordersData, isLoading } = useGetAllOrdersAdminQuery();
  const [updateStatus] = useUpdateOrderStatusAdminMutation();
  const [updateShipping] = useUpdateShippingInfoAdminMutation();

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState('');
  const [courier, setCourier] = useState('');

  const orders = ordersData?.data?.orders || [];

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Order status updated to ${newStatus.toUpperCase()}`);
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid status transition');
    }
  };

  const handleSaveShipping = async (id: string) => {
    if (!trackingId || !courier) {
      toast.error('Please enter tracking ID and courier name');
      return;
    }
    try {
      await updateShipping({
        id,
        shippingInfo: { trackingId, courier, estimatedDelivery: '2026-08-05' },
      }).unwrap();
      toast.success('Tracking info added successfully!');
      setSelectedOrderId(null);
      setTrackingId('');
      setCourier('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update shipping info');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="w-7 h-7 text-primary" /> Admin Order Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Review orders, transition fulfillment statuses, and inject tracking details</p>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading orders...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Order #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Change Status</th>
                  <th className="p-3 text-right">Shipping</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold text-primary">{o.orderNumber}</td>
                    <td className="p-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-bold">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <Badge variant={o.status === 'delivered' ? 'success' : o.status === 'cancelled' ? 'destructive' : 'secondary'}>
                        {o.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o._id, e.target.value as OrderStatus)}
                        className="h-8 rounded border bg-background px-2 text-xs font-medium"
                      >
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="shipped">shipped</option>
                        <option value="delivered">delivered</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(selectedOrderId === o._id ? null : o._id)}
                        className="gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" /> Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Shipping Injection Modal */}
      {selectedOrderId && (
        <Card className="p-6 border-primary/30 space-y-4">
          <h3 className="font-bold text-sm">Update Shipping Details for Selected Order</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Courier Name (BlueDart Express)" value={courier} onChange={(e) => setCourier(e.target.value)} />
            <Input placeholder="Tracking ID (TRACK-998877)" value={trackingId} onChange={(e) => setTrackingId(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedOrderId(null)}>Cancel</Button>
            <Button size="sm" onClick={() => handleSaveShipping(selectedOrderId)}>Save Tracking Info</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
