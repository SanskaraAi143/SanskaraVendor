import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon, UserIcon, KeyIcon, Loader, CheckCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  vendorName: z.string().min(2, 'Business name must be at least 2 characters'),
  vendorCategory: z.string().min(1, 'Please select a category'),
  displayName: z.string().min(2, 'Your name must be at least 2 characters'),
  phone: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const categories = [
  "Venue", "Catering", "Photography", "Videography", "Decor", 
  "Makeup", "Clothing", "Music", "Transportation", "Invitation", "Other"
];

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, user, signIn, signUp } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
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
      displayName: '',
      phone: '',
    }
  });
  
  const onLogin = (data: LoginFormValues) => {
    signIn(data.email, data.password);
  };
  
  const onSignup = async (data: SignupFormValues) => {
    try {
      const userType = activeTab === 'signup' ? 'vendor' : 'vendor_staff';
      await signUp(data.email, data.password, {
        vendor_name: data.vendorName,
        vendor_category: data.vendorCategory,
        display_name: data.displayName,
        phone_number: data.phone || null
      }, userType);
      setSignupSuccess(true);

      // Reset form and switch to login tab after a delay
      setTimeout(() => {
        signupForm.reset();
        setActiveTab('login');
        setSignupSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Signup error:', error);
    }
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
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
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
                        <FormLabel>Password</FormLabel>
                        <a href="#" className="text-xs text-sanskara-maroon hover:text-sanskara-red">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input 
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
                    <div className="flex items-center justify-center">
                      <Loader className="h-4 w-4 animate-spin mr-2" />
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
            {signupSuccess ? (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Registration Successful!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your account has been created. You can now sign in with your credentials.
                </AlertDescription>
              </Alert>
            ) : (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input 
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
                        <FormLabel>Password</FormLabel>
                        <div className="relative">
                          <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input 
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
                        <FormDescription className="text-xs">
                          Password must be at least 6 characters long
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="vendorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input 
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
                        <FormLabel>Business Category</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            {...field}
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
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
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your Name" 
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+91 98765 43210" 
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
                      <div className="flex items-center justify-center">
                        <Loader className="h-4 w-4 animate-spin mr-2" />
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </Form>
            )}
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

        {/* Add a link to redirect staff to the staff login page */}
        <div className="text-center mt-4">
          <p className="text-sm">
            Are you a staff member?{' '}
            <a href="/staff/login" className="text-blue-600 hover:underline">
              Login here
            </a>
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
