// src/pages/auth/VerifyEmailPage.tsx

import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { useVerifyEmailQuery } from '../../services/api/authApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { data, isLoading, isError, error } = useVerifyEmailQuery(token, { skip: !token });

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md text-center p-6 space-y-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>Validating your email verification token...</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {!token ? (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-sm text-muted-foreground">Verification token is missing in URL.</p>
            </div>
          ) : isLoading ? (
            <div className="py-8 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-muted-foreground">Verifying with server...</p>
            </div>
          ) : isError ? (
            <div className="space-y-4">
              <XCircle className="w-12 h-12 text-destructive mx-auto" />
              <p className="text-sm text-destructive font-medium">
                {(error as any)?.data?.message || 'Verification token is invalid or has expired.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-medium">Your email address has been verified successfully!</p>
            </div>
          )}

          <div className="pt-4">
            <Link to="/login">
              <Button className="w-full">Proceed to Login</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
