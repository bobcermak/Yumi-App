import { Food } from "./database/dbModels";

export type FoodSearchSource = "openfoodfacts" | "usda";
export type FoodSearchResult = Partial<Food> & {
    id: string,
    source: FoodSearchSource
};