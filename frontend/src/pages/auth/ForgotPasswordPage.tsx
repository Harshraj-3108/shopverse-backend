// src/pages/auth/ForgotPasswordPage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { useForgotPasswordMutation } from '../../services/api/authApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { KeyRound, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await forgotPassword(data).unwrap();
      toast.success(res.message || 'If your email exists, a password reset link has been sent.');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to dispatch password reset request.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" loading={isLoading}>
              Send Reset Link
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Remember your password?{' '}
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
