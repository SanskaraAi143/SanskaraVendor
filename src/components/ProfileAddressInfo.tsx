import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ProfileAddressInfo: React.FC<any> = ({
  isEditing,
  editedData,
  updateAddressField,
  venueData
}) => {
  const address = editedData.address || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>Address Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block font-medium mb-1">Full Address</label>
              <Input value={address.full_address || ''} onChange={e => updateAddressField('full_address', e.target.value)} placeholder="Full Address" />
            </div>
            <div>
              <label className="block font-medium mb-1">Street</label>
              <Input value={address.street || ''} onChange={e => updateAddressField('street', e.target.value)} placeholder="Street" />
            </div>
            <div>
              <label className="block font-medium mb-1">City</label>
              <Input value={address.city || ''} onChange={e => updateAddressField('city', e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="block font-medium mb-1">State</label>
              <Input value={address.state || ''} onChange={e => updateAddressField('state', e.target.value)} placeholder="State" />
            </div>
            <div>
              <label className="block font-medium mb-1">Country</label>
              <Input value={address.country || ''} onChange={e => updateAddressField('country', e.target.value)} placeholder="Country" />
            </div>
            <div>
              <label className="block font-medium mb-1">Pincode</label>
              <Input value={address.pincode || ''} onChange={e => updateAddressField('pincode', e.target.value)} placeholder="Pincode" />
            </div>
            <div>
              <label className="block font-medium mb-1">Landmark</label>
              <Input value={address.landmark || ''} onChange={e => updateAddressField('landmark', e.target.value)} placeholder="Landmark" />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div><span className="font-semibold">Full Address:</span> {venueData.address?.full_address || 'N/A'}</div>
            <div><span className="font-semibold">Street:</span> {venueData.address?.street || 'N/A'}</div>
            <div><span className="font-semibold">City:</span> {venueData.address?.city || 'N/A'}</div>
            <div><span className="font-semibold">State:</span> {venueData.address?.state || 'N/A'}</div>
            <div><span className="font-semibold">Country:</span> {venueData.address?.country || 'N/A'}</div>
            <div><span className="font-semibold">Pincode:</span> {venueData.address?.pincode || 'N/A'}</div>
            <div><span className="font-semibold">Landmark:</span> {venueData.address?.landmark || 'N/A'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAddressInfo;
