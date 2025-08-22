// Types pour les repas
export interface FoodItem {
  name: string;
  quantity?: string;
  unit?: string;
  calories?: number;
  category?: string;
  confidence?: number; // Pour l'analyse IA
  nutritionalInfo?: {
    calories?: number;
    proteins?: number;
    carbs?: number;
    fats?: number;
  };
}

export interface MealData {
  id?: string;
  user_id?: string;
  type: string; // petit-dejeuner, dejeuner, diner, collation
  datetime: string;
  foods: FoodItem[];
  notes?: string;
  satisfaction?: number; // 1-5
  hunger_level?: number; // 1-5
  photo_url?: string;
  ai_analysis?: string;
  ai_identified_foods?: string[]; // Aliments identifiés par l'IA
  ai_confidence?: number; // Confiance de l'IA (0-1)
  created_at?: string;
  updated_at?: string;
}

export interface MealRecommendation {
  id?: string;
  user_id?: string;
  meal_id?: string;
  category: string; // nutrition, variety, portion, timing
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  is_read: boolean;
  is_bookmarked: boolean;
  feedback?: "helpful" | "not_helpful" | "very_helpful";
  created_at?: string;
}
