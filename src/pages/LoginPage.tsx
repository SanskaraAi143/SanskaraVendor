
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon, UserIcon, KeyIcon } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  vendorName: z.string().min(2, 'Vendor name must be at least 2 characters'),
  vendorCategory: z.string().min(2, 'Please select a category'),
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      vendorName: '',
      vendorCategory: '',
      displayName: ''
    }
  });
  
  const onLogin = (data: LoginFormValues) => {
    signIn(data.email, data.password);
  };
  
  const onSignup = (data: SignupFormValues) => {
    signUp(data.email, data.password, {
      vendor_name: data.vendorName,
      vendor_category: data.vendorCategory,
      display_name: data.displayName
    });
    setActiveTab('login');
  };
  
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url("/subtle-bg-pattern.svg"), linear-gradient(135deg, #FFF8DC 0%, #D4AF37 100%)',
        backgroundSize: '300px 300px, cover',
        backgroundBlendMode: 'overlay',
      }}
    >
      <Card className="w-full max-w-md p-6 shadow-xl bg-white/95 rounded-xl">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        
        <h1 className="text-2xl font-bold text-center gradient-text mb-2">
          Vendor Portal
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Access your dashboard to manage bookings and services
        </p>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="vendor@example.com" 
                            className="pl-10 sanskara-input"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a href="#" className="text-xs text-sanskara-maroon hover:text-sanskara-red">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            className="pl-10 pr-10 sanskara-input"
                            {...field}
                          />
                        </FormControl>
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-sanskara-red hover:bg-sanskara-maroon text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="signup">
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                <FormField
                  control={signupForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            id="signup-email" 
                            type="email" 
                            placeholder="vendor@example.com" 
                            className="pl-10 sanskara-input"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
                            id="signup-password" 
                            type={showPassword ? "text" : "password"} 
                            className="pl-10 pr-10 sanskara-input"
                            {...field}
                          />
                        </FormControl>
                        <button 
                          type="button" 
                          className="absolute right-3 top-1/2 transform -translate-y-1/2" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <EyeIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="vendorName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="vendor-name">Vendor Business Name</Label>
                      <FormControl>
                        <Input 
                          id="vendor-name" 
                          placeholder="Your Business Name" 
                          className="sanskara-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="vendorCategory"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="vendor-category">Business Category</Label>
                      <FormControl>
                        <select 
                          id="vendor-category"
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          {...field}
                        >
                          <option value="">Select a category</option>
                          <option value="Venue">Venue</option>
                          <option value="Catering">Catering</option>
                          <option value="Photography">Photography</option>
                          <option value="Decor">Decor</option>
                          <option value="Clothing">Clothing</option>
                          <option value="Music">Music</option>
                          <option value="Other">Other</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={signupForm.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="display-name">Your Name</Label>
                      <FormControl>
                        <Input 
                          id="display-name" 
                          placeholder="Your Name" 
                          className="sanskara-input"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-sanskara-gold hover:bg-sanskara-amber text-sanskara-maroon" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-t-transparent border-sanskara-maroon rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground">
            {activeTab === 'login' ? (
              <>
                Don't have an account?{' '}
                <button 
                  onClick={() => setActiveTab('signup')} 
                  className="text-sanskara-red hover:underline font-medium"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button 
                  onClick={() => setActiveTab('login')} 
                  className="text-sanskara-red hover:underline font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
        
        <div className="border-t mt-6 pt-6">
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
      
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-sm text-sanskara-maroon/70">
          © 2025 SanskaraVendors. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
