export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
            foreignKeyName: "booking_services_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
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
          booking_status: string
          commission_amount: number | null
          commission_rate_applied: number | null
          contract_details_url: string | null
          created_at: string | null
          event_date: string
          notes_for_user: string | null
          notes_for_vendor: string | null
          paid_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
          user_shortlisted_vendor_id: string | null
          vendor_id: string
        }
        Insert: {
          advance_amount_due?: number | null
          booking_id?: string
          booking_status?: string
          commission_amount?: number | null
          commission_rate_applied?: number | null
          contract_details_url?: string | null
          created_at?: string | null
          event_date: string
          notes_for_user?: string | null
          notes_for_vendor?: string | null
          paid_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          user_shortlisted_vendor_id?: string | null
          vendor_id: string
        }
        Update: {
          advance_amount_due?: number | null
          booking_id?: string
          booking_status?: string
          commission_amount?: number | null
          commission_rate_applied?: number | null
          contract_details_url?: string | null
          created_at?: string | null
          event_date?: string
          notes_for_user?: string | null
          notes_for_vendor?: string | null
          paid_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          user_shortlisted_vendor_id?: string | null
          vendor_id?: string
        }
        Relationships: [
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
        ]
      }
      budget_items: {
        Row: {
          amount: number
          category: string
          created_at: string | null
          item_id: string
          item_name: string
          status: string | null
          updated_at: string | null
          user_id: string
          vendor_name: string | null
        }
        Insert: {
          amount: number
          category: string
          created_at?: string | null
          item_id?: string
          item_name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
          vendor_name?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string | null
          item_id?: string
          item_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
          vendor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
          created_at: string | null
          last_updated_at: string | null
          session_id: string
          summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          last_updated_at?: string | null
          session_id?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          last_updated_at?: string | null
          session_id?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_list_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mood_board_items: {
        Row: {
          category: string | null
          created_at: string | null
          image_url: string
          item_id: string
          mood_board_id: string
          note: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          image_url: string
          item_id?: string
          mood_board_id: string
          note?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          image_url?: string
          item_id?: string
          mood_board_id?: string
          note?: string | null
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
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          mood_board_id?: string
          name?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          mood_board_id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_boards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
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
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
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
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
          },
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
          portfolio_id: string
          staff_id: string
          vendor_id: string
          portfolio_type: string
          title: string | null
          description: string | null
          image_urls: string[] | null
          video_urls: string[] | null
          generic_attributes: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          portfolio_id?: string
          staff_id: string
          vendor_id: string
          portfolio_type: string
          title?: string | null
          description?: string | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          generic_attributes?: Record<string, any> | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          portfolio_id?: string
          staff_id?: string
          vendor_id?: string
          portfolio_type?: string
          title?: string | null
          description?: string | null
          image_urls?: string[] | null
          video_urls?: string[] | null
          generic_attributes?: Record<string, any> | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_portfolios_staff_id_fkey"
            columns: ["staff_id"]
            referencedRelation: "vendor_staff"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_portfolios_vendor_id_fkey"
            columns: ["vendor_id"]
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          }
        ]
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          is_complete: boolean | null
          priority: string | null
          status: string
          task_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          priority?: string | null
          status?: string
          task_id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          is_complete?: boolean | null
          priority?: string | null
          status?: string
          task_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date_time: string
          event_id: string
          event_name: string
          location: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date_time: string
          event_id?: string
          event_name: string
          location?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date_time?: string
          event_id?: string
          event_name?: string
          location?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_shortlisted_vendors: {
        Row: {
          booked_date: string | null
          contact_info: string | null
          created_at: string | null
          estimated_cost: number | null
          linked_vendor_id: string | null
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string
          user_vendor_id: string
          vendor_category: string
          vendor_name: string
        }
        Insert: {
          booked_date?: string | null
          contact_info?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          linked_vendor_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          user_vendor_id?: string
          vendor_category: string
          vendor_name: string
        }
        Update: {
          booked_date?: string | null
          contact_info?: string | null
          created_at?: string | null
          estimated_cost?: number | null
          linked_vendor_id?: string | null
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          user_vendor_id?: string
          vendor_category?: string
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_shortlisted_vendors_linked_vendor_id_fkey"
            columns: ["linked_vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["vendor_id"]
          },
          {
            foreignKeyName: "user_shortlisted_vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
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
          wedding_date: string | null
          wedding_location: string | null
          wedding_tradition: string | null
          user_type: string // Add user_type column
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          email: string
          preferences?: Json | null
          supabase_auth_uid: string
          updated_at?: string | null
          user_id?: string
          wedding_date?: string | null
          wedding_location?: string | null
          wedding_tradition?: string | null
          user_type?: string // Add user_type column
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          email?: string
          preferences?: Json | null
          supabase_auth_uid?: string
          updated_at?: string | null
          user_id?: string
          wedding_date?: string | null
          wedding_location?: string | null
          wedding_tradition?: string | null
          user_type?: string // Add user_type column
        }
        Relationships: []
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
      vendor_services: {
        Row: {
          base_price: number | null
          created_at: string | null
          customizability_details: string | null
          description: string | null
          is_active: boolean | null
          is_in_house: boolean | null
          is_negotiable: boolean | null
          max_capacity: number | null
          min_capacity: number | null
          portfolio_image_urls: string[] | null
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
          customizability_details?: string | null
          description?: string | null
          is_active?: boolean | null
          is_in_house?: boolean | null
          is_negotiable?: boolean | null
          max_capacity?: number | null
          min_capacity?: number | null
          portfolio_image_urls?: string[] | null
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
          customizability_details?: string | null
          description?: string | null
          is_active?: boolean | null
          is_in_house?: boolean | null
          is_negotiable?: boolean | null
          max_capacity?: number | null
          min_capacity?: number | null
          portfolio_image_urls?: string[] | null
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
          booking_id: string
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
          booking_id: string
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
          booking_id?: string
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
            foreignKeyName: "vendor_tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["booking_id"]
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
          is_active: boolean | null
          is_verified: boolean | null
          phone_number: string | null
          portfolio_image_urls: string[] | null
          pricing_range: Json | null
          rating: number | null
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
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number?: string | null
          portfolio_image_urls?: string[] | null
          pricing_range?: Json | null
          rating?: number | null
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
          is_active?: boolean | null
          is_verified?: boolean | null
          phone_number?: string | null
          portfolio_image_urls?: string[] | null
          pricing_range?: Json | null
          rating?: number | null
          supabase_auth_uid?: string | null
          updated_at?: string | null
          vendor_category?: string
          vendor_id?: string
          vendor_name?: string
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
