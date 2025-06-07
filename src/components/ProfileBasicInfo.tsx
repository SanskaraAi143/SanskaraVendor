import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProfileBasicInfo: React.FC<any> = ({
  isEditing,
  editedData,
  updateField,
  getDetailValue,
  updateDetailField,
  venueData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block font-medium mb-1">Venue Name</label>
              <Input value={editedData.vendor_name || ''} onChange={e => updateField('vendor_name', e.target.value)} placeholder="Venue Name" />
            </div>
            <div>
              <label className="block font-medium mb-1">Category</label>
              <Input value={editedData.vendor_category || ''} onChange={e => updateField('vendor_category', e.target.value)} placeholder="Category (e.g. Banquet Hall, Lawn)" />
            </div>
            <div>
              <label className="block font-medium mb-1">Contact Email</label>
              <Input value={editedData.contact_email || ''} onChange={e => updateField('contact_email', e.target.value)} placeholder="Contact Email" />
            </div>
            <div>
              <label className="block font-medium mb-1">Phone Number</label>
              <Input value={editedData.phone_number || ''} onChange={e => updateField('phone_number', e.target.value)} placeholder="Phone Number" />
            </div>
            <div>
              <label className="block font-medium mb-1">Website URL</label>
              <Input value={editedData.website_url || ''} onChange={e => updateField('website_url', e.target.value)} placeholder="Website URL" />
            </div>
            <div>
              <label className="block font-medium mb-1">Description</label>
              <Textarea value={editedData.description || ''} onChange={e => updateField('description', e.target.value)} placeholder="Short description about your venue..." rows={3} />
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div><span className="font-semibold">Venue Name:</span> {venueData.vendor_name || 'N/A'}</div>
            <div><span className="font-semibold">Category:</span> {venueData.vendor_category || 'N/A'}</div>
            <div><span className="font-semibold">Contact Email:</span> {venueData.contact_email || 'N/A'}</div>
            <div><span className="font-semibold">Phone Number:</span> {venueData.phone_number || 'N/A'}</div>
            <div><span className="font-semibold">Website URL:</span> {venueData.website_url || 'N/A'}</div>
            <div><span className="font-semibold">Description:</span> {venueData.description || 'N/A'}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileBasicInfo;
