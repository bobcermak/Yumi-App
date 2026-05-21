import { CameraModal } from "@/components";
import { useMagicScan } from "@/lib/hooks/useMagicScan";
import { useRouter } from "expo-router";

const MagicScan = () => {
  const router = useRouter();
  const { isProcessing, capturedUri, pendingPhoto, handleBarcodeScanned, handleCapture, handleConfirm, handleRetake } = useMagicScan();

  return (
    <CameraModal
      visible={true}
      onClose={() => router.back()}
      mode="magic"
      onBarcodeScanned={handleBarcodeScanned}
      onCapture={handleCapture}
      isProcessing={isProcessing}
      capturedImageUri={capturedUri}
      pendingPhotoUri={pendingPhoto?.uri ?? null}
      onConfirm={handleConfirm}
      onRetake={handleRetake}
      title="Magic Scan"
      overlayText="Scan barcode or take a photo"
      asModal={false}
    />
  );
};

export default MagicScan;
