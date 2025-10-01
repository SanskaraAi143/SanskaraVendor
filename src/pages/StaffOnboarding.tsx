import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import TaggedImageUploader from '../components/TaggedImageUploader';
import { TaggedImages, convertForDatabase } from '../utils/taggedUploadHelpers';
import AiOnboardingChat from '@/components/onboarding/AiOnboardingChat';

const StaffOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioType, setPortfolioType] = useState('');
  const [genericAttributes, setGenericAttributes] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<TaggedImages | null>(null);
  const [videoUrls, setVideoUrls] = useState<TaggedImages | null>(null);

  const [aiOnboardingComplete, setAiOnboardingComplete] = useState(false);

  const handleAiOnboardingComplete = (data: any) => {
    console.log('AI staff onboarding complete with data:', data);
    // Pre-fill the form with data from the AI chat
    if (data.name) setName(data.name);
    if (data.role) setRole(data.role);
    if (data.portfolioTitle) setPortfolioTitle(data.portfolioTitle);
    if (data.portfolioDescription) setPortfolioDescription(data.portfolioDescription);
    if (data.genericAttributes) setGenericAttributes(data.genericAttributes);

    setAiOnboardingComplete(true);
  };

  const handleOnboarding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { name },
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id, vendor_id, role')
        .eq('supabase_auth_uid', user.id)
        .single();

      if (staffError || !staffData) {
        setError(staffError?.message || 'Staff profile not found.');
        setLoading(false);
        return;
      }

      let type = portfolioType;
      if (!type && role) {
        if (role.toLowerCase().includes('cater')) type = 'caterer';
        else if (role.toLowerCase().includes('photo')) type = 'photographer';
        else if (role.toLowerCase().includes('venue')) type = 'venue_space';
        else if (role.toLowerCase().includes('decor')) type = 'decor_item';
        else type = 'general';
      }

      const { error: insertError } = await supabase
        .from('staff_portfolios')
        .insert({
          staff_id: staffData.staff_id,
          vendor_id: staffData.vendor_id,
          portfolio_type: type,
          title: portfolioTitle,
          description: portfolioDescription,
          image_urls: convertForDatabase(imageUrls),
          video_urls: convertForDatabase(videoUrls),
          generic_attributes: genericAttributes,
        });

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
 
      const { error: updateInvitationError } = await supabase
        .from('vendor_staff')
        .update({ invitation_status: 'accepted' })
        .eq('staff_id', staffData.staff_id);
 
      if (updateInvitationError) {
        setError(updateInvitationError.message);
        setLoading(false);
        return;
      }
 
      alert('Onboarding complete! Redirecting to dashboard...');
      navigate('/staff/dashboard');
    } catch (catchError: any) {
      setError(catchError.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!aiOnboardingComplete) {
    return (
      <AiOnboardingChat
        userType="staff"
        onOnboardingComplete={handleAiOnboardingComplete}
      />
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 py-12">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Complete Your Staff Profile</CardTitle>
          <CardDescription className="text-center">
            Review the information gathered by our AI and complete your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOnboarding}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Staff Role</Label>
                  <Input id="role" type="text" placeholder="e.g., Photographer, Caterer" value={role} onChange={(e) => setRole(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioType">Portfolio Type</Label>
                  <select id="portfolioType" value={portfolioType} onChange={(e) => setPortfolioType(e.target.value)} disabled={loading} className="w-full border rounded px-2 py-1 h-10">
                    <option value="">Auto (based on role)</option>
                    <option value="caterer">Caterer</option>
                    <option value="photographer">Photographer</option>
                    <option value="venue_space">Venue Space</option>
                    <option value="decor_item">Decor Item</option>
                    <option value="general">General</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="portfolioTitle">Portfolio Title</Label>
                  <Input id="portfolioTitle" type="text" placeholder="Portfolio Title" value={portfolioTitle} onChange={(e) => setPortfolioTitle(e.target.value)} required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioDescription">Portfolio Description</Label>
                  <Input id="portfolioDescription" type="text" placeholder="Portfolio Description" value={portfolioDescription} onChange={(e) => setPortfolioDescription(e.target.value)} required disabled={loading} />
                </div>
              </div>
              
              {((portfolioType === 'caterer') || (role.toLowerCase().includes('cater'))) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodOptions">Food Options (JSON or text)</Label>
                    <Input id="foodOptions" type="text" placeholder='{"menus": [{"name": "Italian Feast"}]}' value={genericAttributes.food_options || ''} onChange={(e) => setGenericAttributes({ ...genericAttributes, food_options: e.target.value })} disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricingDetails">Pricing Details</Label>
                    <Input id="pricingDetails" type="text" placeholder="Packages start at $50 per person." value={genericAttributes.pricing_details || ''} onChange={(e) => setGenericAttributes({ ...genericAttributes, pricing_details: e.target.value })} disabled={loading} />
                  </div>
                </div>
              )}
              {((portfolioType === 'photographer') || (role.toLowerCase().includes('photo'))) && (
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input id="serviceType" type="text" placeholder="e.g., Wedding, Portrait" value={genericAttributes.service_type || ''} onChange={(e) => setGenericAttributes({ ...genericAttributes, service_type: e.target.value })} disabled={loading} />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label>Portfolio Images</Label>
                  <TaggedImageUploader taggedImages={imageUrls} onImagesChange={setImageUrls} bucket="vendor-staff" folder="images" category={portfolioType || role.toLowerCase() || 'general'} maxFilesPerTag={10} maxTotalFiles={30} disabled={loading} />
                </div>
                <div>
                  <Label>Portfolio Videos</Label>
                  <TaggedImageUploader taggedImages={videoUrls} onImagesChange={setVideoUrls} bucket="vendor-staff" folder="videos" category={portfolioType || role.toLowerCase() || 'general'} maxFilesPerTag={5} maxTotalFiles={15} disabled={loading} />
                </div>
              </div>
              
              {error && (<p className="text-sm text-red-600">{error}</p>)}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Completing...' : 'Complete Onboarding'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffOnboarding;