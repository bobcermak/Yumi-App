import { searchExternalFoods } from './search';

export const globalSearchCache = new Map<string, any>();
export const preloadStaticProduce = async () => {
    if (!globalSearchCache.has("-fruits-raw")) {
        searchExternalFoods({ query: "", category: "fruits", foodType: "raw" })
            .then(res => {
                if (res.length > 0) globalSearchCache.set("-fruits-raw", { results: res, source: "usda" });
            })
            .catch(() => {});
    }
    if (!globalSearchCache.has("-vegetables-raw")) {
        searchExternalFoods({ query: "", category: "vegetables", foodType: "raw" })
            .then(res => {
                if (res.length > 0) globalSearchCache.set("-vegetables-raw", { results: res, source: "usda" });
            })
            .catch(() => {});
    }
};