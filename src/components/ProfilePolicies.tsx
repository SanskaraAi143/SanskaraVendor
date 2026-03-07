import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const ProfilePolicies: React.FC<any> = ({
  isEditing,
  getDetailValue,
  updateDetailField,
  venueData
}) => (
  <Card>
    <CardHeader><CardTitle>Policies</CardTitle></CardHeader>
    <CardContent className="space-y-6">
      {/* Alcohol Policy */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-3">Alcohol Policy</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2"><Checkbox id="alcoholAllowed" checked={!!getDetailValue('alcoholPolicy.allowed',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.allowed', !!c)} /><Label htmlFor="alcoholAllowed">Is Alcohol Allowed?</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="inHouseBar" checked={!!getDetailValue('alcoholPolicy.inHouseBar',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.inHouseBar', !!c)} /><Label htmlFor="inHouseBar">In-house Bar Available?</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="permitRequired" checked={!!getDetailValue('alcoholPolicy.permitRequired',false)} onCheckedChange={c => updateDetailField('alcoholPolicy.permitRequired', !!c)} /><Label htmlFor="permitRequired">Permit Required?</Label></div>
            <div className="space-y-2">
              <Label htmlFor="corkageFeeApplicable">Corkage Fee Applicable?</Label>
              <Select 
                value={getDetailValue('alcoholPolicy.corkageFeeApplicable')} 
                onValueChange={val => updateDetailField('alcoholPolicy.corkageFeeApplicable', val)}
              >
                <SelectTrigger id="corkageFeeApplicable">
                  <SelectValue placeholder="Corkage Fee Applicable?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No">No</SelectItem>
                  <SelectItem value="Yes">Yes</SelectItem>
                  <SelectItem value="Specify">Yes, specify amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {getDetailValue('alcoholPolicy.corkageFeeApplicable') === 'Specify' && <div className="space-y-2"><Label htmlFor="corkageFeeAmount">Corkage Fee Amount ₹</Label><Input id="corkageFeeAmount" value={getDetailValue('alcoholPolicy.corkageFeeAmount')} onChange={e => updateDetailField('alcoholPolicy.corkageFeeAmount', e.target.value)} /></div>}
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p><Label className="font-semibold">Allowed:</Label> {venueData?.details?.alcoholPolicy?.allowed ? 'Yes' : 'No'}</p>
            <p><Label className="font-semibold">In-house Bar:</Label> {venueData?.details?.alcoholPolicy?.inHouseBar ? 'Yes' : 'No'}</p>
            <p><Label className="font-semibold">Permit Required:</Label> {venueData?.details?.alcoholPolicy?.permitRequired ? 'Yes' : 'No'}</p>
            <p><Label className="font-semibold">Corkage Fee:</Label> {venueData?.details?.alcoholPolicy?.corkageFeeApplicable || 'N/A'} {venueData?.details?.alcoholPolicy?.corkageFeeApplicable === 'Specify' ? `(Amount: ₹${venueData?.details?.alcoholPolicy?.corkageFeeAmount || 'N/A'})` : ''}</p>
          </div>
        )}
      </div>

      {/* Decoration Policy */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-3">Decoration Policy</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="decorationOptions">Decoration Options</Label>
              <Select 
                value={getDetailValue('decoration.options')} 
                onValueChange={val => updateDetailField('decoration.options', val)}
              >
                <SelectTrigger id="decorationOptions">
                  <SelectValue placeholder="Decoration Options" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In-house Decorator Only">In-house Decorator Only</SelectItem>
                  <SelectItem value="Outside Decorators Allowed">Outside Decorators Allowed</SelectItem>
                  <SelectItem value="Both Allowed">Both Allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label htmlFor="restrictionsOutside">Restrictions for Outside Decorators?</Label><Textarea id="restrictionsOutside" value={getDetailValue('decoration.restrictionsOutside')} onChange={e => updateDetailField('decoration.restrictionsOutside', e.target.value)} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="basicDecorIncluded" checked={!!getDetailValue('decoration.basicIncluded',false)} onCheckedChange={c => updateDetailField('decoration.basicIncluded', !!c)} /><Label htmlFor="basicDecorIncluded">Basic Decor Included?</Label></div>
            {!!getDetailValue('decoration.basicIncluded') && <div className="space-y-2"><Label htmlFor="basicIncludedDetails">What’s Included in Basic Decor?</Label><Input id="basicIncludedDetails" value={getDetailValue('decoration.basicIncludedDetails')} onChange={e => updateDetailField('decoration.basicIncludedDetails', e.target.value)} /></div>}
            <Label>Standard Decor Packages Price Range (Min-Max):</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input aria-label="Standard Decor Min Price" placeholder="Min ₹" value={getDetailValue('decoration.standardPackagesPriceRange.min')} onChange={e => updateDetailField('decoration.standardPackagesPriceRange.min', e.target.value)} />
              <Input aria-label="Standard Decor Max Price" placeholder="Max ₹" value={getDetailValue('decoration.standardPackagesPriceRange.max')} onChange={e => updateDetailField('decoration.standardPackagesPriceRange.max', e.target.value)} />
            </div>
            <div className="space-y-2"><Label htmlFor="standardThemes">Themes/Styles Offered (Standard)</Label><Textarea id="standardThemes" value={getDetailValue('decoration.standardPackagesThemes')} onChange={e => updateDetailField('decoration.standardPackagesThemes', e.target.value)} /></div>
            <div className="flex items-center space-x-2"><Checkbox id="customizationAllowed" checked={!!getDetailValue('decoration.customizationAllowed',false)} onCheckedChange={c => updateDetailField('decoration.customizationAllowed', !!c)} /><Label htmlFor="customizationAllowed">Customization Allowed in Decoration?</Label></div>
            {!!getDetailValue('decoration.customizationAllowed') && <div className="space-y-2"><Label htmlFor="popularThemesCustom">Popular Themes with Price Range (Custom)</Label><Textarea id="popularThemesCustom" value={getDetailValue('decoration.customizationPopularThemes')} onChange={e => updateDetailField('decoration.customizationPopularThemes', e.target.value)} /></div>}
          </div>
        ) : (
           <div className="text-sm space-y-1">
            <p><Label className="font-semibold">Options:</Label> {venueData?.details?.decoration?.options || 'N/A'}</p>
            <p><Label className="font-semibold">Restrictions Outside:</Label> {venueData?.details?.decoration?.restrictionsOutside || 'N/A'}</p>
            <p><Label className="font-semibold">Basic Included:</Label> {venueData?.details?.decoration?.basicIncluded ? `Yes (${venueData?.details?.decoration?.basicIncludedDetails || 'Details N/A'})` : 'No'}</p>
            <p><Label className="font-semibold">Standard Packages Price:</Label> ₹{venueData?.details?.decoration?.standardPackagesPriceRange?.min || 'N/A'} - ₹{venueData?.details?.decoration?.standardPackagesPriceRange?.max || 'N/A'}</p>
            <p><Label className="font-semibold">Standard Themes:</Label> {venueData?.details?.decoration?.standardPackagesThemes || 'N/A'}</p>
            <p><Label className="font-semibold">Customization:</Label> {venueData?.details?.decoration?.customizationAllowed ? `Yes (${venueData?.details?.decoration?.customizationPopularThemes || 'Details N/A'})` : 'No'}</p>
          </div>
        )}
      </div>
      {/* Taxes & Payment */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-3">Taxes & Payment</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2"><Checkbox id="gstApplied" checked={!!getDetailValue('taxesPayment.gstApplied',false)} onCheckedChange={c => updateDetailField('taxesPayment.gstApplied', !!c)} /><Label htmlFor="gstApplied">GST Applied?</Label></div>
            {!!getDetailValue('taxesPayment.gstApplied') && <div className="space-y-2"><Label htmlFor="gstPercentage">GST %</Label><Input id="gstPercentage" value={getDetailValue('taxesPayment.gstPercentage')} onChange={e => updateDetailField('taxesPayment.gstPercentage', e.target.value)} /></div>}
            <div className="space-y-2"><Label htmlFor="otherCharges">Other Charges/Hidden Fees (if any):</Label><Textarea id="otherCharges" value={getDetailValue('taxesPayment.otherCharges')} onChange={e => updateDetailField('taxesPayment.otherCharges', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="advanceBookingAmount">Advance Booking Amount (% of Total / Flat ₹):</Label><Input id="advanceBookingAmount" value={getDetailValue('taxesPayment.advanceBookingAmount')} onChange={e => updateDetailField('taxesPayment.advanceBookingAmount', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="paymentTerms">Payment Terms & Schedule:</Label><Textarea id="paymentTerms" value={getDetailValue('taxesPayment.paymentTerms')} onChange={e => updateDetailField('taxesPayment.paymentTerms', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="cancellationPolicy">Cancellation & Refund Policy:</Label><Textarea id="cancellationPolicy" value={getDetailValue('taxesPayment.cancellationPolicy')} onChange={e => updateDetailField('taxesPayment.cancellationPolicy', e.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="acceptedPaymentModes">Accepted Payment Modes (comma-separated)</Label><Input id="acceptedPaymentModes" placeholder="UPI, Bank Transfer..." value={(getDetailValue('taxesPayment.acceptedPaymentModes', []) as string[]).join(', ')} onChange={e => updateDetailField('taxesPayment.acceptedPaymentModes', e.target.value.split(',').map(s => s.trim()))} /></div>
          </div>
        ) : (
          <div className="text-sm space-y-1">
            <p><Label className="font-semibold">GST Applied:</Label> {venueData?.details?.taxesPayment?.gstApplied ? `Yes (${venueData?.details?.taxesPayment?.gstPercentage || 'N/A'}%)` : 'No'}</p>
            <p><Label className="font-semibold">Other Charges:</Label> {venueData?.details?.taxesPayment?.otherCharges || 'N/A'}</p>
            <p><Label className="font-semibold">Advance Amount:</Label> {venueData?.details?.taxesPayment?.advanceBookingAmount || 'N/A'}</p>
            <p><Label className="font-semibold">Payment Terms:</Label> {venueData?.details?.taxesPayment?.paymentTerms || 'N/A'}</p>
            <p><Label className="font-semibold">Cancellation Policy:</Label> {venueData?.details?.taxesPayment?.cancellationPolicy || 'N/A'}</p>
            <p><Label className="font-semibold">Accepted Modes:</Label> {(venueData?.details?.taxesPayment?.acceptedPaymentModes || []).join(', ') || 'N/A'}</p>
          </div>
        )}
      </div>
      {/* Venue Rules */}
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-3">Venue Rules</h3>
        {isEditing ? (
          <div className="space-y-2">
            <Label htmlFor="venueRules">Any Venue Rules or Restrictions Clients Must Know?</Label>
            <Textarea id="venueRules" value={getDetailValue('venueRules')} onChange={(e) => updateDetailField('venueRules', e.target.value)} rows={3}/>
          </div>
        ) : (
          <p className="text-sm">{venueData?.details?.venueRules || 'N/A'}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default ProfilePolicies;
