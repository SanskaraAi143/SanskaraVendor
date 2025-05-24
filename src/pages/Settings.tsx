import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { NotificationSection, NotificationSettings } from '@/components/settings/NotificationSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { DangerZoneSection } from '@/components/settings/DangerZoneSection';
import { Json } from '@/integrations/supabase/types';

const Settings: React.FC = () => {
  const { vendorProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
  
  const isNotificationSettings = (data: any): data is NotificationSettings => {
    return (
      typeof data === 'object' &&
      'email_notifications' in data && typeof data.email_notifications === 'boolean' &&
      'booking_updates' in data && typeof data.booking_updates === 'boolean' &&
      'marketing_notifications' in data && typeof data.marketing_notifications === 'boolean'
    );
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile details
      const { data, error } = await supabase
        .from('users')
        .select('preferences')
        .eq('supabase_auth_uid', user?.id)
        .single();

      if (error) throw error;

      // Check for notification_settings in preferences
      let notifSettings: NotificationSettings = {
        email_notifications: true,
        booking_updates: true,
        marketing_notifications: false
      };

      const preferences = data?.preferences as { notification_settings?: NotificationSettings } | null;
      if (preferences?.notification_settings) {
        notifSettings = preferences.notification_settings;
      }

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
  
  const saveSettings = async () => {
    if (!user?.id) return;

    setIsSaving(true);

    try {
      // Update notification settings in preferences
      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            notification_settings: { ...notificationSettings }
          }
        })
        .eq('supabase_auth_uid', user.id);

      if (error) throw error;

      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated successfully',
        variant: 'success'
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
        description: 'Your account has been temporarily deactivated',
        variant: 'success'
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
