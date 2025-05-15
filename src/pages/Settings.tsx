
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Bell, Shield, User, Mail, Phone, Globe, MapPin, Loader2 } from "lucide-react";
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NotificationSettings {
  email_notifications: boolean;
  booking_updates: boolean;
  marketing_notifications: boolean;
}

interface AddressSettings {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface VendorSettings {
  vendor_id: string;
  vendor_name: string;
  contact_email: string;
  phone_number: string;
  website_url: string;
  description: string;
  address: AddressSettings;
  notification_settings: NotificationSettings;
}

const Settings: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<VendorSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    booking_updates: true,
    marketing_notifications: false
  });
  
  useEffect(() => {
    if (vendorProfile?.vendor_id) {
      fetchSettings();
    }
  }, [vendorProfile]);
  
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch vendor profile details
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorProfile?.vendor_id)
        .single();
      
      if (error) throw error;
      
      // Parse JSON data or initialize defaults
      let addressData: AddressSettings = { 
        street: '', 
        city: '', 
        state: '', 
        postal_code: '', 
        country: '' 
      };
      
      if (data.address && typeof data.address === 'object') {
        addressData = data.address as AddressSettings;
      }
      
      let notifSettings = {
        email_notifications: true,
        booking_updates: true,
        marketing_notifications: false
      };
      
      // Initialize settings with vendor data
      const vendorSettings: VendorSettings = {
        vendor_id: data.vendor_id,
        vendor_name: data.vendor_name || '',
        contact_email: data.contact_email || user?.email || '',
        phone_number: data.phone_number || '',
        website_url: data.website_url || '',
        description: data.description || '',
        address: addressData,
        notification_settings: notifSettings
      };
      
      setSettings(vendorSettings);
      setNotificationSettings(notifSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (like address.street)
      const [parent, child] = name.split('.');
      setSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof VendorSettings] as any),
            [child]: value
          }
        };
      });
    } else {
      // Handle top-level fields
      setSettings(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [name]: value
        };
      });
    }
  };
  
  const saveSettings = async () => {
    if (!settings || !vendorProfile?.vendor_id) return;
    
    setIsSaving(true);
    
    try {
      // Prepare the data for update
      const updateData = {
        vendor_name: settings.vendor_name,
        contact_email: settings.contact_email,
        phone_number: settings.phone_number,
        website_url: settings.website_url,
        description: settings.description,
        address: settings.address,
        notification_settings: notificationSettings
      };
      
      // Update vendor profile
      const { error } = await supabase
        .from('vendors')
        .update(updateData)
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      toast({
        title: 'Settings saved',
        description: 'Your settings have been updated successfully'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeactivateAccount = async () => {
    if (!vendorProfile?.vendor_id) return;
    
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: false })
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      toast({
        title: 'Account deactivated',
        description: 'Your account has been temporarily deactivated'
      });
    } catch (error) {
      console.error('Error deactivating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to deactivate account',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
        <p className="ml-3 text-sanskara-maroon">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences and settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
              <CardDescription>Manage your business profile details</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Business Name</Label>
                <Input 
                  id="vendor_name" 
                  name="vendor_name"
                  value={settings?.vendor_name || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email Address</Label>
                <Input 
                  id="contact_email" 
                  name="contact_email"
                  type="email"
                  value={settings?.contact_email || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input 
                  id="phone_number" 
                  name="phone_number"
                  value={settings?.phone_number || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input 
                  id="website_url" 
                  name="website_url"
                  value={settings?.website_url || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea 
                id="description" 
                name="description"
                rows={4}
                value={settings?.description || ''}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Address Information */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
              <CardDescription>Manage your business location</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address.street">Street Address</Label>
              <Input 
                id="address.street" 
                name="address.street"
                value={settings?.address?.street || ''}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                <Input 
                  id="address.city" 
                  name="address.city"
                  value={settings?.address?.city || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.state">State/Province</Label>
                <Input 
                  id="address.state" 
                  name="address.state"
                  value={settings?.address?.state || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.postal_code">Postal Code</Label>
                <Input 
                  id="address.postal_code" 
                  name="address.postal_code"
                  value={settings?.address?.postal_code || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
                <Input 
                  id="address.country" 
                  name="address.country"
                  value={settings?.address?.country || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex-1">Email Notifications</Label>
              <Switch 
                id="email-notifications" 
                checked={notificationSettings.email_notifications}
                onCheckedChange={() => handleNotificationChange('email_notifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="booking-notifications" className="flex-1">Booking Updates</Label>
              <Switch 
                id="booking-notifications" 
                checked={notificationSettings.booking_updates}
                onCheckedChange={() => handleNotificationChange('booking_updates')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="marketing-notifications" className="flex-1">Marketing & Promotions</Label>
              <Switch 
                id="marketing-notifications" 
                checked={notificationSettings.marketing_notifications}
                onCheckedChange={() => handleNotificationChange('marketing_notifications')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={saveSettings} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Notification Settings'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Security */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Change your account password</p>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Button variant="outline">Set Up</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Danger Zone */}
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex-1">
              <CardTitle className="flex items-center text-red-500">
                <AlertCircle className="h-5 w-5 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription>Actions that cannot be undone</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Deactivate Account</p>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable your account and hide your vendor listing
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-amber-600 border-amber-600">
                    Deactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will temporarily deactivate your account and hide your vendor listing from clients.
                      You can reactivate your account at any time by logging back in.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-amber-600 text-white hover:bg-amber-700"
                      onClick={handleDeactivateAccount}
                    >
                      Deactivate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 border-red-600">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account
                      and remove all of your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
