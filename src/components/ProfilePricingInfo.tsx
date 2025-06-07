import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const ProfilePricingInfo: React.FC<any> = ({
  isEditing,
  editedData,
  updatePricingRangeField,
  getDetailValue,
  updateDetailField,
  venueData
}) => {
  const pricing = editedData.pricing_range || {};
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block font-medium mb-1">Currency</label>
              <Input value={pricing.currency || ''} onChange={e => updatePricingRangeField('currency', e.target.value)} placeholder="Currency (e.g. INR)" />
            </div>
            <div>
              <label className="block font-medium mb-1">Minimum Price</label>
              <Input value={pricing.min || ''} onChange={e => updatePricingRangeField('min', e.target.value)} placeholder="Minimum Price" />
            </div>
            <div>
              <label className="block font-medium mb-1">Maximum Price</label>
              <Input value={pricing.max || ''} onChange={e => updatePricingRangeField('max', e.target.value)} placeholder="Maximum Price" />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div><span className="font-semibold">Currency:</span> {venueData.pricing_range?.currency || 'N/A'}</div>
            <div><span className="font-semibold">Minimum Price:</span> {venueData.pricing_range?.min || 'N/A'}</div>
            <div><span className="font-semibold">Maximum Price:</span> {venueData.pricing_range?.max || 'N/A'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePricingInfo;
