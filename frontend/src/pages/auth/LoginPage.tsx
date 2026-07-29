// src/pages/auth/LoginPage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router';
import { useLoginMutation } from '../../services/api/authApi';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { setCredentials } from '../../features/auth/authSlice';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { LogIn, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap();
      if (res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            token: res.data.accessToken,
          })
        );
        toast.success(`Welcome back, ${res.data.user.name}!`);
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid credentials or unverified email');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Enter your email and password to log in</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Email Address</label>
              <div className="relative">
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  placeholder="••••••••"
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
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline">
                Create Account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
