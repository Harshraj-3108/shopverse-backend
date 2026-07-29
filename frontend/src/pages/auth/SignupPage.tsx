// src/pages/auth/SignupPage.tsx

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router';
import { useSignupMutation } from '../../services/api/authApi';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { UserPlus, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().trim().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupPage() {
  const navigate = useNavigate();
  const [signup, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signup(data).unwrap();
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Enter your details to register a new account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">Full Name</label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="John Doe"
                  className="pl-9"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              </div>
            </div>

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
              <label className="text-xs font-medium">Password</label>
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

            <div className="space-y-1">
              <label className="text-xs font-medium">Phone Number (Optional)</label>
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
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" className="w-full" loading={isLoading}>
              Register Account
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
