
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

interface ProfileSectionProps {
  vendorName: string;
  contactEmail: string;
  phoneNumber: string;
  websiteUrl: string;
  description: string;
  isSaving: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  saveSettings: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  vendorName,
  contactEmail,
  phoneNumber,
  websiteUrl,
  description,
  isSaving,
  handleInputChange,
  saveSettings
}) => {
  return (
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
              value={vendorName || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact_email">Email Address</Label>
            <Input 
              id="contact_email" 
              name="contact_email"
              type="email"
              value={contactEmail || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input 
              id="phone_number" 
              name="phone_number"
              value={phoneNumber || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website_url">Website</Label>
            <Input 
              id="website_url" 
              name="website_url"
              value={websiteUrl || ''}
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
            value={description || ''}
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
  );
};
