// src/pages/admin/AdminCouponsPage.tsx

import { useState } from 'react';
import { useGetCouponsQuery, useCreateCouponMutation } from '../../services/api/couponApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Ticket, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminCouponsPage() {
  const { data: couponsData, isLoading } = useGetCouponsQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 20,
    minOrderValue: 500,
    maxDiscount: 1000,
    expiryDate: '2026-12-31T23:59:59.000Z',
    usageLimit: 100,
  });

  const coupons = couponsData?.data?.coupons || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.value) {
      toast.error('Please enter coupon code and discount value');
      return;
    }
    try {
      await createCoupon(formData).unwrap();
      toast.success('Coupon created successfully!');
      setShowModal(false);
      setFormData({ code: '', type: 'percentage', value: 20, minOrderValue: 500, maxDiscount: 1000, expiryDate: '2026-12-31T23:59:59.000Z', usageLimit: 100 });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Ticket className="w-7 h-7 text-primary" /> Coupon Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create promotional discount codes and usage limits</p>
        </div>
        <Button onClick={() => setShowModal(!showModal)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      {showModal && (
        <Card className="p-6 border-primary/30 space-y-4">
          <h2 className="text-lg font-bold">New Coupon</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Coupon Code *</label>
              <Input placeholder="SAVE20" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="text-xs font-medium">Discount Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full h-10 rounded-lg border bg-background px-3 text-xs"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Value (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Value *</label>
              <Input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium">Min Order Value (₹)</label>
              <Input type="number" value={formData.minOrderValue} onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium">Total Usage Limit</label>
              <Input type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={isCreating}>Create Coupon</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading coupons...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Order</th>
                  <th className="p-3">Usage</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold font-mono text-primary">{c.code}</td>
                    <td className="p-3 font-semibold">
                      {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </td>
                    <td className="p-3 text-muted-foreground">₹{(c.minOrderValue || 0).toLocaleString('en-IN')}</td>
                    <td className="p-3 text-muted-foreground">{c.usedCount} / {c.usageLimit}</td>
                    <td className="p-3">
                      <Badge variant={c.isActive ? 'success' : 'destructive'}>
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </Badge>
                    </td>
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
