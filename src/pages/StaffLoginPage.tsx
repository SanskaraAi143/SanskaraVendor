
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Staff details are now handled by the AuthProvider fetching staffProfile automatically
        // after successful login. The navigate call will trigger a reload of the layout
        // which uses useAuth to check profiles and redirect.
        
        // However, for immediate verification during login:
        const staffDocRef = doc(db, 'vendor_staff', user.uid);
        const staffDocSnap = await getDoc(staffDocRef);
        
        let staffData = null;
        if (staffDocSnap.exists()) {
          staffData = staffDocSnap.data();
        } else {
            // Check by legacy UID
            const staffQuery = query(
              collection(db, 'vendor_staff'),
              where('supabase_auth_uid', '==', user.uid)
            );
            const staffSnapshot = await getDocs(staffQuery);
            if (!staffSnapshot.empty) {
                staffData = staffSnapshot.docs[0].data();
            }
        }

        if (staffData) {
          if (!staffData.is_active) {
            await signOut(auth);
            setError('Your staff account is inactive. Please contact your vendor.');
            return;
          }

          // Staff login successful
          navigate('/staff/dashboard');
        } else {
          // Check if user is a vendor (not staff)
          let vendorData = null;
          const vendorDocRef = doc(db, 'vendors', user.uid);
          const vendorDocSnap = await getDoc(vendorDocRef);
          
          if (vendorDocSnap.exists()) {
              vendorData = vendorDocSnap.data();
          } else {
              const vendorQuery = query(
                collection(db, 'vendors'),
                where('supabase_auth_uid', '==', user.uid)
              );
              const vendorSnapshot = await getDocs(vendorQuery);
              if (!vendorSnapshot.empty) {
                  vendorData = vendorSnapshot.docs[0].data();
              }
          }

          if (vendorData) {
            // User is a vendor, redirect them to vendor portal
            await signOut(auth);
            toast({
              title: "Wrong Portal",
              description: "You're a vendor. Please use the main vendor portal to log in.",
              variant: "destructive",
            });
            setError("Vendors should use the main portal. Please visit the vendor login page.");
            return;
          }

          await signOut(auth);
          setError('Staff profile not found. Please contact your vendor to add you as staff.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (catchError: any) {
      console.error('Login error:', catchError);
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
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for password reset instructions.",
      });
    } catch (catchError: any) {
      console.error('Password reset error:', catchError);
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
