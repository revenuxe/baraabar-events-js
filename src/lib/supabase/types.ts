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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          line1: string
          line2: string | null
          phone: string
          pincode: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1: string
          line2?: string | null
          phone: string
          pincode: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          line1?: string
          line2?: string | null
          phone?: string
          pincode?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_drafts: {
        Row: {
          category_slug: string | null
          created_at: string
          data: Json
          garment_label: string | null
          id: string
          step: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          data?: Json
          garment_label?: string | null
          id?: string
          step?: number
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          data?: Json
          garment_label?: string | null
          id?: string
          step?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      booking_items: {
        Row: {
          booking_id: string
          category_slug: string | null
          created_at: string
          estimated_price_max: number | null
          estimated_price_min: number | null
          garment_label: string
          id: string
          measurement_snapshot: Json | null
          quantity: number
          reference_images: string[]
          sort_order: number
          style_label: string | null
        }
        Insert: {
          booking_id: string
          category_slug?: string | null
          created_at?: string
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          garment_label: string
          id?: string
          measurement_snapshot?: Json | null
          quantity?: number
          reference_images?: string[]
          sort_order?: number
          style_label?: string | null
        }
        Update: {
          booking_id?: string
          category_slug?: string | null
          created_at?: string
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          garment_label?: string
          id?: string
          measurement_snapshot?: Json | null
          quantity?: number
          reference_images?: string[]
          sort_order?: number
          style_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_references: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_references_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_status_events: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          note: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          note?: string | null
          status: Database["public"]["Enums"]["booking_status"]
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          category_id: string | null
          category_slug: string | null
          contact_phone: string | null
          created_at: string
          delivery_address_id: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          fabric_label: string | null
          fabric_type_id: string | null
          garment_label: string | null
          garment_type_id: string | null
          id: string
          measurement_mode:
            | Database["public"]["Enums"]["measurement_mode"]
            | null
          measurement_profile_id: string | null
          measurement_snapshot: Json | null
          notes: string | null
          occasion_id: string | null
          order_number: string
          pickup_address_id: string | null
          pickup_date: string | null
          pickup_window: string | null
          quantity: number
          reference_images: string[]
          status: Database["public"]["Enums"]["booking_status"]
          style_label: string | null
          style_preset_id: string | null
          subcategory_id: string | null
          updated_at: string
          user_id: string
          wants_stylist_call: boolean
        }
        Insert: {
          category_id?: string | null
          category_slug?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address_id?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          fabric_label?: string | null
          fabric_type_id?: string | null
          garment_label?: string | null
          garment_type_id?: string | null
          id?: string
          measurement_mode?:
            | Database["public"]["Enums"]["measurement_mode"]
            | null
          measurement_profile_id?: string | null
          measurement_snapshot?: Json | null
          notes?: string | null
          occasion_id?: string | null
          order_number?: string
          pickup_address_id?: string | null
          pickup_date?: string | null
          pickup_window?: string | null
          quantity?: number
          reference_images?: string[]
          status?: Database["public"]["Enums"]["booking_status"]
          style_label?: string | null
          style_preset_id?: string | null
          subcategory_id?: string | null
          updated_at?: string
          user_id: string
          wants_stylist_call?: boolean
        }
        Update: {
          category_id?: string | null
          category_slug?: string | null
          contact_phone?: string | null
          created_at?: string
          delivery_address_id?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          fabric_label?: string | null
          fabric_type_id?: string | null
          garment_label?: string | null
          garment_type_id?: string | null
          id?: string
          measurement_mode?:
            | Database["public"]["Enums"]["measurement_mode"]
            | null
          measurement_profile_id?: string | null
          measurement_snapshot?: Json | null
          notes?: string | null
          occasion_id?: string | null
          order_number?: string
          pickup_address_id?: string | null
          pickup_date?: string | null
          pickup_window?: string | null
          quantity?: number
          reference_images?: string[]
          status?: Database["public"]["Enums"]["booking_status"]
          style_label?: string | null
          style_preset_id?: string | null
          subcategory_id?: string | null
          updated_at?: string
          user_id?: string
          wants_stylist_call?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bookings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_fabric_type_id_fkey"
            columns: ["fabric_type_id"]
            isOneToOne: false
            referencedRelation: "fabric_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_garment_type_id_fkey"
            columns: ["garment_type_id"]
            isOneToOne: false
            referencedRelation: "garment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_measurement_profile_id_fkey"
            columns: ["measurement_profile_id"]
            isOneToOne: false
            referencedRelation: "measurement_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_occasion_id_fkey"
            columns: ["occasion_id"]
            isOneToOne: false
            referencedRelation: "occasions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_pickup_address_id_fkey"
            columns: ["pickup_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_style_preset_id_fkey"
            columns: ["style_preset_id"]
            isOneToOne: false
            referencedRelation: "style_presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          accent: string | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          accent?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          accent?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fabric_types: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      garment_types: {
        Row: {
          base_price_max: number | null
          base_price_min: number | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          measurement_fields: string[]
          name: string
          slug: string
          sort_order: number
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          base_price_max?: number | null
          base_price_min?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          measurement_fields?: string[]
          name: string
          slug: string
          sort_order?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          base_price_max?: number | null
          base_price_min?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          measurement_fields?: string[]
          name?: string
          slug?: string
          sort_order?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "garment_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_types_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      measurement_profiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          unit: string
          updated_at: string
          user_id: string
          values: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          unit?: string
          updated_at?: string
          user_id: string
          values?: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          unit?: string
          updated_at?: string
          user_id?: string
          values?: Json
        }
        Relationships: []
      }
      occasions: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string
          id: string
          is_published: boolean
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      style_presets: {
        Row: {
          created_at: string
          description: string | null
          garment_type_id: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          garment_type_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          garment_type_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "style_presets_garment_type_id_fkey"
            columns: ["garment_type_id"]
            isOneToOne: false
            referencedRelation: "garment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          tagline: string | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          garment_type_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          garment_type_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          garment_type_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_garment_type_id_fkey"
            columns: ["garment_type_id"]
            isOneToOne: false
            referencedRelation: "garment_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "tailor" | "customer"
      booking_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "picked_up"
        | "measuring"
        | "stitching"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      measurement_mode: "doorstep" | "self" | "saved" | "sample"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "tailor", "customer"],
      booking_status: [
        "draft",
        "pending",
        "confirmed",
        "picked_up",
        "measuring",
        "stitching",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      measurement_mode: ["doorstep", "self", "saved", "sample"],
    },
  },
} as const
