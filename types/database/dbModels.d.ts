type Tables<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Row"];
type TablesInsert<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Insert"];
type TablesUpdate<T extends keyof import("./supabase.types").Database["public"]["Tables"]> = import("./supabase.types").Database["public"]["Tables"][T]["Update"];
type Enums<T extends keyof import("./supabase.types").Database["public"]["Enums"]> = import("./supabase.types").Database["public"]["Enums"][T];

type ClubRole = Enums<"club_role">;
type FriendStatus = Enums<"friend_status">;
type MealType = Enums<"meal_type">;

type Profile = Tables<"profiles">;
type ProfileInsert = TablesInsert<"profiles">;
type ProfileUpdate = TablesUpdate<"profiles">;

type AIRewind = Tables<"ai_rewinds">;
type AIRewindInsert = TablesInsert<"ai_rewinds">;

type Club = Tables<"clubs">;
type ClubInsert = TablesInsert<"clubs">;
type ClubUpdate = TablesUpdate<"clubs">;

type ClubMember = Tables<"club_members">;
type ClubMemberInsert = TablesInsert<"club_members">;

type Food = Tables<"foods">;
type FoodInsert = TablesInsert<"foods">;
type FoodUpdate = TablesUpdate<"foods">;

type Friendship = Tables<"friendships">;
type FriendshipInsert = TablesInsert<"friendships">;
type FriendshipUpdate = TablesUpdate<"friendships">;

type MealLog = Tables<"meal_logs">;
type MealLogInsert = TablesInsert<"meal_logs">;
type MealLogUpdate = TablesUpdate<"meal_logs">;

type MealIngredient = Tables<"meal_ingredients">;
type MealIngredientInsert = TablesInsert<"meal_ingredients">;

type Poke = Tables<"pokes">;
type PokeInsert = TablesInsert<"pokes">;

type ProgressPhoto = Tables<"progress_photos">;
type ProgressPhotoInsert = TablesInsert<"progress_photos">;

type UserFavorite = Tables<"user_favorites">;
type UserFavoriteInsert = TablesInsert<"user_favorites">;