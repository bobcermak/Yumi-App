import { CameraModal, Icon } from "@/components";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import { useMagicScan } from "@/lib/hooks/useMagicScan";
import { useRouter } from "expo-router";
import { CaretDown, CaretLeft } from "phosphor-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const MagicScan = () => {
  //Router
  const router = useRouter();
  
  const [mealType, setMealType] = useState<string>(getMealTypeByTime());
  const { isProcessing, capturedUri, pendingPhoto, handleBarcodeScanned, handleCapture, handleConfirm, handleRetake } = useMagicScan(mealType, true);
  const [isMealDropdownOpen, setIsMealDropdownOpen] = useState<boolean>(false);

  const isConfirming = !!pendingPhoto && !isProcessing;
  const isScanning = isProcessing && !!capturedUri;
  const tabPosition = useSharedValue(1);
  const arrowRotation = useSharedValue(0);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPosition.value * 181 }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));
  const closeMealDropdown = () => {
    setIsMealDropdownOpen(false);
    arrowRotation.value = withTiming(0, { duration: 250 });
  };
  const toggleMealDropdown = () => {
    const next = !isMealDropdownOpen;
    setIsMealDropdownOpen(next);
    arrowRotation.value = withTiming(next ? 180 : 0, { duration: 250 });
  };
  return (
    <View style={{ flex: 1 }}>
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
        overlayText="Scan barcode or take a photo"
        asModal={false}
        hideHeader={true}
      />
      {!isConfirming && !isScanning && (
        <View
          style={{ position: "absolute", top: 56, left: 0, right: 0, zIndex: 200 }}
          pointerEvents="box-none"
        >
          <View className="flex-row w-[362px] self-center items-center justify-between py-4">
            <Icon onPress={() => router.back()} className="bg-yellow w-12 h-12">
              <CaretLeft size={24} color="#1D1D1D" weight="regular" />
            </Icon>
            <View className="relative items-center" style={{ zIndex: 300 }}>
              <TouchableOpacity onPress={toggleMealDropdown} activeOpacity={0.25} className="flex-row items-center gap-2">
                <Text className="font-nunito-700 text-xl text-white" numberOfLines={1}>{mealType}</Text>
                <Animated.View style={arrowStyle}>
                  <CaretDown size={20} color="white" weight="bold" />
                </Animated.View>
              </TouchableOpacity>
              {isMealDropdownOpen && (
                <Animated.View
                  entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(250)}
                  style={{ position: "absolute", top: 44, zIndex: 400 }}
                  className="bg-dark rounded-[15px] w-[200px] border border-white/10 overflow-hidden"
                >
                  {MEAL_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type} activeOpacity={0.25}
                      onPress={() => { setMealType(type); closeMealDropdown(); }}
                      className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? "bg-yellow/30" : ""}`}
                    >
                      <Text className={`font-nunito-700 text-lg ${mealType === type ? "text-yellow" : "text-white"}`}>{type}</Text>
                    </TouchableOpacity>
                  ))}
                </Animated.View>
              )}
            </View>
            <View className="w-12" />
          </View>
          <View className="w-[362px] self-center" style={{ position: "relative" }}>
            <View className="flex-row">
              <TouchableOpacity
                className="flex-1 items-center py-3"
                activeOpacity={0.7}
                onPress={() => router.replace("/quick-add")}
              >
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                  Quick Add
                </Text>
              </TouchableOpacity>
              <View className="flex-1 items-center py-3">
                <Text style={{ fontFamily: "Nunito_700Bold", fontSize: 16, color: "#FFFFFF" }}>
                  Magic Scan
                </Text>
              </View>
            </View>
            <Animated.View style={[{ position: "absolute", bottom: 0, width: 181, height: 2, backgroundColor: "#C5E384" }, indicatorStyle]} />
          </View>
          <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
        </View>
      )}
    </View>
  );
};
export default MagicScan;