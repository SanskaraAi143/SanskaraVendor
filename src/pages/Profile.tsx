
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader } from 'lucide-react';

const Profile: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    vendor_name: vendorProfile?.vendor_name || '',
    vendor_category: vendorProfile?.vendor_category || '',
    contact_email: vendorProfile?.contact_email || user?.email || '',
    phone_number: '',
    website_url: '',
    description: '',
  });

  // Load full profile data on component mount if not already loaded
  React.useEffect(() => {
    const loadVendorData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setProfile({
            vendor_name: data.vendor_name || '',
            vendor_category: data.vendor_category || '',
            contact_email: data.contact_email || user.email || '',
            phone_number: data.phone_number || '',
            website_url: data.website_url || '',
            description: data.description || '',
          });
        }
      } catch (error) {
        console.error('Error loading vendor data:', error);
        toast({
          title: 'Error',
          description: 'Unable to load vendor profile data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, [user, vendorProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setProfile((prev) => ({ ...prev, vendor_category: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('vendors')
        .update({
          vendor_name: profile.vendor_name,
          vendor_category: profile.vendor_category,
          contact_email: profile.contact_email,
          phone_number: profile.phone_number,
          website_url: profile.website_url,
          description: profile.description,
          updated_at: new Date().toISOString(),
        })
        .eq('supabase_auth_uid', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your profile has been updated',
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating your profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Vendor Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your vendor profile information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details shown to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor_name">Business Name</Label>
                  <Input
                    id="vendor_name"
                    name="vendor_name"
                    value={profile.vendor_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor_category">Business Category</Label>
                  <Select 
                    value={profile.vendor_category} 
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venue">Venue</SelectItem>
                      <SelectItem value="Catering">Catering</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                      <SelectItem value="Decor">Decor</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={profile.contact_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={profile.phone_number}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website_url">Website URL</Label>
                  <Input
                    id="website_url"
                    name="website_url"
                    value={profile.website_url}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={profile.description}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
