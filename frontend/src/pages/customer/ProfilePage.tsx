// src/pages/customer/ProfilePage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useUpdateProfileMutation } from '../../services/api/userApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { User as UserIcon, Mail, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().trim().optional(),
});

type ProfileFormData = z.infer<typeof schema>;

export function ProfilePage() {
  const { user } = useAuth();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account information and contact details</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user?.name}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {user?.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded uppercase">
                {user?.role}
              </span>
              {user?.isEmailVerified && (
                <span className="text-[11px] bg-emerald-500/10 text-emerald-600 font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Email Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium">Full Name</label>
            <div className="relative">
              <Input
                type="text"
                className="pl-9"
                error={errors.name?.message}
                {...register('name')}
              />
              <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium">Phone Number</label>
            <div className="relative">
              <Input
                type="tel"
                placeholder="+91 9876543210"
                className="pl-9"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" loading={isLoading}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
