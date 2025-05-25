import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2, UserIcon, Phone, Mail, BadgeCheck } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';

interface StaffProfile {
  staff_id: string;
  vendor_id: string;
  display_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const StaffProfile: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [formData, setFormData] = useState({
    display_name: '',
    phone_number: '',
    email: '',
    role: '',
    is_active: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    description: '',
    image_urls: '',
    video_urls: '',
    portfolio_type: '',
  });

  useEffect(() => {
    const fetchStaffProfile = async () => {
      setLoading(true);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('User not authenticated');

        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('*')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData) throw new Error('Staff profile not found');

        setStaffProfile(staffData as StaffProfile);
        setFormData({
          display_name: staffData.display_name || '',
          phone_number: staffData.phone_number || '',
          email: staffData.email || '',
          role: staffData.role || '',
          is_active: staffData.is_active || false,
        });

        // Fetch portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('staff_portfolios')
          .select('*')
          .eq('staff_id', staffData.staff_id)
          .single();
        if (!portfolioError && portfolioData) {
          setPortfolio(portfolioData);
          setPortfolioForm({
            title: portfolioData.title || '',
            description: portfolioData.description || '',
            image_urls: (portfolioData.image_urls || []).join(', '),
            video_urls: (portfolioData.video_urls || []).join(', '),
            portfolio_type: portfolioData.portfolio_type || '',
          });
        } else {
          setPortfolioForm({
            title: '',
            description: '',
            image_urls: '',
            video_urls: '',
            portfolio_type: '',
          });
        }
      } catch (e: any) {
        console.error('Error fetching staff profile:', e);
        setError(e.message || 'An error occurred while fetching your profile');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffProfile) return;

    setSaving(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('vendor_staff')
        .update({
          display_name: formData.display_name,
          phone_number: formData.phone_number || null,
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active,
        })
        .eq('staff_id', staffProfile.staff_id);

      if (updateError) throw updateError;

      // Update local state
      setStaffProfile({
        ...staffProfile,
        display_name: formData.display_name,
        phone_number: formData.phone_number || null,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (e: any) {
      console.error('Error updating profile:', e);
      setError(e.message || 'Failed to update profile');
      toast({
        title: 'Update Failed',
        description: e.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPortfolioForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffProfile) return;
    setSaving(true);
    setError(null);
    try {
      const portfolioPayload = {
        staff_id: staffProfile.staff_id,
        vendor_id: staffProfile.vendor_id,
        portfolio_type: portfolioForm.portfolio_type || 'general',
        title: portfolioForm.title,
        description: portfolioForm.description,
        image_urls: portfolioForm.image_urls.split(',').map((s: string) => s.trim()).filter(Boolean),
        video_urls: portfolioForm.video_urls.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      let result;
      if (portfolio && portfolio.portfolio_id) {
        result = await supabase
          .from('staff_portfolios')
          .update(portfolioPayload)
          .eq('portfolio_id', portfolio.portfolio_id);
      } else {
        result = await supabase
          .from('staff_portfolios')
          .insert([portfolioPayload]);
      }
      if (result.error) throw result.error;
      toast({
        title: 'Portfolio Updated',
        description: 'Your portfolio has been updated successfully.',
      });
      setPortfolio(result.data ? result.data[0] : portfolioPayload);
    } catch (e: any) {
      setError(e.message || 'Failed to update portfolio');
      toast({
        title: 'Portfolio Update Failed',
        description: e.message || 'Failed to update portfolio',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading profile...</p>
      </div>
    );
  }

  if (error && !staffProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/staff/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Staff Profile</CardTitle>
            <CardDescription>
              View and update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffProfile && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name">Display Name</Label>
                    <Input id="display_name" name="display_name" value={formData.display_name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" name="role" value={formData.role} onChange={handleInputChange} required />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="is_active">Active</Label>
                    <Input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleInputChange} />
                  </div>
                </div>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Portfolio</CardTitle>
            <CardDescription>
              Add or update your portfolio details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePortfolioSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="portfolio_type">Portfolio Type</Label>
                  <Input id="portfolio_type" name="portfolio_type" value={portfolioForm.portfolio_type} onChange={handlePortfolioChange} placeholder="e.g. photographer, caterer, etc." />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" value={portfolioForm.title} onChange={handlePortfolioChange} required />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea id="description" name="description" value={portfolioForm.description} onChange={handlePortfolioChange} className="w-full border rounded p-2" rows={3} required />
                </div>
                <div>
                  <Label htmlFor="image_urls">Image URLs (comma separated)</Label>
                  <Input id="image_urls" name="image_urls" value={portfolioForm.image_urls} onChange={handlePortfolioChange} placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="video_urls">Video URLs (comma separated)</Label>
                  <Input id="video_urls" name="video_urls" value={portfolioForm.video_urls} onChange={handlePortfolioChange} placeholder="https://..." />
                </div>
              </div>
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Portfolio'}</Button>
            </form>
            {portfolio && (
              <div className="mt-6">
                <h3 className="font-semibold">Current Portfolio</h3>
                <div className="mb-2"><b>Type:</b> {portfolio.portfolio_type}</div>
                <div className="mb-2"><b>Title:</b> {portfolio.title}</div>
                <div className="mb-2"><b>Description:</b> {portfolio.description}</div>
                <div className="mb-2"><b>Images:</b> {(portfolio.image_urls || []).join(', ')}</div>
                <div className="mb-2"><b>Videos:</b> {(portfolio.video_urls || []).join(', ')}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffProfile;
