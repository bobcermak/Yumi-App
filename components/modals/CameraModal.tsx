import { Icon, Toast, Button } from "@/components";
import { requestCameraAccess, takeCameraPhoto } from "@/lib/helpers/camera";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ArrowCounterClockwise, CaretLeft, Lightning, LightningSlash, Sparkle } from "phosphor-react-native";
import { useEffect, useRef, useState, type FC } from "react";
import { ActivityIndicator, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, useAnimatedProps, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MagicParticles from "./MagicParticles";
import ScanLine from "./ScanLine";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const AnimatedCameraView = Animated.createAnimatedComponent(CameraView);
type CameraModalProps = {
  visible: boolean,
  onClose: () => void,
  mode: "barcode" | "photo" | "magic",
  onBarcodeScanned?: (data: string) => void,
  onCapture?: (uri: string, base64?: string) => void,
  isProcessing?: boolean,
  capturedImageUri?: string | null,
  pendingPhotoUri?: string | null,
  onConfirm?: (scale: number, translateX: number, translateY: number) => void,
  onRetake?: () => void,
  title?: string,
  overlayText?: string,
  asModal?: boolean,
  hideHeader?: boolean,
};
const CameraModal: FC<CameraModalProps> = ({ visible, onClose, mode, onBarcodeScanned, onCapture, isProcessing = false, capturedImageUri, pendingPhotoUri, onConfirm, onRetake, title, overlayText, asModal = true, hideHeader = false }) => {
  const insets = useSafeAreaInsets();
  const { toast } = useIndexContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const scannedRef = useRef<boolean>(false);
  const cameraRef = useRef<CameraView>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const cameraZoom = useSharedValue(0);
  const savedCameraZoom = useSharedValue(0);

  const cameraPinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      cameraZoom.value = Math.min(1, Math.max(0, savedCameraZoom.value + (e.scale - 1) * 0.15));
    })
    .onEnd(() => {
      savedCameraZoom.value = cameraZoom.value;
    });
  const animatedCameraProps = useAnimatedProps(() => ({ zoom: cameraZoom.value }));
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 6));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });
  const panGesture = Gesture.Pan()
    .minPointers(1)
    .onUpdate((e) => {
      const maxX = Math.max(0, (scale.value - 1) * SCREEN_W / 2);
      const maxY = Math.max(0, (scale.value - 1) * SCREEN_H / 2);
      translateX.value = Math.max(-maxX, Math.min(maxX, savedTranslateX.value + e.translationX));
      translateY.value = Math.max(-maxY, Math.min(maxY, savedTranslateY.value + e.translationY));
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));
  const isConfirming = mode === "magic" && !!pendingPhotoUri && !isProcessing;
  const isScanning   = mode === "magic" && isProcessing && !!capturedImageUri;
  useEffect(() => {
    if (isConfirming) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    }
  }, [isConfirming]);
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if ((mode === "barcode" || mode === "magic") && onBarcodeScanned && !scannedRef.current) {
      scannedRef.current = true;
      onBarcodeScanned(data);
    }
  };
  const handleShutter = async () => {
    if (!onCapture || isCapturing) return;
    setIsCapturing(true);
    await takeCameraPhoto(cameraRef, mode, (uri, base64) => {
      setIsCapturing(false);
      onCapture(uri, base64);
    });
    setIsCapturing(false);
  };
  useEffect(() => {
    if (visible) {
      scannedRef.current = false;
      requestCameraAccess(permission, requestPermission, onCloseRef.current);
    }
  }, [visible, permission?.granted]);
  if (!permission?.granted && visible) return null;
  const bottomText = overlayText ?? (mode === "barcode" ? "Align barcode within the frame" : "Center item in the frame");
  const content = (
    <View className="flex-1">
      {isScanning ? (
        <Image
          source={{ uri: capturedImageUri! }}
          style={[StyleSheet.absoluteFill, { opacity: 0.5 }]}
          resizeMode="cover"
        />
      ) : !isConfirming ? (
        <GestureDetector gesture={cameraPinchGesture}>
          <AnimatedCameraView
            ref={cameraRef}
            animatedProps={animatedCameraProps}
            autofocus="off"
            onBarcodeScanned={mode !== "photo" ? handleBarcodeScanned : undefined}
            barcodeScannerSettings={mode !== "photo" ? { barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] } : undefined}
            enableTorch={torch}
            style={StyleSheet.absoluteFill}
          />
        </GestureDetector>
      ) : null}
      {isConfirming && (
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={StyleSheet.absoluteFill}>
            <Animated.Image
              source={{ uri: pendingPhotoUri! }}
              style={[{ width: "100%", height: "100%", opacity: 0.88 }, imageAnimatedStyle]}
              resizeMode="cover"
            />
          </Animated.View>
        </GestureDetector>
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
      {isScanning && (
        <View className="absolute inset-0 pointer-events-none">
          <ScanLine />
          <MagicParticles />
          <View className="absolute inset-0 items-center justify-center">
            <Animated.View
              entering={FadeIn.duration(250)}
              className="items-center gap-3 px-8 py-6 rounded-[24px] border border-white/10"
              style={{ backgroundColor: "rgba(18,18,18,0.78)" }}
            >
              <ActivityIndicator size="large" color="#C5E384" />
              <Text className="text-white font-nunito-700 text-base">Analyzing food...</Text>
            </Animated.View>
          </View>
        </View>
      )}
      {isCapturing && (
        <Animated.View
          entering={FadeIn.duration(250)}
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <ActivityIndicator size="large" color="#C5E384" />
          <Text className="text-white font-nunito-600 text-sm mt-3">Processing photo...</Text>
        </Animated.View>
      )}
      {isConfirming && (
        <Animated.View entering={FadeIn.duration(250)} className="absolute inset-0" pointerEvents="box-none">
          <View
            className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          />
          <View
            className="absolute bottom-0 left-0 right-0 h-72 pointer-events-none"
            style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          />
          <View className="absolute inset-0 items-center justify-center pointer-events-none">
            <View style={{ width: 280, height: 280 }}>
              <View className="absolute top-0 left-0 w-10 h-10 border-t-[3px] border-l-[3px] border-yellow rounded-tl-[16px]" />
              <View className="absolute top-0 right-0 w-10 h-10 border-t-[3px] border-r-[3px] border-yellow rounded-tr-[16px]" />
              <View className="absolute bottom-0 left-0 w-10 h-10 border-b-[3px] border-l-[3px] border-yellow rounded-bl-[16px]" />
              <View className="absolute bottom-0 right-0 w-10 h-10 border-b-[3px] border-r-[3px] border-yellow rounded-br-[16px]" />
            </View>
          </View>
          <Animated.View
            entering={FadeInDown.delay(80).duration(250)}
            className="absolute items-center self-center"
            style={{ top: SCREEN_H * 0.38 }}
            pointerEvents="none"
          >
            <View
              className="flex-row items-center gap-2 px-4 py-3 rounded-[20px] border border-white/10"
              style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            >
              <Sparkle size={18} color="#C5E384" weight="regular"/>
              <Text className="text-white font-nunito-700 text-base">Scan this?</Text>
            </View>
          </Animated.View>
          <Animated.View
            entering={FadeInUp.delay(100).duration(250)}
            className="absolute bottom-0 left-0 right-0 flex-row gap-4 px-8"
            style={{ paddingBottom: insets.bottom + 36 }}
          >
            <Button
              onPress={onRetake}
              icon={<ArrowCounterClockwise size={20} color="white" weight="regular"/>}
              className="flex-1 py-4 bg-white/10 border border-white/20"
              textClassName="text-white"
              shadowColor="transparent"
            >
              Retake
            </Button>
            <Button
              onPress={() => onConfirm?.(scale.value, translateX.value, translateY.value)}
              icon={<Sparkle size={20} color="#1D1D1D" weight="regular"/>}
              className="flex-1 py-4"
              shadowColor="#C5E384"
            >
              Confirm
            </Button>
          </Animated.View>
          <View style={{ paddingTop: insets.top + 12 }} className="absolute top-0 left-0 right-0 px-6">
            <Icon className="w-12 h-12 bg-black/50 border border-white/10" onPress={onRetake ?? onClose} shadowColor="#000000">
              <CaretLeft size={24} color="white"/>
            </Icon>
          </View>
        </Animated.View>
      )}
      {!isConfirming && !isScanning && !hideHeader && (
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
            onPress={() => setTorch((v) => !v)}
            shadowColor={torch ? "#C5E384" : "#000000"}
          >
            {torch ? <Lightning size={24} color="#1D1D1D" weight="fill" /> : <LightningSlash size={24} color="white" />}
          </Icon>
        </View>
      )}
      {!isConfirming && !isScanning && hideHeader && (
        <View
          style={{ paddingTop: insets.top + 12, position: "absolute", top: 0, right: 0 }}
          className="px-6"
        >
          <Icon
            className={`w-12 h-12 border border-white/10 ${torch ? "bg-yellow" : "bg-black/50"}`}
            onPress={() => setTorch((v) => !v)}
            shadowColor={torch ? "#C5E384" : "#000000"}
          >
            {torch ? <Lightning size={24} color="#1D1D1D" weight="fill" /> : <LightningSlash size={24} color="white" />}
          </Icon>
        </View>
      )}
      {isScanning && (
        <View style={{ paddingTop: insets.top + 12 }} className="absolute top-0 left-0 right-0 px-6">
          <Icon className="w-12 h-12 bg-black/50 border border-white/10" onPress={onClose} shadowColor="#000000">
            <CaretLeft size={24} color="white" />
          </Icon>
        </View>
      )}
      {mode !== "barcode" && !isConfirming && !isScanning && (
        <View
          style={{ paddingBottom: insets.bottom + 32 }}
          className="absolute bottom-0 left-0 right-0 items-center gap-4"
        >
          <Text className="text-white font-nunito-600 bg-black/50 px-4 py-2 rounded-[20px] overflow-hidden border border-white/10">
            {bottomText}
          </Text>
          <TouchableOpacity
            onPress={handleShutter}
            disabled={isCapturing || isProcessing}
            className="w-20 h-20 items-center justify-center"
          >
            <View className="w-16 h-16 rounded-full border-4 border-white items-center justify-center">
              {isCapturing ? (
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
      <Toast toast={toast}/>
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