import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, storage } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  query,
  collection,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { toast } from '@/components/ui/use-toast';
import { Edit, Save, X, User, Mail, Phone, Tag, Loader2, Upload, MapPin, Calendar } from 'lucide-react';

interface StaffProfile {
  staff_id: string;
  display_name: string;
  email: string;
  phone_number?: string;
  role: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  profile_image_url?: string;
  address?: string;
  date_of_birth?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  joining_date?: string;
  vendor_id: string;
}

interface StaffProfileCardProps {
  profile: StaffProfile;
  onUpdate: () => void;
}

const StaffProfileCard: React.FC<StaffProfileCardProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [editData, setEditData] = useState({
    display_name: profile.display_name || '',
    phone_number: profile.phone_number || '',
    bio: profile.bio || '',
    skills: profile.skills?.join(', ') || '',
    experience_years: profile.experience_years || 0,
    address: profile.address || '',
    date_of_birth: profile.date_of_birth || '',
    emergency_contact: profile.emergency_contact || '',
    emergency_phone: profile.emergency_phone || ''
  });

  React.useEffect(() => {
    loadProfileImage();
  }, [profile.staff_id]);

  const loadProfileImage = async () => {
    try {
      const storageRef = ref(storage, `vendor-staff/${profile.staff_id}/profile.jpg`);
      const url = await getDownloadURL(storageRef);
      setProfileImageUrl(url);
    } catch (error) {
      // console.log('No profile image found');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.staff_id}/profile.${fileExt}`;
      const storageRef = ref(storage, `vendor-staff/${fileName}`);

      await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      setProfileImageUrl(publicUrl);

      toast({
        title: 'Success',
        description: 'Profile image updated successfully',
      });

      onUpdate();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const skillsArray = editData.skills
        ? editData.skills.split(',').map(s => s.trim()).filter(s => s)
        : [];

      // Update basic staff data in vendor_staff collection
      const staffRef = doc(db, 'vendor_staff', profile.staff_id);
      await updateDoc(staffRef, {
        display_name: editData.display_name,
        phone_number: editData.phone_number || null,
        updated_at: new Date().toISOString()
      });

      // Prepare additional profile data
      const additionalData = {
        bio: editData.bio || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        experience_years: editData.experience_years || null,
        address: editData.address || null,
        date_of_birth: editData.date_of_birth || null,
        emergency_contact: editData.emergency_contact || null,
        emergency_phone: editData.emergency_phone || null
      };

      // Check if profile data entry exists
      const portfolioQuery = query(
        collection(db, 'staff_portfolios'),
        where('staff_id', '==', profile.staff_id),
        where('portfolio_type', '==', 'profile_data')
      );
      const portfolioSnapshot = await getDocs(portfolioQuery);

      if (!portfolioSnapshot.empty) {
        // Update existing profile data
        const portfolioDoc = portfolioSnapshot.docs[0];
        await updateDoc(doc(db, 'staff_portfolios', portfolioDoc.id), {
          generic_attributes: additionalData,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new profile data entry
        await addDoc(collection(db, 'staff_portfolios'), {
          staff_id: profile.staff_id,
          vendor_id: profile.vendor_id,
          portfolio_type: 'profile_data',
          title: 'Profile Data',
          description: 'Additional profile information',
          generic_attributes: additionalData,
          created_at: new Date().toISOString()
        });
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully.',
      });

      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      display_name: profile.display_name || '',
      phone_number: profile.phone_number || '',
      bio: profile.bio || '',
      skills: profile.skills?.join(', ') || '',
      experience_years: profile.experience_years || 0,
      address: profile.address || '',
      date_of_birth: profile.date_of_birth || '',
      emergency_contact: profile.emergency_contact || '',
      emergency_phone: profile.emergency_phone || ''
    });
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profileImageUrl} alt={profile.display_name} />
                <AvatarFallback className="bg-sanskara-blue/10 text-sanskara-blue text-lg">
                  {profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {uploadingImage ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Upload className="h-6 w-6 text-white" />
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{profile.display_name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {profile.role}
              </Badge>
              {profile.joining_date && (
                <p className="text-sm text-gray-500 mt-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Joined {new Date(profile.joining_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            disabled={saving}
          >
            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  value={editData.display_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={editData.phone_number}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  value={editData.experience_years}
                  onChange={(e) => setEditData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={editData.date_of_birth}
                  onChange={(e) => setEditData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact">Emergency Contact</Label>
                <Input
                  id="emergency_contact"
                  value={editData.emergency_contact}
                  onChange={(e) => setEditData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  placeholder="Emergency contact name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Emergency Phone</Label>
                <Input
                  id="emergency_phone"
                  value={editData.emergency_phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, emergency_phone: e.target.value }))}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={editData.address}
                onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Complete address"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={editData.skills}
                onChange={(e) => setEditData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="e.g., Photography, Event Planning, Design"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editData.bio}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {profile.bio && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">About Me</h3>
                <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Contact & Personal</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone_number && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.address && (
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-3 mt-1 text-gray-400" />
                    <span>{profile.address}</span>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>Born on {new Date(profile.date_of_birth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Professional Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800">Professional Details</h3>
                {profile.experience_years && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Tag className="h-4 w-4 mr-3 text-gray-400" />
                    <span>{profile.experience_years} years of experience</span>
                  </div>
                )}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {profile.emergency_contact && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold text-red-600">Emergency Contact</h3>
                <div className="text-sm text-gray-600 mt-2">
                  <p><strong>Name:</strong> {profile.emergency_contact}</p>
                  {profile.emergency_phone && <p><strong>Phone:</strong> {profile.emergency_phone}</p>}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StaffProfileCard;
