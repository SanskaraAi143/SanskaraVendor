
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { toast } from '@/components/ui/use-toast';

const StaffLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (data.user) {
        // Check if user is staff
        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id, is_active')
          .eq('supabase_auth_uid', data.user.id)
          .single();

        if (staffData) {
          if (!staffData.is_active) {
            await supabase.auth.signOut();
            setError('Your staff account is inactive. Please contact your vendor.');
            return;
          }

          // Staff login successful
          navigate('/staff/dashboard');
        } else {
          // Check if user is a vendor (not staff)
          const { data: vendorData, error: vendorError } = await supabase
            .from('vendors')
            .select('vendor_id')
            .eq('supabase_auth_uid', data.user.id)
            .single();

          if (!vendorError && vendorData) {
            // User is a vendor, redirect them to vendor portal
            await supabase.auth.signOut();
            toast({
              title: "Wrong Portal",
              description: "You're a vendor. Please use the main vendor portal to log in.",
              variant: "destructive",
            });
            setError("Vendors should use the main portal. Please visit the vendor login page.");
            return;
          }

          await supabase.auth.signOut();
          setError('Staff profile not found. Please contact your vendor to add you as staff.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (catchError: any) {
      setError(catchError.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/staff/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your inbox for password reset instructions.",
        });
      }
    } catch (catchError: any) {
      setError(catchError.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Vendor Staff Login</CardTitle>
          <CardDescription className="text-center">
            Access your vendor staff portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:underline"
            disabled={loading}
          >
            Forgot Password?
          </button>
          <p>
            Are you a vendor?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Login here
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StaffLoginPage;
