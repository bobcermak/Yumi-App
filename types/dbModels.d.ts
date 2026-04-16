type ClubRole = 'admin' | 'member' | string;
type FriendStatus = 'pending' | 'accepted' | 'blocked' | string;
type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | string;

type Profile = {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_premium?: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  daily_calorie_limit?: number;
  daily_water_limit?: number;
  current_weight?: number;
  goal_weight?: number;
  streak_count?: number;
  total_rating?: number;
  last_log_date?: string;
  created_at?: string;
};
type AIRewind = {
  id: string;
  user_id?: string;
  summary_text: string;
  period_start?: string;
  period_end?: string;
  created_at?: string;
};
type Club = {
  id: string;
  name: string;
  description?: string;
  cover_url?: string;
  is_private?: boolean;
  creator_id?: string;
  created_at?: string;
  current_streak?: number;
  member_count?: number;
};
type ClubMember = {
  club_id: string;
  user_id: string;
  role?: ClubRole;
  joined_at?: string;
};
type Food = {
  id: string;
  created_by?: string;
  name: string;
  brand?: string;
  calories_per_100g: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  image_url?: string;
  barcode?: string;
  is_public?: boolean;
  created_at?: string;
  log_count?: number;
};
type Friendship = {
  id: string;
  user_id: string;
  friend_id?: string;
  status?: FriendStatus;
  created_at?: string;
};
type MealLog = {
  id: string;
  user_id: string;
  name: string;
  image_url?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  type: MealType;
  rating?: number;
  logged_at?: string;
  is_temporary?: boolean;
};
type MealIngredient = {
  id: string;
  meal_log_id?: string;
  food_id?: string;
  name: string;
  amount_g: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
};
type Poke = {
  id: string;
  sender_id?: string;
  receiver_id?: string;
  created_at?: string;
};
type ProgressPhoto = {
  id: string;
  user_id?: string;
  image_url: string;
  weight?: number;
  rating?: number;
  created_at?: string;
};
type UserFavorite = {
  user_id: string;
  food_id: string;
  created_at?: string;
};