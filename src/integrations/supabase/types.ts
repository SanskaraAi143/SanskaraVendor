export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      booking_services: {
        Row: {
          booking_id: string
          booking_service_id: string
          created_at: string | null
          negotiated_price: number | null
          quantity: number | null
          service_specific_notes: string | null
          vendor_service_id: string
        }
        Insert: {
          booking_id: string
          booking_service_id?: string
          created_at?: string | null
          negotiated_price?: number | null
          quantity?: number | null
          service_specific_notes?: string | null
          vendor_service_id: string
        }
        Update: {
          booking_id?: string
          booking_service_id?: string
          created_at?: string | null
          negotiated_price?: number | null
          quantity?: number | null
          service_specific_notes?: string | null
          vendor_service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_services_vendor_service_id_fkey"
            columns: ["vendor_service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["service_id"]
          },
        ]
      }
      bookings: {
        Row: {
          advance_amount_due: number | null
          booking_id: string
          booking_source: string
          booking_status: string
          commission_amount: number | null
          commission_rate_applied: number | null
          contract_details_url: string | null
          created_at: string | null
          created_by_staff_id: string | null
          custom_customer_details: Json | null
          event_date: string
          notes_for_user: string | null
          notes_for_vendor: string | null
          paid_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
          user_shortlisted_vendor_id: string | null
          vendor_id: string
          wedding_id: string | null
        }
        Insert: {
          advance_amount_due?: number | null
          booking_id?: string
          booking_source?: string
          booking_status?: string
          commission_amount?: number | null
          commission_rate_applied?: number | null
          contract_details_url?: string | null
          created_at?: string | null
          created_by_staff_id?: string | null
          custom_customer_details?: Json | null
          event_date: string
          notes_for_user?: string | null
          notes_for_vendor?: string | null
          paid_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_shortlisted_vendor_id?: string | null
          vendor_id: string
          wedding_id?: string | null
        }
        Update: {
          advance_amount_due?: number | null
          booking_id?: string
          booking_source?: string
          booking_status?: string
          commission_amount?: number | null
          commission_rate_applied?: number | null
          contract_details_url?: string | null
          created_at?: string | null
          created_by_staff_id?: string | null
          custom_customer_details?: Json | null
          event_date?: string
          notes_for_user?: string | null
          notes_for_vendor?: string | null
          paid_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
          user_shortlisted_vendor_id?: string | null
          vendor_id?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_created_by_staff_id_fkey"
            columns: ["created_by_staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_user_shortlisted_vendor_id_fkey"
            columns: ["user_shortlisted_vendor_id"]
            isOneToOne: false
            referencedRelation: "user_shortlisted_vendors"
            referencedColumns: ["user_vendor_id"]
          },
          {
            foreignKeyName: "bookings_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "bookings_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["wedding_id"]
          },
        ]
      }
      budget_items: {
        Row: {
          amount: number
          category: string
          contribution_by: string | null
          created_at: string | null
          item_id: string
          item_name: string
          status: string | null
          updated_at: string | null
          vendor_name: string | null
          wedding_id: string | null
        }
        Insert: {
          amount: number
          category: string
          contribution_by?: string | null
          created_at?: string | null
          item_id?: string
          item_name: string
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
          wedding_id?: string | null
        }
        Update: {
          amount?: number
          category?: string
          contribution_by?: string | null
          created_at?: string | null
          item_id?: string
          item_name?: string
          status?: string | null
          updated_at?: string | null
          vendor_name?: string | null
          wedding_id?: string | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: Json
          message_id: string
          sender_name: string
          sender_type: string
          session_id: string
          timestamp: string | null
        }
        Insert: {
          content: Json
          message_id?: string
          sender_name: string
          sender_type: string
          session_id: string
          timestamp?: string | null
        }
        Update: {
          content?: Json
          message_id?: string
          sender_name?: string
          sender_type?: string
          session_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["session_id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          adk_session_id: string | null
          created_at: string | null
          final_summary: string | null
          last_updated_at: string | null
          session_id: string
          summary: Json | null
          updated_at: string | null
          wedding_id: string | null
        }
        Insert: {
          adk_session_id?: string | null
          created_at?: string | null
          final_summary?: string | null
          last_updated_at?: string | null
          session_id?: string
          summary?: Json | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Update: {
          adk_session_id?: string | null
          created_at?: string | null
          final_summary?: string | null
          last_updated_at?: string | null
          session_id?: string
          summary?: Json | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Relationships: []
      }
      guest_list: {
        Row: {
          contact_info: string | null
          created_at: string | null
          dietary_requirements: string | null
          guest_id: string
          guest_name: string
          relation: string | null
          side: string | null
          status: string | null
          updated_at: string | null
          wedding_id: string | null
        }
        Insert: {
          contact_info?: string | null
          created_at?: string | null
          dietary_requirements?: string | null
          guest_id?: string
          guest_name: string
          relation?: string | null
          side?: string | null
          status?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Update: {
          contact_info?: string | null
          created_at?: string | null
          dietary_requirements?: string | null
          guest_id?: string
          guest_name?: string
          relation?: string | null
          side?: string | null
          status?: string | null
          updated_at?: string | null
          wedding_id?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          app_name: string
          content: Json
          created_at: string
          embedding: string
          memory_id: string
          user_id: string
        }
        Insert: {
          app_name: string
          content: Json
          created_at?: string
          embedding: string
          memory_id?: string
          user_id: string
        }
        Update: {
          app_name?: string
          content?: Json
          created_at?: string
          embedding?: string
          memory_id?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_board_items: {
        Row: {
          category: string | null
          created_at: string | null
          image_url: string
          item_id: string
          mood_board_id: string
          note: string | null
          owner_party: string | null
          visibility: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          image_url: string
          item_id?: string
          mood_board_id: string
          note?: string | null
          owner_party?: string | null
          visibility?: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          image_url?: string
          item_id?: string
          mood_board_id?: string
          note?: string | null
          owner_party?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_board_items_mood_board_id_fkey"
            columns: ["mood_board_id"]
            isOneToOne: false
            referencedRelation: "mood_boards"
            referencedColumns: ["mood_board_id"]
          },
        ]
      }
      mood_boards: {
        Row: {
          created_at: string | null
          description: string | null
          mood_board_id: string
          name: string
          owner_party: string | null
          updated_at: string | null
          visibility: string
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          mood_board_id?: string
          name?: string
          owner_party?: string | null
          updated_at?: string | null
          visibility?: string
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          mood_board_id?: string
          name?: string
          owner_party?: string | null
          updated_at?: string | null
          visibility?: string
          wedding_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          is_read: boolean | null
          message: string
          notification_id: string
          notification_type: string | null
          read_at: string | null
          recipient_staff_id: string | null
          recipient_user_id: string | null
          related_entity_id: string | null
          related_entity_type: string | null
        }
        Insert: {
          created_at?: string | null
          is_read?: boolean | null
          message: string
          notification_id?: string
          notification_type?: string | null
          read_at?: string | null
          recipient_staff_id?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Update: {
          created_at?: string | null
          is_read?: boolean | null
          message?: string
          notification_id?: string
          notification_type?: string | null
          read_at?: string | null
          recipient_staff_id?: string | null
          recipient_user_id?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_staff_id_fkey"
            columns: ["recipient_staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string | null
          notes: string | null
          paid_at: string | null
          payment_id: string
          payment_method: string | null
          payment_status: string
          payment_type: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_id?: string
          payment_method?: string | null
          payment_status?: string
          payment_type?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_id?: string
          payment_method?: string | null
          payment_status?: string
          payment_type?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string | null
          rating: number
          review_id: string
          review_visibility: string | null
          user_id: string
          vendor_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string | null
          rating: number
          review_id?: string
          review_visibility?: string | null
          user_id: string
          vendor_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string | null
          rating?: number
          review_id?: string
          review_visibility?: string | null
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "reviews_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      staff_portfolios: {
        Row: {
          created_at: string | null
          description: string | null
          generic_attributes: Json | null
          image_urls: Json | null
          portfolio_id: string
          portfolio_type: string
          staff_id: string
          title: string | null
          updated_at: string | null
          vendor_id: string
          video_urls: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          generic_attributes?: Json | null
          image_urls?: Json | null
          portfolio_id?: string
          portfolio_type: string
          staff_id: string
          title?: string | null
          updated_at?: string | null
          vendor_id: string
          video_urls?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          generic_attributes?: Json | null
          image_urls?: Json | null
          portfolio_id?: string
          portfolio_type?: string
          staff_id?: string
          title?: string | null
          updated_at?: string | null
          vendor_id?: string
          video_urls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_portfolios_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_portfolios_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      task_approvals: {
        Row: {
          approval_id: string
          approved_by_user_id: string | null
          approving_party: string
          created_at: string | null
          status: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          approval_id?: string
          approved_by_user_id?: string | null
          approving_party: string
          created_at?: string | null
          status?: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          approval_id?: string
          approved_by_user_id?: string | null
          approving_party?: string
          created_at?: string | null
          status?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_approvals_approved_by_user_id_fkey"
            columns: ["approved_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "task_approvals_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
        ]
      }
      task_feedback: {
        Row: {
          content: string | null
          created_at: string | null
          feedback_id: string
          feedback_type: string
          task_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          feedback_id?: string
          feedback_type: string
          task_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          feedback_id?: string
          feedback_type?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_feedback_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["task_id"]
          },
          {
            foreignKeyName: "task_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          is_complete: boolean | null
          lead_party: string | null
          priority: string | null
          status: string
          task_id: string
          title: string
          updated_at: string | null
          wedding_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          lead_party?: string | null
          priority?: string | null
          status?: string
          task_id?: string
          title: string
          updated_at?: string | null
          wedding_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          lead_party?: string | null
          priority?: string | null
          status?: string
          task_id?: string
          title?: string
          updated_at?: string | null
          wedding_id?: string | null
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date_time: string
          event_id: string
          event_name: string
          location: string | null
          relevant_party: string | null
          updated_at: string | null
          visibility: string
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date_time: string
          event_id?: string
          event_name: string
          location?: string | null
          relevant_party?: string | null
          updated_at?: string | null
          visibility?: string
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date_time?: string
          event_id?: string
          event_name?: string
          location?: string | null
          relevant_party?: string | null
          updated_at?: string | null
          visibility?: string
          wedding_id?: string | null
        }
        Relationships: []
      }
      user_shortlisted_vendors: {
        Row: {
          booked_date: string | null
          contact_info: string | null
          created_at: string | null
          estimated_cost: number | null
          linked_vendor_id: string | null
          notes: string | null
          owner_party: string
          status: string
          updated_at: string | null
          user_vendor_id: string
          vendor_category: string
          vendor_name: string
          wedding_id: string | null
        }
        Insert: {
          booked_date?: string | null
          contact_info?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          linked_vendor_id?: string | null
          notes?: string | null
          owner_party?: string
          status?: string
          updated_at?: string | null
          user_vendor_id?: string
          vendor_category: string
          vendor_name: string
          wedding_id?: string | null
        }
        Update: {
          booked_date?: string | null
          contact_info?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          linked_vendor_id?: string | null
          notes?: string | null
          owner_party?: string
          status?: string
          updated_at?: string | null
          user_vendor_id?: string
          vendor_category?: string
          vendor_name?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_shortlisted_vendors_linked_vendor_id_fkey"
            columns: ["linked_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          email: string
          preferences: Json | null
          supabase_auth_uid: string
          updated_at: string | null
          user_id: string
          user_type: string
          wedding_id: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          preferences?: Json | null
          supabase_auth_uid: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
          wedding_id?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          preferences?: Json | null
          supabase_auth_uid?: string
          updated_at?: string | null
          user_id?: string
          user_type?: string
          wedding_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["wedding_id"]
          },
        ]
      }
      vendor_availability: {
        Row: {
          availability_id: string
          available_date: string
          created_at: string | null
          notes: string | null
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          availability_id?: string
          available_date: string
          created_at?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          availability_id?: string
          available_date?: string
          created_at?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_service_staff: {
        Row: {
          assigned_at: string | null
          assigned_role: string | null
          id: string
          is_active: boolean | null
          service_id: string
          staff_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_role?: string | null
          id?: string
          is_active?: boolean | null
          service_id: string
          staff_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_role?: string | null
          id?: string
          is_active?: boolean | null
          service_id?: string
          staff_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_service_staff_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "vendor_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "vendor_service_staff_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "vendor_service_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_services: {
        Row: {
          base_price: number | null
          created_at: string | null
          customizability_details: Json | null
          description: string | null
          is_active: boolean | null
          is_in_house: boolean | null
          is_negotiable: boolean | null
          max_capacity: number | null
          min_capacity: number | null
          portfolio_image_urls: Json | null
          price_unit: string | null
          responsible_staff_id: string | null
          service_category: string
          service_id: string
          service_name: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          base_price?: number | null
          created_at?: string | null
          customizability_details?: Json | null
          description?: string | null
          is_active?: boolean | null
          is_in_house?: boolean | null
          is_negotiable?: boolean | null
          max_capacity?: number | null
          min_capacity?: number | null
          portfolio_image_urls?: Json | null
          price_unit?: string | null
          responsible_staff_id?: string | null
          service_category: string
          service_id?: string
          service_name: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          base_price?: number | null
          created_at?: string | null
          customizability_details?: Json | null
          description?: string | null
          is_active?: boolean | null
          is_in_house?: boolean | null
          is_negotiable?: boolean | null
          max_capacity?: number | null
          min_capacity?: number | null
          portfolio_image_urls?: Json | null
          price_unit?: string | null
          responsible_staff_id?: string | null
          service_category?: string
          service_id?: string
          service_name?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_services_responsible_staff_id_fkey"
            columns: ["responsible_staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "vendor_services_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_staff: {
        Row: {
          created_at: string | null
          display_name: string
          email: string
          invitation_status: string | null
          is_active: boolean | null
          phone_number: string | null
          role: string
          staff_id: string
          state: string
          supabase_auth_uid: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          email: string
          invitation_status?: string | null
          is_active?: boolean | null
          phone_number?: string | null
          role?: string
          staff_id?: string
          state?: string
          supabase_auth_uid?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          email?: string
          invitation_status?: string | null
          is_active?: boolean | null
          phone_number?: string | null
          role?: string
          staff_id?: string
          state?: string
          supabase_auth_uid?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_staff_availability: {
        Row: {
          available_date: string
          created_at: string | null
          notes: string | null
          staff_availability_id: string
          staff_id: string
          status: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          available_date: string
          created_at?: string | null
          notes?: string | null
          staff_availability_id?: string
          staff_id: string
          status?: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          available_date?: string
          created_at?: string | null
          notes?: string | null
          staff_availability_id?: string
          staff_id?: string
          status?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_availability_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "vendor_staff_availability_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_staff_invite: {
        Row: {
          created_at: string | null
          email: string
          id: string
          invitation_status: string
          role: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          invitation_status?: string
          role: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          invitation_status?: string
          role?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_staff_invite_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendor_tasks: {
        Row: {
          assigned_staff_id: string | null
          booking_id: string | null
          category: string | null
          created_at: string | null
          dependency_task_id: string | null
          description: string | null
          due_date: string | null
          is_complete: boolean | null
          priority: string | null
          status: string
          title: string
          updated_at: string | null
          user_facing: boolean | null
          vendor_id: string
          vendor_task_id: string
        }
        Insert: {
          assigned_staff_id?: string | null
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          dependency_task_id?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          priority?: string | null
          status?: string
          title: string
          updated_at?: string | null
          user_facing?: boolean | null
          vendor_id: string
          vendor_task_id?: string
        }
        Update: {
          assigned_staff_id?: string | null
          booking_id?: string | null
          category?: string | null
          created_at?: string | null
          dependency_task_id?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          priority?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          user_facing?: boolean | null
          vendor_id?: string
          vendor_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_tasks_assigned_staff_id_fkey"
            columns: ["assigned_staff_id"]
            isOneToOne: false
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "vendor_tasks_dependency_task_id_fkey"
            columns: ["dependency_task_id"]
            isOneToOne: false
            referencedRelation: "vendor_tasks"
            referencedColumns: ["vendor_task_id"]
          },
          {
            foreignKeyName: "vendor_tasks_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: Json | null
          commission_rate: number | null
          contact_email: string | null
          created_at: string | null
          description: string | null
          details: Json | null
          is_active: boolean | null
          is_verified: boolean | null
          phone_number: string | null
          portfolio_image_urls: Json | null
          pricing_range: Json | null
          rating: number | null
          status: string | null
          supabase_auth_uid: string | null
          updated_at: string | null
          vendor_category: string
          vendor_id: string
          vendor_name: string
          website_url: string | null
        }
        Insert: {
          address?: Json | null
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          details?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number?: string | null
          portfolio_image_urls?: Json | null
          pricing_range?: Json | null
          rating?: number | null
          status?: string | null
          supabase_auth_uid?: string | null
          updated_at?: string | null
          vendor_category: string
          vendor_id?: string
          vendor_name: string
          website_url?: string | null
        }
        Update: {
          address?: Json | null
          commission_rate?: number | null
          contact_email?: string | null
          created_at?: string | null
          description?: string | null
          details?: Json | null
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number?: string | null
          portfolio_image_urls?: Json | null
          pricing_range?: Json | null
          rating?: number | null
          status?: string | null
          supabase_auth_uid?: string | null
          updated_at?: string | null
          vendor_category?: string
          vendor_id?: string
          vendor_name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      wedding_members: {
        Row: {
          role: string
          user_id: string
          wedding_id: string
        }
        Insert: {
          role: string
          user_id: string
          wedding_id: string
        }
        Update: {
          role?: string
          user_id?: string
          wedding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wedding_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "wedding_members_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["wedding_id"]
          },
        ]
      }
      weddings: {
        Row: {
          created_at: string | null
          details: Json | null
          status: string
          updated_at: string | null
          wedding_date: string | null
          wedding_id: string
          wedding_location: string | null
          wedding_name: string
          wedding_style: string | null
          wedding_tradition: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          status?: string
          updated_at?: string | null
          wedding_date?: string | null
          wedding_id?: string
          wedding_location?: string | null
          wedding_name: string
          wedding_style?: string | null
          wedding_tradition?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          status?: string
          updated_at?: string | null
          wedding_date?: string | null
          wedding_id?: string
          wedding_location?: string | null
          wedding_name?: string
          wedding_style?: string | null
          wedding_tradition?: string | null
        }
        Relationships: []
      }
      workflows: {
        Row: {
          context_summary: Json | null
          created_at: string | null
          status: string
          updated_at: string | null
          wedding_id: string
          workflow_id: string
          workflow_name: string
        }
        Insert: {
          context_summary?: Json | null
          created_at?: string | null
          status?: string
          updated_at?: string | null
          wedding_id: string
          workflow_id?: string
          workflow_name: string
        }
        Update: {
          context_summary?: Json | null
          created_at?: string | null
          status?: string
          updated_at?: string | null
          wedding_id?: string
          workflow_id?: string
          workflow_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_wedding_id_fkey"
            columns: ["wedding_id"]
            isOneToOne: false
            referencedRelation: "weddings"
            referencedColumns: ["wedding_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      reset_wedding_data: {
        Args: { p_wedding_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
