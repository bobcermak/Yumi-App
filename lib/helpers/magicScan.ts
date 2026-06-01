import { searchFoodByBarcode } from "@/lib/services/food-search/barcode";
import { analyzeFood, NotFoodError } from "@/lib/services/food-search/magic-scan";
import type { ToastType } from "@/types/indexContextType";

type ScanContext = {
  isProcessing: boolean,
  setIsProcessing: (v: boolean) => void,
  navigateToItem: (id: string, item: string) => void,
  navigateToMealLog: (scanResult: string, photoUri?: string) => void,
  navigateBack: () => void,
  showToast: (msg: string, dateStr?: string, type?: ToastType["type"]) => void
};
export const scanBarcode = async (data: string, ctx: ScanContext): Promise<void> => {
  if (ctx.isProcessing) return;
  ctx.setIsProcessing(true);
  try {
    const result = await searchFoodByBarcode(data);
    if (result) {
      ctx.navigateToItem(result.id, JSON.stringify(result));
    } else {
      ctx.showToast("Product not found 🥑", undefined, "error");
      ctx.setIsProcessing(false);
    }
  } catch {
    ctx.showToast("Something went wrong 🥑", undefined, "error");
    ctx.setIsProcessing(false);
  }
}
export const scanPhoto = async (uri: string, base64: string | undefined, ctx: ScanContext, signal?: AbortSignal): Promise<void> => {
  if (ctx.isProcessing) return;
  if (!base64) {
    ctx.showToast("Photo capture failed, try again", undefined, "error");
    return;
  }
  ctx.setIsProcessing(true);
  try {
    const result = await analyzeFood(base64);
    if (signal?.aborted) return;
    ctx.navigateToMealLog(JSON.stringify(result), uri);
  } catch (err) {
    if (signal?.aborted) return;
    if (err instanceof NotFoodError) {
      ctx.showToast("That doesn't look like food", undefined, "error");
    } else {
      console.error("[MagicScan] Error:", err);
      ctx.showToast("Could not identify food, try again", undefined, "error");
    }
    ctx.setIsProcessing(false);
    ctx.navigateBack();
  }
}