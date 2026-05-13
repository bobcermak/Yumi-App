import { searchExternalFoods } from './search';

export const globalSearchCache = new Map<string, any>();
export const preloadStaticProduce = async () => {
    if (!globalSearchCache.has("-fruits-raw-quick")) {
        searchExternalFoods({ query: "", category: "fruits", foodType: "raw" })
            .then(res => {
                if (res.length > 0) globalSearchCache.set("-fruits-raw-quick", { results: res, source: "usda" });
            })
            .catch(() => {});
    }
    if (!globalSearchCache.has("-vegetables-raw-quick")) {
        searchExternalFoods({ query: "", category: "vegetables", foodType: "raw" })
            .then(res => {
                if (res.length > 0) globalSearchCache.set("-vegetables-raw-quick", { results: res, source: "usda" });
            })
            .catch(() => {});
    }
};