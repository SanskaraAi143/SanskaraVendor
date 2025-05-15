
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AddressSection } from '@/components/settings/AddressSection';
import { NotificationSection, NotificationSettings } from '@/components/settings/NotificationSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';
import { Json } from '@/integrations/supabase/types';

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
      
      let notifSettings: NotificationSettings = {
        email_notifications: true,
        booking_updates: true,
        marketing_notifications: false
      };
      
      // Check if the notification_settings property exists in the data
      const rawData = data as any;
      if (rawData.notification_settings && typeof rawData.notification_settings === 'object') {
        notifSettings = rawData.notification_settings as NotificationSettings;
      }
      
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
      // Convert address and notification_settings to JSON compatible format
      const jsonAddress = settings.address as unknown as Json;
      const jsonNotificationSettings = notificationSettings as unknown as Json;
      
      // Prepare the data for update
      const updateData = {
        vendor_name: settings.vendor_name,
        contact_email: settings.contact_email,
        phone_number: settings.phone_number,
        website_url: settings.website_url,
        description: settings.description,
        address: jsonAddress,
        notification_settings: jsonNotificationSettings
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
        {settings && (
          <ProfileSection 
            vendorName={settings.vendor_name}
            contactEmail={settings.contact_email}
            phoneNumber={settings.phone_number}
            websiteUrl={settings.website_url}
            description={settings.description}
            isSaving={isSaving}
            handleInputChange={handleInputChange}
            saveSettings={saveSettings}
          />
        )}
        
        {/* Address Information */}
        {settings && (
          <AddressSection 
            address={settings.address}
            isSaving={isSaving}
            handleInputChange={handleInputChange}
            saveSettings={saveSettings}
          />
        )}

        {/* Notifications */}
        <NotificationSection 
          notificationSettings={notificationSettings}
          isSaving={isSaving}
          handleNotificationChange={handleNotificationChange}
          saveSettings={saveSettings}
        />
        
        {/* Security */}
        <SecuritySection />
        
        {/* Danger Zone */}
        <DangerZoneSection 
          handleDeactivateAccount={handleDeactivateAccount}
        />
      </div>
    </div>
  );
};

export default Settings;
