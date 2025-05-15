
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

interface AddressSettings {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

interface AddressSectionProps {
  address: AddressSettings;
  isSaving: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  saveSettings: () => void;
}

export const AddressSection: React.FC<AddressSectionProps> = ({
  address,
  isSaving,
  handleInputChange,
  saveSettings
}) => {
  return (
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
            value={address?.street || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address.city">City</Label>
            <Input 
              id="address.city" 
              name="address.city"
              value={address?.city || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address.state">State/Province</Label>
            <Input 
              id="address.state" 
              name="address.state"
              value={address?.state || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address.postal_code">Postal Code</Label>
            <Input 
              id="address.postal_code" 
              name="address.postal_code"
              value={address?.postal_code || ''}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address.country">Country</Label>
            <Input 
              id="address.country" 
              name="address.country"
              value={address?.country || ''}
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
  );
};
