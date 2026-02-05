
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon, UserIcon, KeyIcon, Loader, CheckCircle, Phone, MessageSquare } from 'lucide-react';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
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
  vendorName: z.string().optional(),
  vendorCategory: z.string().optional(),
  displayName: z.string().min(2, 'Your name must be at least 2 characters'),
  phone: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const categories = [
  "Venue", "Catering", "Photography", "Videography", "Decor", 
  "Makeup", "Clothing", "Music", "Transportation", "Invitation", "Other"
];

const GoogleIcon = () => (
  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
    <path fill="none" d="M0 0h24v24H0z" />
  </svg>
);

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, user, signIn, signUp, resetPassword, signInWithGoogle, signInWithPhone, verifyOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
    location.pathname === '/signup' ? 'signup' : 'login'
  );
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
    const isStaffSignup = activeTab === 'signup' && location.search.includes('type=staff');
    
    try {
      // Logic for user type assignment
      // If signing up via staff link, mark as vendor_staff initially so they don't get created as full vendors
      // AuthProvider's auto-detect will also double check and link them
      const userType = isStaffSignup ? 'vendor_staff' : (activeTab === 'signup' ? 'vendor' : 'vendor_staff');
      
      await signUp(data.email, data.password, {
        vendor_name: isStaffSignup ? 'Staff Member' : data.vendorName,
        vendor_category: isStaffSignup ? 'Staff' : data.vendorCategory,
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
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await signInWithPhone(phoneNumber);
      setShowOtpInput(true);
    } catch (error) {
      // Error is already toasted in useAuth, but we catch here to prevent switching to OTP view
      console.error("Phone sign-in failed:", error);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }
    const userType = activeTab === 'signup' ? 'vendor' : 'vendor'; // Default to vendor for this portal
    await verifyOtp(otp, userType);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
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
          AI-Powered Vendor Portal
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Access your intelligent dashboard to manage bookings and services
        </p>
        
        <Tabs defaultValue="login" value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="flex justify-center gap-4 mb-6 mt-4">
              <Button 
                variant={authMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('email')}
                className="flex-1"
                size="sm"
              >
                <UserIcon className="w-4 h-4 mr-2" /> Email
              </Button>
              <Button 
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('phone')}
                className="flex-1"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" /> Phone
              </Button>
            </div>

            {authMethod === 'email' ? (
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
                          <FormLabel className="text-sanskara-maroon/80">Password</FormLabel>
                          <button
                            type="button"
                            onClick={() => {
                              const email = loginForm.getValues('email');
                              if (!email) {
                                toast({
                                  title: "Email Required",
                                  description: "Please enter your email address to reset your password.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              resetPassword(email);
                            }}
                            className="text-xs text-sanskara-maroon hover:underline font-semibold"
                          >
                            Forgot password?
                          </button>
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
                      'Sign In with Email'
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                {showOtpInput ? (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp">Verification Code</Label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="otp"
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value)} 
                          placeholder="Enter 6-digit code" 
                          className="pl-10 sanskara-input"
                          autoComplete="one-time-code"
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-sanskara-red hover:bg-sanskara-maroon text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Verify & Continue'}
                    </Button>
                    <button 
                      type="button" 
                      onClick={() => setShowOtpInput(false)}
                      className="w-full text-sm text-sanskara-maroon hover:underline text-center"
                    >
                      Use a different number
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="phone"
                          value={phoneNumber} 
                          onChange={(e) => setPhoneNumber(e.target.value)} 
                          placeholder="+91 98765 43210" 
                          className="pl-10 sanskara-input"
                          autoComplete="tel"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">We'll send you a verification code</p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-sanskara-red hover:bg-sanskara-maroon text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Get OTP Code'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </TabsContent>


          
          <TabsContent value="signup">
            <div className="flex justify-center gap-4 mb-6 mt-4">
              <Button 
                variant={authMethod === 'email' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('email')}
                className="flex-1"
                size="sm"
              >
                <UserIcon className="w-4 h-4 mr-2" /> Email
              </Button>
              <Button 
                variant={authMethod === 'phone' ? 'default' : 'outline'}
                onClick={() => setAuthMethod('phone')}
                className="flex-1"
                size="sm"
              >
                <Phone className="w-4 h-4 mr-2" /> Phone
              </Button>
            </div>

            {signupSuccess ? (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="text-green-800">Registration Successful!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your account has been created. You can now sign in.
                </AlertDescription>
              </Alert>
            ) : authMethod === 'email' ? (
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
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input 
                              placeholder="Your Full Name" 
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {!location.search.includes('type=staff') && (
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={signupForm.control}
                        name="vendorName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Business" 
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
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <select 
                                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              >
                                <option value="">Select</option>
                                {categories.map(category => (
                                  <option key={category} value={category}>{category}</option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-sanskara-gold hover:bg-sanskara-amber text-sanskara-maroon" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Create Account'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                {showOtpInput ? (
                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-signup">Verification Code</Label>
                      <Input 
                        id="otp-signup"
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        placeholder="Enter 6-digit code" 
                        className="sanskara-input"
                        autoComplete="one-time-code"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-sanskara-gold hover:bg-sanskara-amber text-sanskara-maroon"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Verify & Continue'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone-signup">Phone Number</Label>
                      <Input 
                        id="phone-signup"
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        placeholder="+91 98765 43210" 
                        className="sanskara-input"
                        autoComplete="tel"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-sanskara-gold hover:bg-sanskara-amber text-sanskara-maroon"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : 'Send Verification OTP'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-muted-foreground font-serif">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full border-sanskara-gold/30 hover:bg-sanskara-beige/30"
          onClick={() => signInWithGoogle()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          Google
        </Button>
        
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
      
      <div className="mt-auto text-center w-full">
        <p className="text-sm text-sanskara-maroon/70">
          © 2025 Sanskara AI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
