// src/pages/auth/ResetPasswordPage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams, useNavigate, Link } from 'react-router';
import { useResetPasswordMutation } from '../../services/api/authApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Reset token missing in URL');
      return;
    }
    try {
      const res = await resetPassword({ token, password: data.password }).unwrap();
      toast.success(res.message || 'Password has been updated successfully!');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Password reset failed or token expired.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your new account password</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">New Password</label>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="At least 6 characters"
                  className="pl-9"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" loading={isLoading}>
              Update Password
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Back to Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
