export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: "patient" | "doctor" | "admin";
          created_at: string;
          updated_at: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          avatar_url?: string;
          is_active?: boolean;
          medical_license?: string;
          specialization?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: "patient" | "doctor" | "admin";
          created_at?: string;
          updated_at?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          avatar_url?: string;
          is_active?: boolean;
          medical_license?: string;
          specialization?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: "patient" | "doctor" | "admin";
          created_at?: string;
          updated_at?: string;
          first_name?: string;
          last_name?: string;
          phone?: string;
          date_of_birth?: string;
          avatar_url?: string;
          is_active?: boolean;
          medical_license?: string;
          specialization?: string;
          emergency_contact_name?: string;
          emergency_contact_phone?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio?: string;
          address?: string;
          city?: string;
          postal_code?: string;
          country?: string;
          language_preference?: string;
          timezone?: string;
          preferences?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string;
          address?: string;
          city?: string;
          postal_code?: string;
          country?: string;
          language_preference?: string;
          timezone?: string;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          address?: string;
          city?: string;
          postal_code?: string;
          country?: string;
          language_preference?: string;
          timezone?: string;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_data: {
        Row: {
          id: string;
          user_id: string;
          data_type:
            | "mood"
            | "sleep"
            | "activity"
            | "symptoms"
            | "weight"
            | "blood_pressure"
            | "heart_rate"
            | "temperature";
          value?: number;
          unit?: string;
          notes?: string;
          recorded_at: string;
          created_at: string;
          metadata?: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          data_type:
            | "mood"
            | "sleep"
            | "activity"
            | "symptoms"
            | "weight"
            | "blood_pressure"
            | "heart_rate"
            | "temperature";
          value?: number;
          unit?: string;
          notes?: string;
          recorded_at?: string;
          created_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          data_type?:
            | "mood"
            | "sleep"
            | "activity"
            | "symptoms"
            | "weight"
            | "blood_pressure"
            | "heart_rate"
            | "temperature";
          value?: number;
          unit?: string;
          notes?: string;
          recorded_at?: string;
          created_at?: string;
          metadata?: any;
        };
      };
      health_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          target_value?: number;
          current_value?: number;
          unit?: string;
          status: "active" | "completed" | "paused" | "cancelled";
          start_date?: string;
          target_date?: string;
          completed_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          target_value?: number;
          current_value?: number;
          unit?: string;
          status?: "active" | "completed" | "paused" | "cancelled";
          start_date?: string;
          target_date?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target_value?: number;
          current_value?: number;
          unit?: string;
          status?: "active" | "completed" | "paused" | "cancelled";
          start_date?: string;
          target_date?: string;
          completed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      consents: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          status: "pending" | "granted" | "revoked" | "expired";
          granted_at?: string;
          revoked_at?: string;
          expires_at?: string;
          created_at: string;
          updated_at: string;
          notes?: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          status?: "pending" | "granted" | "revoked" | "expired";
          granted_at?: string;
          revoked_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          status?: "pending" | "granted" | "revoked" | "expired";
          granted_at?: string;
          revoked_at?: string;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
          notes?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "other";
          date: string;
          time: string;
          is_photo_based: boolean;
          photo_url?: string;
          photo_thumbnail_url?: string;
          manual_foods?: any; // JSON array of manually entered foods
          ai_analysis?: any; // JSON object with AI analysis results
          total_calories?: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "other";
          date: string;
          time: string;
          is_photo_based: boolean;
          photo_url?: string;
          photo_thumbnail_url?: string;
          manual_foods?: any;
          ai_analysis?: any;
          total_calories?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | "other";
          date?: string;
          time?: string;
          is_photo_based?: boolean;
          photo_url?: string;
          photo_thumbnail_url?: string;
          manual_foods?: any;
          ai_analysis?: any;
          total_calories?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_recommendations: {
        Row: {
          id: string;
          user_id: string;
          meal_id?: string;
          recommendation_type:
            | "general"
            | "meal_specific"
            | "weekly"
            | "monthly";
          title: string;
          content: string;
          priority: "low" | "medium" | "high";
          is_read: boolean;
          generated_by: "ai" | "rule_based" | "doctor";
          expires_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_id?: string;
          recommendation_type?:
            | "general"
            | "meal_specific"
            | "weekly"
            | "monthly";
          title: string;
          content: string;
          priority?: "low" | "medium" | "high";
          is_read?: boolean;
          generated_by?: "ai" | "rule_based" | "doctor";
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_id?: string;
          recommendation_type?:
            | "general"
            | "meal_specific"
            | "weekly"
            | "monthly";
          title?: string;
          content?: string;
          priority?: "low" | "medium" | "high";
          is_read?: boolean;
          generated_by?: "ai" | "rule_based" | "doctor";
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_dietary_preferences: {
        Row: {
          id: string;
          user_id: string;
          dietary_restrictions?: string[]; // ['vegetarian', 'vegan', 'gluten_free', etc.]
          allergies?: string[];
          health_goals?: string[]; // ['weight_loss', 'muscle_gain', 'maintenance', etc.]
          daily_calorie_target?: number;
          preferred_meal_times?: any; // JSON object with preferred times
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dietary_restrictions?: string[];
          allergies?: string[];
          health_goals?: string[];
          daily_calorie_target?: number;
          preferred_meal_times?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dietary_restrictions?: string[];
          allergies?: string[];
          health_goals?: string[];
          daily_calorie_target?: number;
          preferred_meal_times?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "patient" | "doctor" | "admin";
      consent_status: "pending" | "granted" | "revoked" | "expired";
      health_data_type:
        | "mood"
        | "sleep"
        | "activity"
        | "symptoms"
        | "weight"
        | "blood_pressure"
        | "heart_rate"
        | "temperature";
      goal_status: "active" | "completed" | "paused" | "cancelled";
      meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "other";
      recommendation_type: "general" | "meal_specific" | "weekly" | "monthly";
      priority_level: "low" | "medium" | "high";
    };
  };
}
