// src/pages/customer/AddressesPage.tsx

import { useState } from 'react';
import { useGetAddressesQuery, useAddAddressMutation, useDeleteAddressMutation } from '../../services/api/userApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AddressesPage() {
  const { data: addressData, isLoading } = useGetAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false,
  });

  const addresses = addressData?.data?.addresses || [];

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all required address fields');
      return;
    }
    try {
      await addAddress(formData).unwrap();
      toast.success('Address added successfully!');
      setShowForm(false);
      setFormData({ street: '', city: '', state: '', zipCode: '', country: 'India', isDefault: false });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to add address');
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await deleteAddress(addressId).unwrap();
      toast.success('Address deleted');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to delete address');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" /> Delivery Addresses
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your saved shipping locations</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add New Address
        </Button>
      </div>

      {/* Add Address Form */}
      {showForm && (
        <Card className="p-6 border-primary/30">
          <h2 className="text-lg font-bold mb-4">New Address Details</h2>
          <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Street Address</label>
              <Input
                placeholder="123 Tech Park Road, Apt 4B"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">City</label>
              <Input
                placeholder="Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">State</label>
              <Input
                placeholder="Maharashtra"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Zip Code</label>
              <Input
                placeholder="400001"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium">Country</label>
              <Input
                placeholder="India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={isAdding}>
                Save Address
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Address List */}
      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-card space-y-4">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
          <p className="text-sm text-muted-foreground">No saved addresses yet. Add one above for faster checkout.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <Card key={addr._id} className="p-5 relative space-y-2">
              {addr.isDefault && (
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit mb-2">
                  <CheckCircle2 className="w-3 h-3" /> DEFAULT
                </span>
              )}
              <p className="font-semibold text-sm">{addr.street}</p>
              <p className="text-xs text-muted-foreground">
                {addr.city}, {addr.state} - {addr.zipCode}
              </p>
              <p className="text-xs text-muted-foreground font-medium">{addr.country}</p>

              {addr._id && (
                <button
                  type="button"
                  onClick={() => handleDelete(addr._id!)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
