
import React, { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2 } from 'lucide-react';
import StaffPortfolioFileUpload from './StaffPortfolioFileUpload';
import { TaggedImages } from '../../../utils/taggedUploadHelpers';

interface StaffInfo {
  staff_id: string;
  vendor_id: string;
  role: string;
}

interface PortfolioItem {
  portfolio_id: string;
  portfolio_type: string;
  title: string | null;
  description: string | null;
  image_urls: TaggedImages | null;
  video_urls: TaggedImages | null;
  generic_attributes?: Record<string, any> | null;
}

const initialFormData: Partial<PortfolioItem> = {
  title: '',
  description: '',
  image_urls: {},
  video_urls: {},
  generic_attributes: {},
  portfolio_type: '',
};

// Helper function to convert old string[] format to new TaggedImages format
const convertToTaggedImages = (data: any): TaggedImages | null => {
  if (!data) return null;
  
  // If it's already an object (new format), return as is
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as TaggedImages;
  }
  
  // If it's an array (old format), convert to tagged format
  if (Array.isArray(data) && data.length > 0) {
    return { general: data };
  }
  
  return null;
};

// Helper function to convert TaggedImages back to format expected by database
const convertForDatabase = (taggedImages: TaggedImages | null): any => {
  if (!taggedImages) return null;
  
  // For now, we'll convert back to string[] format until migration is applied
  // This ensures compatibility with current schema
  const allUrls: string[] = [];
  Object.values(taggedImages).forEach(urls => {
    if (Array.isArray(urls)) {
      allUrls.push(...urls);
    }
  });
  
  return allUrls.length > 0 ? allUrls : null;
};

