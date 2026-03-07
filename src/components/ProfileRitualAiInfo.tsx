import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProfileRitualAiInfo: React.FC<any> = ({
  isEditing,
  getDetailValue,
  updateDetailField,
  venueData
}) => {
  // Ritual/Cultural Info
  const fireHawanAllowed = getDetailValue('ritualCultural.fireHawanAllowed', '');
  const mandapSetupRestrictions = getDetailValue('ritualCultural.mandapSetupRestrictions', '');

  // AI/Operational Info
  const currentBookingSystem = getDetailValue('aiOperational.currentBookingSystem', '');
  const crmSoftwareName = getDetailValue('aiOperational.crmSoftwareName', '');
  const otherBookingSystemName = getDetailValue('aiOperational.otherBookingSystemName', '');
  const willingToIntegrateSanskara = getDetailValue('aiOperational.willingToIntegrateSanskara', '');
  const idealClientProfile = getDetailValue('aiOperational.idealClientProfile', '');
  const flexibilityLevel = getDetailValue('aiOperational.flexibilityLevel', '');
  const aiMenuDecorSuggestions = getDetailValue('aiOperational.aiMenuDecorSuggestions', '');
  const preferredLeadMode = getDetailValue('aiOperational.preferredLeadMode', '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ritual & Cultural Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block font-medium mb-1">Fire/Hawan Allowed</label>
                <Input
                  value={fireHawanAllowed}
                  onChange={e => updateDetailField('ritualCultural.fireHawanAllowed', e.target.value)}
                  placeholder="Yes/No/With Restrictions"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Mandap Setup Restrictions</label>
                <Textarea
                  value={mandapSetupRestrictions}
                  onChange={e => updateDetailField('ritualCultural.mandapSetupRestrictions', e.target.value)}
                  placeholder="Describe any restrictions or preferences for mandap setup"
                  rows={2}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold">Fire/Hawan Allowed:</span> {fireHawanAllowed || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Mandap Setup Restrictions:</span> {mandapSetupRestrictions || 'N/A'}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>AI & Operational Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <label className="block font-medium mb-1">Current Booking System</label>
                <Input
                  value={currentBookingSystem}
                  onChange={e => updateDetailField('aiOperational.currentBookingSystem', e.target.value)}
                  placeholder="e.g. Manual, Google Calendar, Other"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">CRM Software Name</label>
                <Input
                  value={crmSoftwareName}
                  onChange={e => updateDetailField('aiOperational.crmSoftwareName', e.target.value)}
                  placeholder="e.g. Zoho, Salesforce, etc."
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Other Booking System Name</label>
                <Input
                  value={otherBookingSystemName}
                  onChange={e => updateDetailField('aiOperational.otherBookingSystemName', e.target.value)}
                  placeholder="If not listed above"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Willing to Integrate with Sanskara?</label>
                <Input
                  value={willingToIntegrateSanskara}
                  onChange={e => updateDetailField('aiOperational.willingToIntegrateSanskara', e.target.value)}
                  placeholder="Yes/No/Maybe"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Ideal Client Profile</label>
                <Textarea
                  value={idealClientProfile}
                  onChange={e => updateDetailField('aiOperational.idealClientProfile', e.target.value)}
                  placeholder="Describe your ideal client"
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Flexibility Level</label>
                <Input
                  value={flexibilityLevel}
                  onChange={e => updateDetailField('aiOperational.flexibilityLevel', e.target.value)}
                  placeholder="e.g. High, Medium, Low"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">AI Menu/Decor Suggestions</label>
                <Textarea
                  value={aiMenuDecorSuggestions}
                  onChange={e => updateDetailField('aiOperational.aiMenuDecorSuggestions', e.target.value)}
                  placeholder="Describe any AI-powered suggestions you use or want"
                  rows={2}
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Preferred Lead Mode</label>
                <Input
                  value={preferredLeadMode}
                  onChange={e => updateDetailField('aiOperational.preferredLeadMode', e.target.value)}
                  placeholder="e.g. WhatsApp, Email, Phone, etc."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <span className="font-semibold">Current Booking System:</span> {currentBookingSystem || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">CRM Software Name:</span> {crmSoftwareName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Other Booking System Name:</span> {otherBookingSystemName || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Willing to Integrate with Sanskara:</span> {willingToIntegrateSanskara || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Ideal Client Profile:</span> {idealClientProfile || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Flexibility Level:</span> {flexibilityLevel || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">AI Menu/Decor Suggestions:</span> {aiMenuDecorSuggestions || 'N/A'}
              </div>
              <div>
                <span className="font-semibold">Preferred Lead Mode:</span> {preferredLeadMode || 'N/A'}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileRitualAiInfo;
