
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StaffProfileProps {
  staffData: any;
}

// Define the profile data type to satisfy TypeScript
interface StaffProfileData {
  id: string;
  staff_id: string;
  bio: string | null;
  specialization: string | null;
  years_experience: number | null;
  certifications: string[] | null;
  social_links: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  } | null;
  profile_image_url: string | null;
}

const StaffProfileSection: React.FC<StaffProfileProps> = ({ staffData }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<StaffProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form fields
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [certifications, setCertifications] = useState('');
  const [phone, setPhone] = useState(staffData.phone_number || '');
  
  // Social links
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Use any type casting to bypass TypeScript checks for the new table
        const { data, error } = await (supabase
          .from('vendor_staff_profiles') as any)
          .select('*')
          .eq('staff_id', staffData.staff_id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw error;
        }
        
        if (data) {
          // Cast the data to our interface
          const typedData = data as StaffProfileData;
          setProfileData(typedData);
          setBio(typedData.bio || '');
          setSpecialization(typedData.specialization || '');
          setYearsExperience(typedData.years_experience?.toString() || '');
          setCertifications((typedData.certifications || []).join(', '));
          
          const socialLinks = typedData.social_links || {};
          setWebsite(socialLinks.website || '');
          setInstagram(socialLinks.instagram || '');
          setFacebook(socialLinks.facebook || '');
          setTwitter(socialLinks.twitter || '');
          
          if (typedData.profile_image_url) {
            setPreviewUrl(typedData.profile_image_url);
          }
        }
      } catch (error) {
        console.error('Error fetching staff profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [staffData.staff_id]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!profileImage) return previewUrl;
    
    const fileExt = profileImage.name.split('.').pop();
    const filePath = `${staffData.supabase_auth_uid}/profile-${Date.now()}.${fileExt}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('staff_portfolios')
        .upload(filePath, profileImage);
        
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('staff_portfolios')
        .getPublicUrl(filePath);
        
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload profile image",
        variant: "destructive",
      });
      return null;
    }
  };
  
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Upload the profile image if there's a new one
      const imageUrl = await uploadImage();
      
      // Prepare social links
      const socialLinks = {
        website,
        instagram,
        facebook,
        twitter
      };
      
      // Prepare certifications array
      const certificationsArray = certifications
        .split(',')
        .map(cert => cert.trim())
        .filter(cert => cert.length > 0);
      
      const profileDataToSave = {
        staff_id: staffData.staff_id,
        bio,
        specialization,
        years_experience: yearsExperience ? parseInt(yearsExperience, 10) : null,
        certifications: certificationsArray,
        social_links: socialLinks,
        profile_image_url: imageUrl || previewUrl,
        updated_at: new Date()
      };
      
      // Update the staff phone number
      if (phone !== staffData.phone_number) {
        const { error: phoneError } = await supabase
          .from('vendor_staff')
          .update({ phone_number: phone })
          .eq('staff_id', staffData.staff_id);
          
        if (phoneError) throw phoneError;
      }
      
      // Save or update the profile
      let error;
      if (!profileData) {
        // Create new profile
        const { error: insertError } = await (supabase
          .from('vendor_staff_profiles') as any)
          .insert(profileDataToSave);
        error = insertError;
      } else {
        // Update existing profile
        const { error: updateError } = await (supabase
          .from('vendor_staff_profiles') as any)
          .update(profileDataToSave)
          .eq('id', profileData.id);
        error = updateError;
      }
      
      if (error) throw error;
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sanskara-red/20 border-t-sanskara-red"></div>
        <p className="ml-3">Loading profile...</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Profile</CardTitle>
        <CardDescription>Update your professional details and contact information</CardDescription>
      </CardHeader>
      <form onSubmit={saveProfile}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} alt={staffData.display_name} />
                <AvatarFallback className="text-2xl">{staffData.display_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <label 
                  htmlFor="profile-image" 
                  className="cursor-pointer text-sm text-sanskara-red hover:text-sanskara-red/80"
                >
                  Change Image
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={staffData.display_name} disabled />
              </div>
              
              <div>
                <label className="text-sm font-medium">Role</label>
                <Input value={staffData.role} disabled />
              </div>
              
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={staffData.email} disabled />
              </div>
              
              <div>
                <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4 pt-4">
            <div>
              <label htmlFor="bio" className="text-sm font-medium">Bio</label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short bio about yourself"
                rows={4}
              />
            </div>
            
            <div>
              <label htmlFor="specialization" className="text-sm font-medium">Specialization</label>
              <Input
                id="specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="Your area of expertise"
              />
            </div>
            
            <div>
              <label htmlFor="years-experience" className="text-sm font-medium">Years of Experience</label>
              <Input
                id="years-experience"
                type="number"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                placeholder="Number of years of experience"
              />
            </div>
            
            <div>
              <label htmlFor="certifications" className="text-sm font-medium">Certifications</label>
              <Input
                id="certifications"
                value={certifications}
                onChange={(e) => setCertifications(e.target.value)}
                placeholder="List certifications separated by commas"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate certifications with commas</p>
            </div>
            
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-medium">Social Links</h3>
              
              <div>
                <label htmlFor="website" className="text-sm font-medium">Website</label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>
              
              <div>
                <label htmlFor="instagram" className="text-sm font-medium">Instagram</label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Your Instagram handle"
                />
              </div>
              
              <div>
                <label htmlFor="facebook" className="text-sm font-medium">Facebook</label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Your Facebook page"
                />
              </div>
              
              <div>
                <label htmlFor="twitter" className="text-sm font-medium">Twitter</label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Your Twitter handle"
                />
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-sanskara-red hover:bg-sanskara-red/90"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StaffProfileSection;
