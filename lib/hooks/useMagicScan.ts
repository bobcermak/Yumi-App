import { scanBarcode, scanPhoto } from "@/lib/helpers/magicScan";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Dimensions, Image as RNImage } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const cropToVisible = async (
  uri: string,
  scale: number,
  tx: number,
  ty: number,
): Promise<{ uri: string; base64: string }> => {
  const { width: imgW, height: imgH } = await new Promise<{ width: number; height: number }>(
    (resolve, reject) => RNImage.getSize(uri, (w, h) => resolve({ width: w, height: h }), reject),
  );
  const coverScale = Math.max(SCREEN_W / imgW, SCREEN_H / imgH);
  const displayW = imgW * coverScale;
  const displayH = imgH * coverScale;
  const visibleW = SCREEN_W / scale;
  const visibleH = SCREEN_H / scale;
  const centerX = displayW / 2 - tx / scale;
  const centerY = displayH / 2 - ty / scale;
  const originX = Math.round(Math.max(0, (centerX - visibleW / 2) / coverScale));
  const originY = Math.round(Math.max(0, (centerY - visibleH / 2) / coverScale));
  const cropW = Math.round(Math.min(imgW - originX, visibleW / coverScale));
  const cropH = Math.round(Math.min(imgH - originY, visibleH / coverScale));
  const result = await manipulateAsync(
    uri,
    [
      { crop: { originX, originY, width: cropW, height: cropH } },
      { resize: { width: 1024 } },
    ],
    { compress: 0.85, format: SaveFormat.JPEG, base64: true },
  );
  return { uri: result.uri, base64: result.base64! };
};
export const useMagicScan = (
  mealType?: string,
  replaceNavigation = false,
  onBeforeNavigate?: () => void,
) => {
  const router = useRouter();
  const { showToast } = useIndexContext();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<{ uri: string; base64?: string } | null>(null);
  const pendingRef = useRef<{ uri: string; base64?: string } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cancelledRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);
  const doNavigate = (fn: () => void) => {
    if (!isMountedRef.current || cancelledRef.current) return;
    onBeforeNavigate?.();
    setTimeout(() => {
      if (!isMountedRef.current || cancelledRef.current) return;
      fn();
    }, 0);
  };
  const ctx = {
    isProcessing,
    setIsProcessing: (v: boolean) => { if (isMountedRef.current) setIsProcessing(v); },
    navigateToItem: (id: string, item: string) => {
      doNavigate(() => router.replace({ pathname: "/search-item/[id]", params: { id, item, mealType: mealType ?? "" } }));
    },
    navigateToMealLog: (scanResult: string, photoUri?: string) => {
      const params = { scanResult, photoUri: photoUri ?? "", mealType: mealType ?? "" };
      doNavigate(() => {
        if (replaceNavigation) router.replace({ pathname: "/meal-log", params });
        else router.push({ pathname: "/meal-log", params });
      });
    },
    navigateBack: () => {
      if (isMountedRef.current) router.back();
    },
    showToast,
  };
  const handleConfirm = async (scale: number, translateX: number, translateY: number) => {
    const photo = pendingRef.current;
    if (!photo) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    cancelledRef.current = false;
    let finalUri = photo.uri;
    let finalBase64 = photo.base64;
    try {
      const cropped = await cropToVisible(photo.uri, scale, translateX, translateY);
      finalUri = cropped.uri;
      finalBase64 = cropped.base64;
    } catch (e) {
      console.warn("[Crop] failed, using original:", e);
    }
    if (controller.signal.aborted || cancelledRef.current) return;
    setPendingPhoto(null);
    pendingRef.current = null;
    setCapturedUri(photo.uri);
    scanPhoto(finalUri, finalBase64, ctx, controller.signal);
  };
  const handleRetake = () => {
    cancelledRef.current = true;
    abortRef.current?.abort();
    abortRef.current = null;
    pendingRef.current = null;
    if (isMountedRef.current) {
      setIsProcessing(false);
      setPendingPhoto(null);
      setCapturedUri(null);
    }
  };
  return {
    isProcessing,
    capturedUri,
    pendingPhoto,
    handleBarcodeScanned: (data: string) => scanBarcode(data, ctx),
    handleCapture: (uri: string, base64?: string) => {
      cancelledRef.current = false;
      const photo = { uri, base64 };
      setCapturedUri(uri);
      setPendingPhoto(photo);
      pendingRef.current = photo;
    },
    handleConfirm,
    handleRetake,
  };
};