import React, { useState, useEffect, FormEvent, useCallback } from 'react'; // Added useCallback
import { supabase } from '../../../integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Loader2, AlertTriangle, PlusCircle, Edit, Trash2 } from 'lucide-react';

// Assuming sonner is available for toasts, if not, will use alerts.
// import { toast } from "sonner"

interface StaffInfo {
  staff_id: string;
  vendor_id: string;
  role: string;
  // Add other relevant fields from vendor_staff if needed
}

// Fix PortfolioItem type to match Supabase schema
interface PortfolioItem {
  portfolio_id: string;
  portfolio_type: string;
  title: string | null;
  description: string | null;
  image_urls: string[] | null;
  video_urls: string[] | null;
  generic_attributes?: Record<string, any>;
  // Add other relevant fields from staff_portfolios
}

const initialFormData: Partial<PortfolioItem> = {
  title: '',
  description: '',
  image_urls: [],
  video_urls: [],
  generic_attributes: {},
  portfolio_type: '', // Will be set based on role
};


const StaffPortfolioForm: React.FC = () => {
  // Ensure variables are properly initialized
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false); // For form submissions
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit' | null>(null);
  const [currentPortfolioItem, setCurrentPortfolioItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState<Partial<PortfolioItem>>(initialFormData);

  // Function to map role to portfolio type
  const getPortfolioTypeFromRole = (role: string): string => {
    // This is a simplified mapping. Could be more complex or data-driven.
    if (role.toLowerCase().includes('cater')) return 'caterer';
    if (role.toLowerCase().includes('photo')) return 'photographer';
    if (role.toLowerCase().includes('venue')) return 'venue_space'; // Differentiating from main vendor 'venue' type
    if (role.toLowerCase().includes('decor')) return 'decor_item';
    return 'general'; // Default or for other roles
  };

  // Ensure fetchData is properly scoped and defined
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
        setPortfolioItems(portfolioData || []);
      }
    } catch (e: any) {
      console.error('Error fetching portfolio data:', e);
      setError(e.message || 'An unexpected error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
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
          setPortfolioItems(portfolioData || []);
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
      // toast.error("Staff information not available.");
      return;
    }
    resetForm(staffInfo.role); // Pass role to set default portfolio_type
    setFormMode('add');
    setIsFormVisible(true);
    // toast.info("Add new portfolio item form opened.");
  };

  const handleEditItem = (item: PortfolioItem) => {
    setFormMode('edit');
    setCurrentPortfolioItem(item);
    setFormData({
      portfolio_id: item.portfolio_id,
      title: item.title || '',
      description: item.description || '',
      image_urls: item.image_urls || [],
      video_urls: item.video_urls || [],
      portfolio_type: item.portfolio_type, // Keep original type on edit
      generic_attributes: item.generic_attributes || {},
    });
    setIsFormVisible(true);
    // toast.info(`Editing item: ${item.title || item.portfolio_id}`);
  };

  const handleCancel = () => {
    resetForm(staffInfo?.role);
    // toast.info("Operation cancelled.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!staffInfo || !formMode) {
      setError("Cannot submit form: Staff information missing or form mode not set.");
      // toast.error("Cannot submit form: Critical information missing.");
      return;
    }
    setFormLoading(true);
    setError(null);

    // Fixing the submissionData object to ensure all required fields are provided
    const submissionData = {
      ...formData,
      staff_id: staffInfo.staff_id,
      vendor_id: staffInfo.vendor_id,
      portfolio_type: formData.portfolio_type || 'general', // Ensure portfolio_type is always provided
    };

    try {
      if (formMode === 'add') {
        const { error: insertError } = await supabase
          .from('staff_portfolios')
          .insert(submissionData);
        if (insertError) throw insertError;
        // toast.success("Portfolio item added successfully!");
      } else if (formMode === 'edit' && currentPortfolioItem?.portfolio_id) {
        const { error: updateError } = await supabase
          .from('staff_portfolios')
          .update(submissionData)
          .eq('portfolio_id', currentPortfolioItem.portfolio_id);
        if (updateError) throw updateError;
        // toast.success("Portfolio item updated successfully!");
      }
      // Refresh list (crude way, ideally just update state locally or re-fetch)
      // For now, let's just re-trigger the main useEffect fetch (will cause full reload of items)
      // A more sophisticated approach would be to update the portfolioItems state directly.
      // This will be simplified by just calling fetchData again for now.
      const { data: { user } } = await supabase.auth.getUser(); // Re-fetch to trigger useEffect dependency if needed
      if (user && staffInfo.staff_id) { // Re-fetch portfolio items
          const { data: portfolioData, error: portfolioError } = await supabase
            .from('staff_portfolios')
            .select('portfolio_id, portfolio_type, title, description, image_urls, video_urls, generic_attributes')
            .eq('staff_id', staffInfo.staff_id);
          if (portfolioError) throw portfolioError;
          setPortfolioItems(portfolioData || []);
      }
      resetForm(staffInfo.role);
    } catch (e: any) {
      console.error(`Error in ${formMode} mode:`, e);
      setError(e.message || `Failed to ${formMode} item.`);
      // toast.error(e.message || `Failed to ${formMode} item.`);
    } finally {
      setFormLoading(false);
      }
    };

  // Ensure all state variables are properly referenced in the JSX
  return (
    <div>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2">Loading portfolio information...</p>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : !staffInfo ? (
        <Alert className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Information Missing</AlertTitle>
          <AlertDescription>
            Staff information could not be loaded. Please ensure you are logged in and have a staff profile.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="m-4">
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
                  <div className="space-y-4">
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

                    {/* Dynamic fields based on portfolio_type */}
                    {formData.portfolio_type === 'caterer' && (
                      <>
                        <div>
                          <Label htmlFor="food_options">Food Options (JSON or structured text)</Label>
                          <Textarea
                            id="food_options"
                            name="food_options" // This will be a key in generic_attributes
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
                            name="pricing_details" // This will be a key in generic_attributes
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
                          name="service_type" // This will be a key in generic_attributes
                          value={formData.generic_attributes?.service_type || ''}
                          onChange={(e) => handleGenericAttributeChange('service_type', e.target.value)}
                          placeholder="e.g., Wedding, Portrait, Event"
                          disabled={formLoading}
                        />
                      </div>
                    )}
                    {/* Add more type-specific fields for 'venue_space', 'decor_item' as needed */}
                    
                    {/* Placeholder for File Uploader (Image URLs) */}
                    <div className="p-4 border rounded-md bg-gray-50">
                       <Label>Image URLs (File Uploader Placeholder)</Label>
                       <p className="text-sm text-gray-500">Current: {formData?.image_urls?.join(', ') || 'None'}</p>
                       {/* TODO: Integrate FileUploader.tsx here */}
                    </div>

                    {/* Placeholder for File Uploader (Video URLs) */}
                    <div className="p-4 border rounded-md bg-gray-50">
                       <Label>Video URLs (File Uploader Placeholder)</Label>
                       <p className="text-sm text-gray-500">Current: {formData?.video_urls?.join(', ') || 'None'}</p>
                       {/* TODO: Integrate FileUploader.tsx here */}
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolioItems.map((item) => (
                    <TableRow key={item.portfolio_id}>
                      <TableCell>{item.portfolio_type}</TableCell>
                      <TableCell>{item.title || 'N/A'}</TableCell>
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
        </Card>
      )}
    </div>
  );
};

export default StaffPortfolioForm;
