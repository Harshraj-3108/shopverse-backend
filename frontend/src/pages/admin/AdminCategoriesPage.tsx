// src/pages/admin/AdminCategoriesPage.tsx

import { useState } from 'react';
import { useGetCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation } from '../../services/api/categoryApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { FolderTree, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function AdminCategoriesPage() {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const categories = categoriesData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ name: name.trim(), description: description.trim() }).unwrap();
      toast.success('Category created successfully!');
      setShowModal(false);
      setName('');
      setDescription('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id).unwrap();
        toast.success('Category deleted');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Cannot delete category with subcategories');
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="w-7 h-7 text-primary" /> Category Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage category hierarchies</p>
        </div>
        <Button onClick={() => setShowModal(!showModal)} className="gap-1.5">
          <Plus className="w-4 h-4" /> Create Category
        </Button>
      </div>

      {showModal && (
        <Card className="p-6 border-primary/30 space-y-4">
          <h2 className="text-lg font-bold">New Category</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-medium">Category Name *</label>
              <Input placeholder="Electronics" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Description</label>
              <Input placeholder="Gadgets and devices" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" loading={isCreating}>Save Category</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {isLoading ? (
          <p className="text-xs text-muted-foreground">Loading categories...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b bg-muted/30 text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-muted/20">
                    <td className="p-3 font-bold">{c.name}</td>
                    <td className="p-3 font-mono text-muted-foreground">{c.slug}</td>
                    <td className="p-3 text-muted-foreground">{c.description || '-'}</td>
                    <td className="p-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c._id)}>
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
