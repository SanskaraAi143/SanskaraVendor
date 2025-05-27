
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffDashboardLayout from '../components/staff/StaffDashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Settings, Loader2, User, Bell, Shield, Trash2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '@/hooks/useAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  task_reminders: boolean;
  booking_updates: boolean;
}

const StaffSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, staffProfile, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Profile settings
  const [profileSettings, setProfileSettings] = useState({
    display_name: '',
    email: '',
    phone_number: '',
  });

  // Notification settings - using local state since user_settings table doesn't exist
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: false,
    marketing_emails: false,
    task_reminders: true,
    booking_updates: true,
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/staff/login', { replace: true });
      return;
    }

    if (staffProfile?.staff_id) {
      loadSettings();
    }
  }, [user, authLoading, navigate, staffProfile]);

  const loadSettings = async () => {
    if (!staffProfile) return;

    setLoading(true);
    setError(null);
    
    try {
      // Load profile data from vendor_staff table
      setProfileSettings({
        display_name: staffProfile.display_name || '',
        email: staffProfile.email || '',
        phone_number: staffProfile.phone_number || '',
      });

      // Load notification preferences from localStorage since user_settings table doesn't exist
      const savedNotifications = localStorage.getItem(`staff_notifications_${staffProfile.staff_id}`);
      if (savedNotifications) {
        setNotificationSettings(JSON.parse(savedNotifications));
      }
      
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!staffProfile?.staff_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('vendor_staff')
        .update({
          display_name: profileSettings.display_name,
          phone_number: profileSettings.phone_number,
        })
        .eq('staff_id', staffProfile.staff_id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Profile settings saved successfully.',
      });
    } catch (err: any) {
      console.error('Error saving profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to save profile settings.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!staffProfile?.staff_id) return;

    try {
      // Save to localStorage since user_settings table doesn't exist
      localStorage.setItem(`staff_notifications_${staffProfile.staff_id}`, JSON.stringify(notificationSettings));

      toast({
        title: 'Success',
        description: 'Notification settings saved successfully.',
      });
    } catch (err: any) {
      console.error('Error saving notifications:', err);
      toast({
        title: 'Error',
        description: 'Failed to save notification settings.',
        variant: 'destructive',
      });
    }
  };

  const handleNotificationChange = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handlePasswordReset = async () => {
    if (!staffProfile?.email) return;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(staffProfile.email, {
        redirectTo: `${window.location.origin}/staff/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password reset email sent successfully.',
      });
    } catch (err: any) {
      console.error('Error sending password reset:', err);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email.',
        variant: 'destructive',
      });
    }
  };

  const renderContent = () => {
    if (loading || authLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-sanskara-red" />
          <p className="mt-4 text-lg text-muted-foreground">Loading settings...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
          <p className="text-red-600 mb-4">{error}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 p-4 sm:p-6">
        {/* Profile Settings */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-sanskara-blue" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-700">
                Profile Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={profileSettings.display_name}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Your display name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profileSettings.email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={profileSettings.phone_number}
                  onChange={(e) => setProfileSettings(prev => ({ ...prev, phone_number: e.target.value }))}
                  placeholder="Your phone number"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Profile'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-sanskara-blue" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-700">
                Notification Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive general email notifications</p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={() => handleNotificationChange('email_notifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive SMS notifications for urgent updates</p>
                </div>
                <Switch
                  checked={notificationSettings.sms_notifications}
                  onCheckedChange={() => handleNotificationChange('sms_notifications')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive promotional and marketing emails</p>
                </div>
                <Switch
                  checked={notificationSettings.marketing_emails}
                  onCheckedChange={() => handleNotificationChange('marketing_emails')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">Receive reminders for upcoming tasks</p>
                </div>
                <Switch
                  checked={notificationSettings.task_reminders}
                  onCheckedChange={() => handleNotificationChange('task_reminders')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Booking Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about booking changes</p>
                </div>
                <Switch
                  checked={notificationSettings.booking_updates}
                  onCheckedChange={() => handleNotificationChange('booking_updates')}
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                Save Notification Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-sanskara-blue" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-700">
                Security Settings
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <p className="text-sm text-muted-foreground">Reset your account password</p>
                </div>
                <Button onClick={handlePasswordReset} variant="outline" className="w-full sm:w-auto">
                  Reset Password
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="w-full max-w-4xl mx-auto border-red-200">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Trash2 className="h-8 w-8 text-red-500" />
              <CardTitle className="text-xl sm:text-2xl font-semibold text-red-700">
                Danger Zone
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label className="text-red-700">Delete Account</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button variant="destructive" className="w-full sm:w-auto">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <StaffDashboardLayout>
      {renderContent()}
    </StaffDashboardLayout>
  );
};

export default StaffSettings;
