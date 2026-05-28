export const DEFAULTS_EN: Record<string, string[]> = {
  fruits: ["Banana", "Apple", "Strawberry", "Watermelon"],
  vegetables: ["Broccoli", "Carrot", "Tomato", "Cucumber"],
};
export const DEFAULTS_CS: Record<string, string[]> = {
  fruits: ["Banán", "Jablko", "Jahoda", "Meloun"],
  vegetables: ["Brokolice", "Mrkev", "Rajče", "Okurka"],
};
export const HARDCODED_IMAGES: Record<string, string> = {
  "Banana": "banana fruit fresh",
  "Apple": "red apple",
  "Strawberry": "strawberry fruit",
  "Watermelon": "watermelon fruit",
  "Broccoli": "broccoli vegetable",
  "Carrot": "fresh orange carrot",
  "Tomato": "red tomato",
  "Cucumber": "cucumber vegetable",
};
export const STATIC_FOOD_NAMES = new Set([
  "Banana", "Apple", "Strawberry", "Watermelon",
  "Broccoli", "Carrot", "Tomato", "Cucumber",
]);
export const BRAND_KEYWORDS: string[] = [
  "mcdonald", "mcdonalds", "mc donalds",
  "kfc", "burger king", "subway", "starbucks", 
  "costa coffee", "pepsi", "coca cola", "cocacola",
  "lays", "pringles", "milka", "nestle", "kinder",
  "kofola", "red bull", "monster", "hell"
];