import { useState, useRef, useEffect, type FC } from "react";
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CaretLeft, Lightning, LightningSlash } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CameraModalProps = {
  visible: boolean,
  onClose: () => void,
  mode: 'barcode' | 'photo',
  onBarcodeScanned?: (data: string) => void,
  onCapture?: (uri: string) => void,
  isProcessing?: boolean,
  title?: string,
  overlayText?: string
};
const CameraModal: FC<CameraModalProps> = ({ visible, onClose, mode, onBarcodeScanned, onCapture, isProcessing = false, title, overlayText }) => {
  //Hooks
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  
  //Functions
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (mode === 'barcode' && onBarcodeScanned) {
      onBarcodeScanned(data);
    }
  };
  const capturePhoto = async () => {
    if (mode === 'photo' && cameraRef.current && onCapture && !isProcessing) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: false,
        });
        if (photo) {
          onCapture(photo.uri);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to capture photo.");
      }
    }
  };
  const handleOpen = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert("Permission Required", "Camera access is needed.");
        onClose();
      }
    }
  };
  useEffect(() => {
    if (visible) {
      handleOpen();
    }
  }, [visible]);
  if (!permission?.granted && visible) {
    return null;
  }
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          onBarcodeScanned={mode === 'barcode' ? handleBarcodeScanned : undefined}
          barcodeScannerSettings={mode === 'barcode' ? { barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] } : undefined}
          enableTorch={torch}
          style={StyleSheet.absoluteFill}
        />
        <View className="absolute inset-0 items-center justify-center pointer-events-none">
          {mode === 'barcode' ? (
            <View className="w-72 h-48 border-2 border-yellow/50 rounded-3xl items-center justify-center">
               <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow rounded-tl-xl" />
               <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow rounded-tr-xl" />
               <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow rounded-bl-xl" />
               <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow rounded-br-xl" />
               {isProcessing && <ActivityIndicator size="large" color="#C5E384" />}
            </View>
          ) : (
            <View className="w-80 h-80 border-2 border-white/20 rounded-[40px] items-center justify-center">
                {isProcessing && <ActivityIndicator size="large" color="#C5E384" />}
            </View>
          )}
          <Text className="text-white font-nunito-600 mt-6 bg-black/50 px-4 py-2 rounded-full overflow-hidden">
            {overlayText || (mode === 'barcode' ? "Align barcode within the frame" : "Center item in the frame")}
          </Text>
        </View>
        <View 
          style={{ paddingTop: insets.top + 12 }}
          className="absolute top-0 left-0 right-0 flex-row justify-between px-6 items-center"
        >
          <TouchableOpacity 
            className="w-12 h-12 bg-black/50 rounded-full items-center justify-center border border-white/10"
            onPress={onClose}
          >
            <CaretLeft size={24} color="white" />
          </TouchableOpacity>
          {title && <Text className="text-white font-nunito-800 text-xl">{title}</Text>}
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full items-center justify-center border border-white/10 ${torch ? 'bg-yellow' : 'bg-black/50'}`}
            onPress={() => setTorch(!torch)}
          >
            {torch ? (
              <Lightning size={24} color="#1D1D1D" weight="fill" />
            ) : (
              <LightningSlash size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
        {mode === 'photo' && (
          <View 
            style={{ paddingBottom: insets.bottom + 40 }}
            className="absolute bottom-0 left-0 right-0 items-center"
          >
            <TouchableOpacity 
              onPress={capturePhoto}
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
      </View>
    </Modal>
  );
};
export default CameraModal;