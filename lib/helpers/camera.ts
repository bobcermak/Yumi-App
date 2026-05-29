import { CameraView } from "expo-camera";
import { Alert } from "react-native";
import type { RefObject } from "react";

export const requestCameraAccess = async (
  permission: { granted: boolean } | null,
  requestPermission: () => Promise<{ granted: boolean }>,
  onClose: () => void,
): Promise<void> => {
  if (!permission?.granted) {
    const { granted } = await requestPermission();
    if (!granted) {
      Alert.alert("Permission Required", "Camera access is needed.");
      onClose();
    }
  }
}
export const takeCameraPhoto = async (
  cameraRef: RefObject<CameraView | null>,
  mode: string,
  onCapture: (uri: string, base64?: string) => void,
): Promise<void> => {
  if (!cameraRef.current) return;
  try {
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: mode === "magic",
      shutterSound: false,
    });
    if (photo?.uri) {
      onCapture(photo.uri, photo.base64 ?? undefined);
    }
  } catch (err) {
    console.error("[Camera] takePictureAsync failed:", err);
    Alert.alert("Error", "Failed to capture photo.");
  }
}