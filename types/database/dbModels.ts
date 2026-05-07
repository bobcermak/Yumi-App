type Tables<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Row"];
type TablesInsert<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Insert"];
type TablesUpdate<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Update"];
type Enums<T extends keyof import("./supabase.types").Database["public"]["Enums"]> = import("./supabase.types").Database["public"]["Enums"][T];

export type ClubRole = Enums<"club_role">;
export type FriendStatus = Enums<"friend_status">;
export type MealType = Enums<"meal_type">;

export type Profile = Tables<"profiles">;
export type ProfileInsert = TablesInsert<"profiles">;
export type ProfileUpdate = TablesUpdate<"profiles">;

export type AIRewind = Tables<"ai_rewinds">;
export type AIRewindInsert = TablesInsert<"ai_rewinds">;

export type Club = Tables<"clubs">;
export type ClubInsert = TablesInsert<"clubs">;
export type ClubUpdate = TablesUpdate<"clubs">;

export type ClubMember = Tables<"club_members">;
export type ClubMemberInsert = TablesInsert<"club_members">;

export type Food = Tables<"foods">;
export type FoodInsert = TablesInsert<"foods">;
export type FoodUpdate = TablesUpdate<"foods">;

export type Friendship = Tables<"friendships">;
export type FriendshipInsert = TablesInsert<"friendships">;
export type FriendshipUpdate = TablesUpdate<"friendships">;

export type MealLog = Tables<"meal_logs">;
export type MealLogInsert = TablesInsert<"meal_logs">;
export type MealLogUpdate = TablesUpdate<"meal_logs">;

export type MealIngredient = Tables<"meal_ingredients">;
export type MealIngredientInsert = TablesInsert<"meal_ingredients">;

export type Poke = Tables<"pokes">;
export type PokeInsert = TablesInsert<"pokes">;

export type ProgressPhoto = Tables<"progress_photos">;
export type ProgressPhotoInsert = TablesInsert<"progress_photos">;

export type UserFavorite = Tables<"user_favorites">;
export type UserFavoriteInsert = TablesInsert<"user_favorites">;

export type DailyLog = Tables<"daily_logs">;
export type DailyLogInsert = TablesInsert<"daily_logs">;
export type DailyLogUpdate = TablesUpdate<"daily_logs">;