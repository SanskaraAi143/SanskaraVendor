
import React, { useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import TaggedImageUploader from '../components/TaggedImageUploader';
import { TaggedImages, convertForDatabase } from '../utils/taggedUploadHelpers';

interface StaffOnboardingProps {
  onboardingData?: any;
  onCompletion: (data: any) => void;
  onError: (title: string, description: string) => void;
}

const StaffOnboarding: React.FC<StaffOnboardingProps> = ({ onboardingData, onCompletion, onError }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('');
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioType, setPortfolioType] = useState('');
  const [genericAttributes, setGenericAttributes] = useState<any>({});
  
  // Replace URL arrays with TaggedImages
  const [imageUrls, setImageUrls] = useState<TaggedImages | null>(null);
  const [videoUrls, setVideoUrls] = useState<TaggedImages | null>(null);

  const handleOnboarding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Basic form validation
    if (!name || !password || !role || !portfolioTitle || !portfolioDescription) {
      onError("Validation Error", "Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { name },
      });

      if (updateError) {
        onError("Profile Update Failed", updateError.message);
        setLoading(false);
        return;
      }

      // Fetch staff_id and vendor_id for the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        onError("Authentication Error", userError?.message || 'User not authenticated.');
        setLoading(false);
        return;
      }
      const { data: staffData, error: staffError } = await supabase
        .from('vendor_staff')
        .select('staff_id, vendor_id, role')
        .eq('supabase_auth_uid', user.id)
        .single();
      if (staffError || !staffData) {
        onError("Staff Profile Error", staffError?.message || 'Staff profile not found.');
        setLoading(false);
        return;
      }

      // Determine portfolio_type based on role
      let type = portfolioType;
      if (!type && role) {
        if (role.toLowerCase().includes('cater')) type = 'caterer';
        else if (role.toLowerCase().includes('photo')) type = 'photographer';
        else if (role.toLowerCase().includes('venue')) type = 'venue_space';
        else if (role.toLowerCase().includes('decor')) type = 'decor_item';
        else type = 'general';
      }

      // Insert into staff_portfolios with tagged images
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
        onError("Portfolio Creation Failed", insertError.message);
        setLoading(false);
        return;
      }
 
       // Update invitation_status to 'accepted' for the staff member
       const { error: updateInvitationError } = await supabase
         .from('vendor_staff')
         .update({ invitation_status: 'accepted' })
         .eq('staff_id', staffData.staff_id);
 
       if (updateInvitationError) {
         onError("Invitation Status Update Failed", updateInvitationError.message);
         setLoading(false);
         return;
       }

      onCompletion({ staffId: staffData.staff_id });
    } catch (catchError: any) {
      onError("Onboarding Failed", catchError.message || 'An unexpected error occurred during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (onboardingData) {
      setName(onboardingData.name ?? '');
      setRole(onboardingData.role ?? '');
      setPortfolioTitle(onboardingData.portfolioTitle ?? '');
      setPortfolioDescription(onboardingData.portfolioDescription ?? '');
      setPortfolioType(onboardingData.portfolioType ?? '');

      // Handle genericAttributes, ensuring it's an object
      if (onboardingData.genericAttributes) {
        setGenericAttributes(onboardingData.genericAttributes);
      }
    }
  }, [onboardingData]);
 
   return (
        <form onSubmit={handleOnboarding} className="w-full p-4 sm:p-6 lg:p-8 bg-transparent">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Staff Role</Label>
                <Input
                  id="role"
                  type="text"
                  placeholder="e.g., Photographer, Caterer, Decorator"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioType">Portfolio Type</Label>
                <select
                  id="portfolioType"
                  value={portfolioType}
                  onChange={(e) => setPortfolioType(e.target.value)}
                  disabled={loading}
                  className="w-full border rounded px-2 py-1 border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                >
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
                <Input
                  id="portfolioTitle"
                  type="text"
                  placeholder="Portfolio Title"
                  value={portfolioTitle}
                  onChange={(e) => setPortfolioTitle(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolioDescription">Portfolio Description</Label>
                <Input
                  id="portfolioDescription"
                  type="text"
                  placeholder="Portfolio Description"
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  required
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
            </div>
            
            {/* Dynamic fields for generic_attributes */}
            {((portfolioType === 'caterer') || (role.toLowerCase().includes('cater'))) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="foodOptions">Food Options (JSON or text)</Label>
                  <Input
                    id="foodOptions"
                    type="text"
                    placeholder='{"menus": [{"name": "Italian Feast", "items": ["Pasta", "Salad"]}]}'
                    value={genericAttributes.food_options || ''}
                    onChange={(e) => setGenericAttributes({ ...genericAttributes, food_options: e.target.value })}
                    disabled={loading}
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingDetails">Pricing Details</Label>
                  <Input
                    id="pricingDetails"
                    type="text"
                    placeholder="Packages start at $50 per person."
                    value={genericAttributes.pricing_details || ''}
                    onChange={(e) => setGenericAttributes({ ...genericAttributes, pricing_details: e.target.value })}
                    disabled={loading}
                    className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                  />
                </div>
              </div>
            )}
            {((portfolioType === 'photographer') || (role.toLowerCase().includes('photo'))) && (
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Input
                  id="serviceType"
                  type="text"
                  placeholder="e.g., Wedding, Portrait, Event"
                  value={genericAttributes.service_type || ''}
                  onChange={(e) => setGenericAttributes({ ...genericAttributes, service_type: e.target.value })}
                  disabled={loading}
                  className="border-gray-300 focus:border-sanskara-deep-blue focus:ring-sanskara-deep-blue rounded-md"
                />
              </div>
            )}
            
            {/* Portfolio Images */}
            <div className="space-y-4">
              <div>
                <Label>Portfolio Images</Label>
                <TaggedImageUploader
                  taggedImages={imageUrls}
                  onImagesChange={setImageUrls}
                  bucket="vendor-staff"
                  folder="images"
                  category={portfolioType || role.toLowerCase() || 'general'}
                  maxFilesPerTag={10}
                  maxTotalFiles={30}
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label>Portfolio Videos</Label>
                <TaggedImageUploader
                  taggedImages={videoUrls}
                  onImagesChange={setVideoUrls}
                  bucket="vendor-staff"
                  folder="videos"
                  category={portfolioType || role.toLowerCase() || 'general'}
                  maxFilesPerTag={5}
                  maxTotalFiles={15}
                  disabled={loading}
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-sanskara-maroon text-white hover:bg-sanskara-deep-blue" disabled={loading}>
              {loading ? 'Completing...' : 'Complete Onboarding'}
            </Button>
          </div>
        </form>
  );
};

export default StaffOnboarding;
