
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Loader2 } from "lucide-react";

export interface NotificationSettings {
  email_notifications: boolean;
  booking_updates: boolean;
  marketing_notifications: boolean;
}

interface NotificationSectionProps {
  notificationSettings: NotificationSettings;
  isSaving: boolean;
  handleNotificationChange: (setting: keyof NotificationSettings) => void;
  saveSettings: () => void;
}

export const NotificationSection: React.FC<NotificationSectionProps> = ({
  notificationSettings,
  isSaving,
  handleNotificationChange,
  saveSettings
}) => {
  return (
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
  );
};
