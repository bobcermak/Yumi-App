import { CameraModal } from "@/components";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { searchFoodByBarcode } from "@/lib/services/food-search/barcode";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

const MagicScan = () => {
  const router = useRouter();
  const { showToast } = useIndexContext();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBarcodeScanned = async (data: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const result = await searchFoodByBarcode(data);
      if (result) {
        router.replace({
          pathname: "/search-item/[id]",
          params: { id: result.id, item: JSON.stringify(result) },
        });
      } else {
        showToast("Product not found 🥑", undefined, "error");
        setIsProcessing(false);
      }
    } catch {
      showToast("Something went wrong 🥑", undefined, "error");
      setIsProcessing(false);
    }
  };

  const handleCapture = (uri: string) => {
    router.replace({
      pathname: "/magic-scan/photo",
      params: { photoUri: uri },
    });
  };

  return (
    <View className="flex-1 bg-black">
      <CameraModal
        visible={true}
        onClose={() => router.back()}
        mode="magic"
        onBarcodeScanned={handleBarcodeScanned}
        onCapture={handleCapture}
        isProcessing={isProcessing}
        title="Magic Scan"
        overlayText="Scan barcode or take a photo"
      />
    </View>
  );
};
export default MagicScan;
