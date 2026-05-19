import { scanBarcode, scanPhoto } from "@/lib/helpers/magicScan";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { useRouter } from "expo-router";
import { useState } from "react";

export const useMagicScan = () => {
  const router = useRouter();
  const { showToast } = useIndexContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const ctx = {
    isProcessing,
    setIsProcessing,
    navigateToItem: (id: string, item: string) =>
      router.replace({ pathname: "/search-item/[id]", params: { id, item } }),
    navigateToMealLog: (scanResult: string) =>
      router.replace({ pathname: "/meal-log", params: { scanResult } }),
    navigateBack: () => router.back(),
    showToast,
  };

  return {
    isProcessing,
    capturedUri,
    handleBarcodeScanned: (data: string) => scanBarcode(data, ctx),
    handleCapture: (uri: string, base64?: string) => {
      setCapturedUri(uri);
      scanPhoto(uri, base64, ctx);
    },
  };
};
