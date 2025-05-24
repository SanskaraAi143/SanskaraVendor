import { supabase } from "@/integrations/supabase/client";

export interface StaffProfile {
  id?: string;
  staff_id: string;
  bio?: string;
  specialization?: string;
  years_experience?: number;
  certifications?: string[];
  social_links?: {
    website?: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  profile_image_url?: string;
}

export const staffProfilesTable = {
  insert: async (profile: StaffProfile) => {
    return supabase
      .from('staff_profiles')
      .insert(profile)
      .select()
      .single();
  },
  update: async (profile: StaffProfile) => {
    return supabase
      .from('staff_profiles')
      .update(profile)
      .eq('id', profile.id)
      .select()
      .single();
  },
  select: async (params: { staff_id: string }) => {
    return supabase
      .from('staff_profiles')
      .select('*')
      .eq('staff_id', params.staff_id)
      .single();
  },
  delete: async (id: string) => {
    return supabase
      .from('staff_profiles')
      .delete()
      .eq('id', id);
  }
};

export interface PortfolioItem {
  item_id?: string;
  staff_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string;
  is_featured: boolean;
}

export const portfolioItemsTable = {
  insert: async (item: PortfolioItem) => {
    return supabase
      .from('portfolio_items')
      .insert(item)
      .select()
      .single();
  },
  update: async (item: PortfolioItem) => {
    return supabase
      .from('portfolio_items')
      .update(item)
      .eq('item_id', item.item_id)
      .select()
      .single();
  },
  select: async (staff_id: string) => {
    return supabase
      .from('portfolio_items')
      .select('*')
      .eq('staff_id', staff_id)
      .order('created_at', { ascending: false });
  },
  delete: async (item_id: string) => {
    return supabase
      .from('portfolio_items')
      .delete()
      .eq('item_id', item_id);
  }
};

export const createStoredProcedures = async () => {
  try {
    // Get staff profile
    await (supabase.rpc as any)('get_staff_profile', {});
    
    // Insert staff profile
    await (supabase.rpc as any)('insert_staff_profile', {});
    
    // Update staff profile
    await (supabase.rpc as any)('update_staff_profile', {});
    
    // Portfolio management
    
    // Get portfolio items
    await (supabase.rpc as any)('get_portfolio_items', {
      staff_id_param: ''
    });
    
    // Add portfolio item
    await (supabase.rpc as any)('add_portfolio_item', {
      staff_id_param: '',
      title_param: '',
      description_param: '',
      category_param: '',
      image_url_param: '',
      is_featured_param: false
    });
    
    // Delete portfolio item
    await (supabase.rpc as any)('delete_portfolio_item', {
      item_id_param: ''
    });
    
    // Update portfolio item featured status
    await (supabase.rpc as any)('update_portfolio_item_featured', {
      item_id_param: '',
      is_featured_param: false
    });
    
    console.log('Stored procedures initialized');
  } catch (error) {
    console.error('Failed to initialize stored procedures:', error);
  }
};
