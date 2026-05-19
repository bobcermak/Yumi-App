import { CameraModal } from "@/components";
import { useMagicScan } from "@/lib/hooks/useMagicScan";
import { useRouter } from "expo-router";

const MagicScan = () => {
  //Router
  const router = useRouter();
  //Hooks
  const { isProcessing, capturedUri, handleBarcodeScanned, handleCapture } = useMagicScan();

  return (
    <CameraModal
      visible={true}
      onClose={() => router.back()}
      mode="magic"
      onBarcodeScanned={handleBarcodeScanned}
      onCapture={handleCapture}
      isProcessing={isProcessing}
      capturedImageUri={capturedUri}
      title="Magic Scan"
      overlayText="Scan barcode or take a photo"
      asModal={false}
    />
  );
};
export default MagicScan;