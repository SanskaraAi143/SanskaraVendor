
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper functions to interact with tables and stored procedures 
 * that don't yet exist in the TypeScript type definitions
 */

// Type definitions for staff profiles and portfolio items
export interface StaffProfile {
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
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioItem {
  id: string;
  staff_id: string;
  title: string;
  description: string;
  category: string;
  media_type: string;
  media_url: string;
  thumbnail_url: string | null;
  featured: boolean;
  metadata: any;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for staff profiles
export const staffProfilesTable = {
  async select(query: { staff_id: string }) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('get_staff_profile', { p_staff_id: query.staff_id });
  },

  async insert(data: Partial<StaffProfile>) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('insert_staff_profile', data);
  },

  async update(data: Partial<StaffProfile>) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('update_staff_profile', data);
  }
};

// Helper functions for portfolio items
export const portfolioItemsTable = {
  async select(query: { staff_id: string }) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('get_portfolio_items', { p_staff_id: query.staff_id });
  },

  async insert(data: {
    p_staff_id: string;
    p_title: string;
    p_description: string;
    p_category: string;
    p_media_type: string;
    p_media_url: string;
    p_thumbnail_url: string | null;
    p_featured: boolean;
    p_metadata: any;
  }) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('add_portfolio_item', data);
  },

  async deleteItem(id: string) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('delete_portfolio_item', { p_id: id });
  },

  async updateFeatured(id: string, featured: boolean) {
    // Use type assertion to bypass TypeScript's type checking
    return await (supabase.rpc as any)('update_portfolio_item_featured', { 
      p_id: id, 
      p_featured: featured 
    });
  }
};

// Helper function to create database stored procedures
export const createStoredProcedures = async () => {
  try {
    // These are just placeholder functions that will call the actual functions
    // that will be created in the migration SQL
    await supabase.functions.invoke('create-stored-procedures', {
      body: { 
        action: 'create_procedures'
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating stored procedures:', error);
    return { success: false, error };
  }
};
