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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ai_rewinds: {
        Row: {
          created_at: string | null
          id: string
          period_end: string | null
          period_start: string | null
          summary_text: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          summary_text: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          period_end?: string | null
          period_start?: string | null
          summary_text?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_rewinds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          club_id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["club_role"] | null
          user_id: string
        }
        Insert: {
          club_id: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"] | null
          user_id: string
        }
        Update: {
          club_id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["club_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          cover_url: string | null
          created_at: string | null
          creator_id: string | null
          current_streak: number | null
          description: string | null
          id: string
          is_private: boolean | null
          member_count: number | null
          name: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_streak?: number | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string | null
          creator_id?: string | null
          current_streak?: number | null
          description?: string | null
          id?: string
          is_private?: boolean | null
          member_count?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      foods: {
        Row: {
          barcode: string | null
          brand: string | null
          calories_per_100g: number
          carbs_per_100g: number | null
          created_at: string | null
          created_by: string | null
          fat_per_100g: number | null
          id: string
          image_url: string | null
          is_public: boolean | null
          log_count: number | null
          name: string
          protein_per_100g: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g: number
          carbs_per_100g?: number | null
          created_at?: string | null
          created_by?: string | null
          fat_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          log_count?: number | null
          name: string
          protein_per_100g?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          calories_per_100g?: number
          carbs_per_100g?: number | null
          created_at?: string | null
          created_by?: string | null
          fat_per_100g?: number | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          log_count?: number | null
          name?: string
          protein_per_100g?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "foods_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string | null
          friend_id: string
          id: string
          status: Database["public"]["Enums"]["friend_status"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          friend_id: string
          id?: string
          status?: Database["public"]["Enums"]["friend_status"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          friend_id?: string
          id?: string
          status?: Database["public"]["Enums"]["friend_status"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_ingredients: {
        Row: {
          amount_g: number
          calories: number
          carbs: number | null
          fat: number | null
          food_id: string | null
          id: string
          meal_log_id: string | null
          name: string
          protein: number | null
        }
        Insert: {
          amount_g: number
          calories: number
          carbs?: number | null
          fat?: number | null
          food_id?: string | null
          id?: string
          meal_log_id?: string | null
          name: string
          protein?: number | null
        }
        Update: {
          amount_g?: number
          calories?: number
          carbs?: number | null
          fat?: number | null
          food_id?: string | null
          id?: string
          meal_log_id?: string | null
          name?: string
          protein?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_ingredients_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meal_ingredients_meal_log_id_fkey"
            columns: ["meal_log_id"]
            isOneToOne: false
            referencedRelation: "meal_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_logs: {
        Row: {
          id: string
          image_url: string | null
          is_temporary: boolean | null
          logged_at: string | null
          name: string
          rating: number | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          type: Database["public"]["Enums"]["meal_type"]
          user_id: string
        }
        Insert: {
          id?: string
          image_url?: string | null
          is_temporary?: boolean | null
          logged_at?: string | null
          name: string
          rating?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          type: Database["public"]["Enums"]["meal_type"]
          user_id: string
        }
        Update: {
          id?: string
          image_url?: string | null
          is_temporary?: boolean | null
          logged_at?: string | null
          name?: string
          rating?: number | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          type?: Database["public"]["Enums"]["meal_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pokes: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string | null
          sender_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pokes_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pokes_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_weight: number | null
          daily_calorie_limit: number | null
          daily_water_limit: number | null
          full_name: string | null
          goal_weight: number | null
          id: string
          is_premium: boolean | null
          last_log_date: string | null
          start_date: string | null
          streak_count: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          target_date: string | null
          total_rating: number | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_limit?: number | null
          daily_water_limit?: number | null
          full_name?: string | null
          goal_weight?: number | null
          id: string
          is_premium?: boolean | null
          last_log_date?: string | null
          start_date?: string | null
          streak_count?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          target_date?: string | null
          total_rating?: number | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          daily_calorie_limit?: number | null
          daily_water_limit?: number | null
          full_name?: string | null
          goal_weight?: number | null
          id?: string
          is_premium?: boolean | null
          last_log_date?: string | null
          start_date?: string | null
          streak_count?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          target_date?: string | null
          total_rating?: number | null
          username?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          rating: number | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          rating?: number | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          rating?: number | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string | null
          food_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          food_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          food_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_food_id_fkey"
            columns: ["food_id"]
            isOneToOne: false
            referencedRelation: "foods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_if_user_exists: { Args: { lookup_email: string }; Returns: boolean }
      delete_old_ai_scans: { Args: never; Returns: undefined }
      delete_old_meal_logs: { Args: never; Returns: undefined }
    }
    Enums: {
      club_role: "admin" | "member"
      friend_status: "pending" | "accepted" | "blocked"
      meal_type:
        | "breakfast"
        | "morning_snack"
        | "lunch"
        | "afternoon_snack"
        | "dinner"
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
    Enums: {
      club_role: ["admin", "member"],
      friend_status: ["pending", "accepted", "blocked"],
      meal_type: [
        "breakfast",
        "morning_snack",
        "lunch",
        "afternoon_snack",
        "dinner",
      ],
    },
  },
} as const
