import { Icon, Toast } from "@/components";
import { requestCameraAccess, takeCameraPhoto } from "@/lib/helpers/camera";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CaretLeft, Lightning, LightningSlash } from "phosphor-react-native";
import { useEffect, useRef, useState, type FC } from "react";
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MagicParticles from "./MagicParticles";

type CameraModalProps = {
  visible: boolean,
  onClose: () => void,
  mode: "barcode" | "photo" | "magic",
  onBarcodeScanned?: (data: string) => void,
  onCapture?: (uri: string, base64?: string) => void,
  isProcessing?: boolean,
  capturedImageUri?: string | null,
  title?: string,
  overlayText?: string,
  asModal?: boolean
};
const CameraModal: FC<CameraModalProps> = ({ visible, onClose, mode, onBarcodeScanned, onCapture, isProcessing = false, capturedImageUri, title, overlayText, asModal = true }) => {
  const insets = useSafeAreaInsets();
  const { toast } = useIndexContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<boolean>(false);
  const scannedRef = useRef<boolean>(false);
  const cameraRef = useRef<CameraView>(null);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if ((mode === "barcode" || mode === "magic") && onBarcodeScanned && !scannedRef.current) {
      scannedRef.current = true;
      onBarcodeScanned(data);
    }
  };
  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
      requestCameraAccess(permission, requestPermission, onClose);
    }
  }, [visible, permission, requestPermission, onClose]);
  if (!permission?.granted && visible) return null;
  const showCapturedPreview = mode === "magic" && isProcessing && !!capturedImageUri;
  const bottomText = overlayText ?? (mode === "barcode" ? "Align barcode within the frame" : "Center item in the frame");
  const content = (
    <View className="flex-1 bg-black">
        {showCapturedPreview ? (
          <Image
            source={{ uri: capturedImageUri! }}
            style={[StyleSheet.absoluteFill, { opacity: 0.6 }]}
            resizeMode="cover"
          />
        ) : (
          <CameraView
            ref={cameraRef}
            onBarcodeScanned={mode !== "photo" ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={mode !== "photo" ? { barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] } : undefined}
            enableTorch={torch}
            style={StyleSheet.absoluteFill}
          />
        )}
        {mode === "barcode" && (
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            <View className="w-72 h-48 border-2 border-yellow/50 rounded-[20px] items-center justify-center">
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-yellow rounded-tl-[20px]" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-yellow rounded-tr-[20px]" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-yellow rounded-bl-[20px]" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-yellow rounded-br-[20px]" />
              {isProcessing && <ActivityIndicator size="large" color="#C5E384" />}
            </View>
          </View>
        )}
        {mode === "photo" && (
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            <View className="w-80 h-80 border-2 border-white/20 rounded-[40px] items-center justify-center">
              {isProcessing && <ActivityIndicator size="large" color="#C5E384" />}
            </View>
          </View>
        )}
        {mode === "magic" && isProcessing && (
          <View className="absolute inset-0 pointer-events-none">
            <MagicParticles />
            <View className="absolute inset-0 items-center justify-center">
              <ActivityIndicator size="large" color="#C5E384" />
            </View>
          </View>
        )}
        <View
          style={{ paddingTop: insets.top + 12 }}
          className="absolute top-0 left-0 right-0 flex-row justify-between px-6 items-center"
        >
          <Icon className="w-12 h-12 bg-black/50 border border-white/10" onPress={onClose} shadowColor="#000000">
            <CaretLeft size={24} color="white" />
          </Icon>
          {title && <Text className="font-nunito-800 text-xl text-white">{title}</Text>}
          <Icon
            className={`w-12 h-12 border border-white/10 ${torch ? "bg-yellow" : "bg-black/50"}`}
            onPress={() => setTorch(!torch)}
            shadowColor={torch ? "#C5E384" : "#000000"}
          >
            {torch ? <Lightning size={24} color="#1D1D1D" weight="fill" /> : <LightningSlash size={24} color="white" />}
          </Icon>
        </View>
        {mode !== "barcode" && (
          <View
            style={{ paddingBottom: insets.bottom + 32 }}
            className="absolute bottom-0 left-0 right-0 items-center gap-4"
          >
            <Text className="text-white font-nunito-600 bg-black/50 px-4 py-2 rounded-[20px] overflow-hidden border border-white/10">
              {bottomText}
            </Text>
            <TouchableOpacity
              onPress={() => onCapture && takeCameraPhoto(cameraRef, mode, onCapture)}
              disabled={isProcessing}
              className="w-20 h-20 items-center justify-center"
            >
              <View className="w-16 h-16 rounded-full border-4 border-white items-center justify-center">
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-white" />
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
        {mode === "barcode" && (
          <View className="absolute bottom-0 left-0 right-0 items-center" style={{ paddingBottom: insets.bottom + 40 }}>
            <Text className="text-white font-nunito-600 bg-black/50 px-4 py-2 rounded-[20px] overflow-hidden border border-white/10">
              {bottomText}
            </Text>
          </View>
        )}
        <Toast toast={toast} />
      </View>
  );
  if (!asModal) return content;
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      {content}
    </Modal>
  );
};
export default CameraModal;