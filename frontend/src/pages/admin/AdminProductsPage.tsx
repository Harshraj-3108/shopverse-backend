// src/pages/admin/AdminProductsPage.tsx

import { useState } from 'react';
import { useGetProductsQuery, useCreateProductMutation, useDeleteProductMutation } from '../../services/api/productApi';
import { useGetCategoriesQuery } from '../../services/api/categoryApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Package, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminProductsPage() {
  const { data: productsData, isLoading } = useGetProductsQuery({ limit: 50 });
  const { data: categoriesData } = useGetCategoriesQuery();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: 0,
    salePrice: 0,
    stockQuantity: 10,
    categoryId: '',
  });

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.categoryId || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }
    try {
      await createProduct({
        ...formData,
        salePrice: formData.salePrice > 0 ? formData.salePrice : undefined,
      }).unwrap();
      toast.success('Product created successfully!');
      setShowModal(false);
      setFormData({ name: '', sku: '', description: '', price: 0, salePrice: 0, stockQuantity: 10, categoryId: '' });
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product catalog item?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted');
      } catch (err: any) {
        toast.error('Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-primary" /> Product Catalog Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage catalog items, inventory, and pricing</p>
        </div>
        <Button onClick={() => setShowModal(!showModal)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Create Product
        </Button>
      </div>

      {showModal && (
        <Card className="p-6 border-primary/30 space-y-4">
          <h2 className="text-lg font-bold">New Product Item</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium">Product Name *</label>
              <Input placeholder="Wireless Earbuds" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">SKU *</label>
              <Input placeholder="SKU-1001" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium">Description *</label>
              <Input placeholder="Detailed specifications..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Price (₹) *</label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium">Sale Price (₹) (Optional)</label>
              <Input type="number" value={formData.salePrice} onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium">Stock Quantity *</label>
              <Input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-xs font-medium">Category *</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full h-10 rounded-lg border bg-background px-3 text-xs"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={isCreating}>Create Product</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Product List Table */}
      <Card className="p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading catalog items...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/20">
                    <td className="p-3 font-mono text-muted-foreground">{p.sku}</td>
                    <td className="p-3 font-bold">{p.name}</td>
                    <td className="p-3 font-bold text-primary">₹{p.price.toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <Badge variant={p.stockQuantity > 0 ? 'success' : 'destructive'}>
                        {p.stockQuantity} in stock
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p._id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
