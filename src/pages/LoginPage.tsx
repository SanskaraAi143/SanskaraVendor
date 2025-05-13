
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, EyeOffIcon, UserIcon, KeyIcon } from 'lucide-react';
import Logo from '@/components/Logo';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1000);
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
          Vendor Login Portal
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Access your dashboard to manage bookings and services
        </p>
        
        <Tabs defaultValue="vendor" className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="vendor">Vendor Login</TabsTrigger>
            <TabsTrigger value="staff">Staff Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vendor">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor-email">Email</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="vendor-email" 
                    type="email" 
                    placeholder="vendor@example.com" 
                    className="pl-10 sanskara-input" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="vendor-password">Password</Label>
                  <a href="#" className="text-xs text-sanskara-maroon hover:text-sanskara-red">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="vendor-password" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 sanskara-input" 
                    required 
                  />
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
              </div>
              
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
          </TabsContent>
          
          <TabsContent value="staff">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-email">Email</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="staff-email" 
                    type="email" 
                    placeholder="staff@example.com" 
                    className="pl-10 sanskara-input" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="staff-password">Password</Label>
                  <a href="#" className="text-xs text-sanskara-maroon hover:text-sanskara-red">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="staff-password" 
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 sanskara-input" 
                    required 
                  />
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
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-sanskara-gold hover:bg-sanskara-amber text-sanskara-maroon" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-t-transparent border-sanskara-maroon rounded-full animate-spin mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <a href="#" className="text-sanskara-red hover:underline font-medium">
              Contact Admin
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
