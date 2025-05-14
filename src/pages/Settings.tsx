
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Check, Info, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

interface VendorSettings {
  vendor_name: string;
  vendor_category: string;
  contact_email: string;
  phone_number: string | null;
  website_url: string | null;
  description: string | null;
  address: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  } | null;
  notification_preferences?: {
    email_bookings: boolean;
    email_reviews: boolean;
    sms_bookings: boolean;
    sms_reviews: boolean;
  };
}

const Settings: React.FC = () => {
  const { vendorProfile, refreshVendorProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [vendorSettings, setVendorSettings] = useState<VendorSettings>({
    vendor_name: '',
    vendor_category: '',
    contact_email: '',
    phone_number: '',
    website_url: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'India'
    },
    notification_preferences: {
      email_bookings: true,
      email_reviews: true,
      sms_bookings: false,
      sms_reviews: false
    }
  });
  
  const vendorCategories = [
    "Photographer",
    "Videographer",
    "Caterer",
    "Venue",
    "Decorator",
    "Makeup Artist",
    "Mehndi Artist",
    "Wedding Planner",
    "DJ/Music",
    "Florist",
    "Transportation",
    "Invitation Cards"
  ];

  useEffect(() => {
    if (vendorProfile) {
      fetchVendorSettings();
    }
  }, [vendorProfile]);

  const fetchVendorSettings = async () => {
    if (!vendorProfile) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('vendor_id', vendorProfile.vendor_id)
        .single();
        
      if (error) throw error;
      
      // Parse and set the data
      setVendorSettings({
        vendor_name: data.vendor_name || '',
        vendor_category: data.vendor_category || '',
        contact_email: data.contact_email || '',
        phone_number: data.phone_number || '',
        website_url: data.website_url || '',
        description: data.description || '',
        address: data.address || {
          street: '',
          city: '',
          state: '',
          postal_code: '',
          country: 'India'
        },
        notification_preferences: {
          email_bookings: true,
          email_reviews: true,
          sms_bookings: false,
          sms_reviews: false,
          ...data.notification_preferences
        }
      });
    } catch (error) {
      console.error('Error fetching vendor settings:', error);
      toast({
        title: "Error",
        description: "Could not load your settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!vendorProfile) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          vendor_name: vendorSettings.vendor_name,
          vendor_category: vendorSettings.vendor_category,
          contact_email: vendorSettings.contact_email,
          phone_number: vendorSettings.phone_number,
          website_url: vendorSettings.website_url,
          description: vendorSettings.description,
          address: vendorSettings.address,
          updated_at: new Date().toISOString()
        })
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      // Refresh vendor profile in auth context
      await refreshVendorProfile();
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not save profile changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!vendorProfile) return;
    
    setIsSaving(true);
    try {
      // Create a patchObject that only contains the notification_preferences
      const patchObject = {
        notification_preferences: vendorSettings.notification_preferences,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('vendors')
        .update(patchObject)
        .eq('vendor_id', vendorProfile.vendor_id);
        
      if (error) throw error;
      
      toast({
        title: "Notification preferences updated",
        description: "Your notification settings have been saved",
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Error",
        description: "Could not save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof VendorSettings, value: any) => {
    setVendorSettings({
      ...vendorSettings,
      [field]: value
    });
  };

  const handleAddressChange = (field: string, value: string) => {
    setVendorSettings({
      ...vendorSettings,
      address: {
        ...vendorSettings.address,
        [field]: value
      }
    });
  };

  const handleNotificationChange = (field: keyof typeof vendorSettings.notification_preferences, value: boolean) => {
    setVendorSettings({
      ...vendorSettings,
      notification_preferences: {
        ...vendorSettings.notification_preferences,
        [field]: value
      }
    });
  };
  
  const getInitials = (name: string = 'Vendor') => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="h-10 w-10 rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red animate-spin"></div>
        <p className="ml-3 text-sanskara-maroon">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="profile" className="py-2.5">Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="py-2.5">Notifications</TabsTrigger>
          <TabsTrigger value="security" className="py-2.5">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {/* Business Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>
                    Update your business details and how you appear to clients
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={vendorSettings.vendor_name}
                        onChange={(e) => handleInputChange('vendor_name', e.target.value)}
                        placeholder="Your business name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Business Category</Label>
                      <Select 
                        value={vendorSettings.vendor_category} 
                        onValueChange={(value) => handleInputChange('vendor_category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {vendorCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      value={vendorSettings.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe your business, services, and unique selling points"
                      className="min-h-[120px]"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How clients and Sanskara can reach you
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={vendorSettings.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="contact@yourbusiness.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={vendorSettings.phone_number || ''}
                        onChange={(e) => handleInputChange('phone_number', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      value={vendorSettings.website_url || ''}
                      onChange={(e) => handleInputChange('website_url', e.target.value)}
                      placeholder="https://www.yourbusiness.com"
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Business Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Address</CardTitle>
                  <CardDescription>
                    Where your business is located
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={vendorSettings.address?.street || ''}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="123 Main Street"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={vendorSettings.address?.city || ''}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="Mumbai"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={vendorSettings.address?.state || ''}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code</Label>
                      <Input
                        id="postal_code"
                        value={vendorSettings.address?.postal_code || ''}
                        onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                        placeholder="400001"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={vendorSettings.address?.country || 'India'}
                        onChange={(e) => handleAddressChange('country', e.target.value)}
                        placeholder="India"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button 
                  className="bg-sanskara-red text-white hover:bg-sanskara-maroon"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Preview Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Profile Preview</CardTitle>
                  <CardDescription>How clients see your business</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4 border-2 border-sanskara-red/10">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-sanskara-red/10 text-sanskara-red">
                      {getInitials(vendorSettings.vendor_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-bold mb-1">{vendorSettings.vendor_name || 'Your Business Name'}</h3>
                  <Badge variant="outline" className="mb-3">
                    {vendorSettings.vendor_category || 'Category'}
                  </Badge>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {vendorSettings.description || 'Your business description will appear here.'}
                  </p>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2 w-full text-left">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{vendorSettings.contact_email || 'email@example.com'}</span>
                    </div>
                    {vendorSettings.phone_number && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{vendorSettings.phone_number}</span>
                      </div>
                    )}
                    {vendorSettings.website_url && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{vendorSettings.website_url}</span>
                      </div>
                    )}
                    {vendorSettings.address?.city && vendorSettings.address?.state && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {vendorSettings.address.city}, {vendorSettings.address.state}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="justify-center border-t pt-4">
                  <Button variant="outline" size="sm">
                    View Public Profile
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <Label className="text-base">Booking Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you get a new booking
                    </p>
                  </div>
                  <Switch 
                    checked={vendorSettings.notification_preferences?.email_bookings}
                    onCheckedChange={(checked) => handleNotificationChange('email_bookings', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <Label className="text-base">Review Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when you get a new review
                    </p>
                  </div>
                  <Switch 
                    checked={vendorSettings.notification_preferences?.email_reviews}
                    onCheckedChange={(checked) => handleNotificationChange('email_reviews', checked)} 
                  />
                </div>
                
                <h3 className="text-lg font-medium pt-2">SMS Notifications</h3>
                
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <Label className="text-base">Booking Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS alerts for new bookings
                    </p>
                  </div>
                  <Switch 
                    checked={vendorSettings.notification_preferences?.sms_bookings}
                    onCheckedChange={(checked) => handleNotificationChange('sms_bookings', checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between pb-3">
                  <div>
                    <Label className="text-base">Review Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get SMS alerts when you receive a new review
                    </p>
                  </div>
                  <Switch 
                    checked={vendorSettings.notification_preferences?.sms_reviews}
                    onCheckedChange={(checked) => handleNotificationChange('sms_reviews', checked)} 
                  />
                </div>
              </div>
              
              <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <Info className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  SMS notifications require a verified phone number and may incur additional charges.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="justify-end">
              <Button 
                className="bg-sanskara-red text-white hover:bg-sanskara-maroon"
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password regularly for better security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-sanskara-red text-white hover:bg-sanskara-maroon">
                  Update Password
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable 2FA</Label>
                    <p className="text-sm text-muted-foreground">
                      Protect your account with two-factor authentication
                    </p>
                  </div>
                  <Switch id="two-factor" />
                </div>
                
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Two-factor authentication is disabled</AlertTitle>
                  <AlertDescription>
                    Enable two-factor authentication for enhanced security.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Set Up Two-Factor Authentication
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

// Import the Globe and MapPin icons from lucide-react
import { Globe, MapPin, Phone, Mail, User } from 'lucide-react';
