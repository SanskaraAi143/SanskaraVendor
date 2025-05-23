
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PasswordResetForm from '@/components/staff/PasswordResetForm';

const StaffLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Check if we're in password reset mode from URL
  const isReset = searchParams.get('reset') === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "Welcome to the vendor staff portal!",
      });
      
      navigate('/staff-portal');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.error_description || error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/staff-login?reset=true`,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions",
      });
      
      setResetMode(false);
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.error_description || error.message || "An error occurred while sending the reset email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If we're in reset mode from URL param, show the password reset form
  if (isReset) {
    return <PasswordResetForm />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sanskara-purple/10 to-sanskara-red/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-sanskara-red">Vendor Staff Portal</CardTitle>
          <CardDescription>
            {resetMode 
              ? "Reset your password to access the staff portal" 
              : "Login to manage your portfolio"}
          </CardDescription>
        </CardHeader>

        {resetMode ? (
          <form onSubmit={handleResetPassword}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full bg-sanskara-red hover:bg-sanskara-red/90"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setResetMode(false)}
                disabled={loading}
              >
                Back to Login
              </Button>
            </CardFooter>
          </form>
        ) : (
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium">Password</label>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={() => setResetMode(true)}
                        type="button"
                      >
                        Forgot Password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground">
                      Staff members cannot register directly. You need to be invited by a vendor.
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-sanskara-red hover:bg-sanskara-red/90"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        )}
      </Card>
    </div>
  );
};

export default StaffLogin;