const StaffPortfolioForm: React.FC = () => {
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [currentPortfolioItem, setCurrentPortfolioItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<Partial<PortfolioItem>>(initialFormData);

  const getPortfolioTypeFromRole = (role: string): string => {
    if (role.toLowerCase().includes('cater')) return 'caterer';
    if (role.toLowerCase().includes('photo')) return 'photographer';
    if (role.toLowerCase().includes('venue')) return 'venue_space';
    if (role.toLowerCase().includes('decor')) return 'decor_item';
    return 'general';
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        if (!user) throw new Error('User not authenticated.');

        const { data: staffData, error: staffError } = await supabase
          .from('vendor_staff')
          .select('staff_id, vendor_id, role')
          .eq('supabase_auth_uid', user.id)
          .single();

        if (staffError) throw staffError;
        if (!staffData) throw new Error('Staff profile not found.');

        setStaffInfo(staffData as StaffInfo);

        if (staffData.staff_id) {
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('staff_portfolios')
            .select('portfolio_id, portfolio_type, title, description, image_urls, video_urls, generic_attributes')
            .eq('staff_id', staffData.staff_id);

          if (portfolioError) throw portfolioError;
          
          const transformedData: PortfolioItem[] = (portfolioData || []).map(item => ({
            portfolio_id: item.portfolio_id,
            portfolio_type: item.portfolio_type,
            title: item.title,
            description: item.description,
            image_urls: convertToTaggedImages(item.image_urls),
            video_urls: convertToTaggedImages(item.video_urls),
            generic_attributes: item.generic_attributes as Record<string, any> | null
          }));
          
          setPortfolioItems(transformedData);
        }
      } catch (e: any) {
        console.error('Error fetching portfolio data:', e);
        setError(e.message || 'An unexpected error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenericAttributeChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      generic_attributes: {
        ...prev.generic_attributes,
        [key]: value,
      },
    }));
  };

  const handleImagesUploaded = (updatedTaggedImages: TaggedImages) => {
    setFormData(prev => ({ ...prev, image_urls: updatedTaggedImages }));
  };

  const handleVideosUploaded = (updatedTaggedImages: TaggedImages) => {
    setFormData(prev => ({ ...prev, video_urls: updatedTaggedImages }));
  };

  const resetForm = (role?: string) => {
    const defaultType = role ? getPortfolioTypeFromRole(role) : 'general';
    setFormData({ ...initialFormData, portfolio_type: defaultType });
    setCurrentPortfolioItem(null);
    setFormMode(null);
    setIsFormVisible(false);
  };
  
  const handleAddNewItem = () => {
    if (!staffInfo) {
      setError("Staff information not available to add new item.");
      return;
    }
    resetForm(staffInfo.role);
    setFormMode('add');
    setIsFormVisible(true);
  };

  const handleEditItem = (item: PortfolioItem) => {
    setFormMode('edit');
    setCurrentPortfolioItem(item);
    setFormData({
      portfolio_id: item.portfolio_id,
      title: item.title || '',
      description: item.description || '',
      image_urls: item.image_urls || {},
      video_urls: item.video_urls || {},
      portfolio_type: item.portfolio_type,
      generic_attributes: item.generic_attributes || {},
    });
    setIsFormVisible(true);
  };

  const handleCancel = () => {
    resetForm(staffInfo?.role);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staffInfo || !formMode) {
      setError("Cannot submit form: Staff information missing or form mode not set.");
      return;
    }
    setFormLoading(true);
    setError(null);

    const submissionData = {
      ...formData,
      staff_id: staffInfo.staff_id,
      vendor_id: staffInfo.vendor_id,
      portfolio_type: formData.portfolio_type || 'general',
      // Convert tagged images back to format expected by current database schema
      image_urls: convertForDatabase(formData.image_urls),
      video_urls: convertForDatabase(formData.video_urls),
    };

    try {
      if (formMode === 'add') {
        const { error: insertError } = await supabase
          .from('staff_portfolios')
          .insert(submissionData);
        if (insertError) throw insertError;
      } else if (formMode === 'edit' && currentPortfolioItem?.portfolio_id) {
        const { error: updateError } = await supabase
          .from('staff_portfolios')
          .update(submissionData)
          .eq('portfolio_id', currentPortfolioItem.portfolio_id);
        if (updateError) throw updateError;
      }

      // Refresh the portfolio items
      if (staffInfo.staff_id) {
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('staff_portfolios')
          .select('portfolio_id, portfolio_type, title, description, image_urls, video_urls, generic_attributes')
          .eq('staff_id', staffInfo.staff_id);
        
        if (portfolioError) throw portfolioError;
        
        const transformedData: PortfolioItem[] = (portfolioData || []).map(item => ({
          portfolio_id: item.portfolio_id,
          portfolio_type: item.portfolio_type,
          title: item.title,
          description: item.description,
          image_urls: convertToTaggedImages(item.image_urls),
          video_urls: convertToTaggedImages(item.video_urls),
          generic_attributes: item.generic_attributes as Record<string, any> | null
        }));
        
        setPortfolioItems(transformedData);
      }
      resetForm(staffInfo.role);
    } catch (e: any) {
      console.error(`Error in ${formMode} mode:`, e);
      setError(e.message || `Failed to ${formMode} item.`);
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading portfolio information...</p>
      </div>
    );
  }

  if (error && !staffInfo) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!staffInfo) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Information Missing</AlertTitle>
        <AlertDescription>
          Staff information could not be loaded. Please ensure you are logged in and have a staff profile.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>Portfolio Management</CardTitle>
        <CardDescription>
          Manage your professional portfolio items with tagged images and videos
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isFormVisible && (
          <div className="mb-6">
            <Button onClick={handleAddNewItem} className="mb-4">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>
        )}

        {isFormVisible && staffInfo && (
          <Card className="mb-6 shadow-md">
            <CardHeader>
              <CardTitle>{formMode === 'add' ? 'Add New Portfolio Item' : 'Edit Portfolio Item'}</CardTitle>
              <CardDescription>
                Fill in the details for your portfolio item. Portfolio Type: <strong>{formData.portfolio_type}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      name="title" 
                      value={formData.title || ''} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Summer Wedding Collection, Signature Dish" 
                      disabled={formLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      value={formData.description || ''} 
                      onChange={handleInputChange} 
                      placeholder="Describe your work or service..." 
                      disabled={formLoading}
                    />
                  </div>

                  {formData.portfolio_type === 'caterer' && (
                    <>
                      <div>
                        <Label htmlFor="food_options">Food Options (JSON or structured text)</Label>
                        <Textarea
                          id="food_options"
                          name="food_options"
                          value={formData.generic_attributes?.food_options || ''}
                          onChange={(e) => handleGenericAttributeChange('food_options', e.target.value)}
                          placeholder='e.g., {"menus": [{"name": "Italian Feast", "items": ["Pasta", "Salad"]}]}'
                          disabled={formLoading}
                        />
                      </div>
                      <div>
                        <Label htmlFor="pricing_details">Pricing Details</Label>
                        <Textarea
                          id="pricing_details"
                          name="pricing_details"
                          value={formData.generic_attributes?.pricing_details || ''}
                          onChange={(e) => handleGenericAttributeChange('pricing_details', e.target.value)}
                          placeholder="e.g., Packages start at $50 per person."
                          disabled={formLoading}
                        />
                      </div>
                    </>
                  )}
                  {formData.portfolio_type === 'photographer' && (
                    <div>
                      <Label htmlFor="service_type">Service Type</Label>
                      <Input
                        id="service_type"
                        name="service_type"
                        value={formData.generic_attributes?.service_type || ''}
                        onChange={(e) => handleGenericAttributeChange('service_type', e.target.value)}
                        placeholder="e.g., Wedding, Portrait, Event"
                        disabled={formLoading}
                      />
                    </div>
                  )}
                  
                  {/* Tagged Image Upload */}
                  <div>
                    <StaffPortfolioFileUpload
                      vendorId={staffInfo.vendor_id}
                      staffId={staffInfo.staff_id}
                      portfolioType={formData.portfolio_type || 'general'}
                      currentTaggedImages={formData.image_urls || null}
                      onFilesUploaded={handleImagesUploaded}
                      onFileRemoved={handleImagesUploaded}
                      fileType="image"
                      maxFiles={15}
                      bucketName="staff-portfolios"
                    />
                  </div>

                  {/* Tagged Video Upload */}
                  <div>
                    <StaffPortfolioFileUpload
                      vendorId={staffInfo.vendor_id}
                      staffId={staffInfo.staff_id}
                      portfolioType={formData.portfolio_type || 'general'}
                      currentTaggedImages={formData.video_urls || null}
                      onFilesUploaded={handleVideosUploaded}
                      onFileRemoved={handleVideosUploaded}
                      fileType="video"
                      maxFiles={5}
                      bucketName="staff-portfolios"
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCancel} disabled={formLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={formLoading}>
                      {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {formMode === 'add' ? 'Add Item' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">Current Portfolio Items</h3>
          {portfolioItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Images</TableHead>
                  <TableHead>Videos</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolioItems.map((item) => (
                  <TableRow key={item.portfolio_id}>
                    <TableCell>{item.portfolio_type}</TableCell>
                    <TableCell>{item.title || 'N/A'}</TableCell>
                    <TableCell>
                      {item.image_urls ? Object.keys(item.image_urls).length : 0} tags
                    </TableCell>
                    <TableCell>
                      {item.video_urls ? Object.keys(item.video_urls).length : 0} tags
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)} className="mr-1" disabled={formLoading}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" disabled={formLoading}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>No portfolio items found. Start by adding a new item.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffPortfolioForm;
