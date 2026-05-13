import { CameraModal } from "@/components";
import { pickImageHelper } from "@/lib/helpers/imageHelpers";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { searchFoodByBarcode } from "@/lib/services/food-search/barcode";
import { useFocusEffect, useRouter } from "expo-router";
import { ArrowRight, Barcode, MagnifyingGlass, X } from "phosphor-react-native";
import { type FC, useCallback, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";

type SearchInputProps = {
  placeholder?: string,
  showCamera?: boolean,
  onSearchPress?: () => void,
  onCameraPress?: () => void,
  className?: string,
  isInput?: boolean,
  autoFocus?: boolean,
  value?: string,
  onChangeText?: (text: string) => void,
  onSubmit?: () => void,
  onClear?: () => void,
  isSubmitDisabled?: boolean
}
const SearchInput: FC<SearchInputProps> = ({ placeholder = "Search for food...", showCamera = true, onSearchPress, onCameraPress, className = "", isInput = false, autoFocus = false, value, onChangeText, onSubmit, onClear, isSubmitDisabled = false }) => {
  //Router
  const router = useRouter();
  //Hooks
  const { showToast } = useIndexContext();
  const inputRef = useRef<TextInput>(null);
  const arrowOpacity = useSharedValue(0);
  const arrowTranslateX = useSharedValue(8);
  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateX: arrowTranslateX.value }],
  }));
  const barcodeStyle = useAnimatedStyle(() => ({
    opacity: 1 - arrowOpacity.value,
    transform: [{ scale: 1 - arrowOpacity.value * 0.3 }],
  }));
  const [showScanner, setShowScanner] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  //Functions
  const handleChangeText = useCallback((text: string) => {
    onChangeText?.(text);
    const textEntered = text.length > 0;
    arrowOpacity.value = withTiming(textEntered ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
    arrowTranslateX.value = withSpring(textEntered ? 0 : 8, {
      damping: 15,
      stiffness: 180,
    });
  }, [onChangeText, arrowOpacity, arrowTranslateX]);
  const handleBarcodePress = async () => {
    setScanned(false);
    setShowScanner(true);
  };
  const handleBarCodeScanned = async (data: string) => {
    if (scanned || isSearching) return;
    setScanned(true);
    setIsSearching(true);
    setShowScanner(false);
    try {
      const result = await searchFoodByBarcode(data);
      setIsSearching(false);
      if (result) {
        router.push({
          pathname: "/search-item/[id]",
          params: { id: result.id, item: JSON.stringify(result) }
        });
      } else {
        showToast('Product not found 🥑', undefined, 'error');
      }
    } catch (err) {
      setIsSearching(false);
      showToast('Something went wrong 🥑', undefined, 'error');
      console.warn(`[BarcodeService] Error scanning:`, err);
    }
  };
  const handleClear = useCallback(() => {
    onClear?.();
    onChangeText?.("");
    arrowOpacity.value = withTiming(0, {
      duration: 200,
      easing: Easing.out(Easing.ease),
    });
    arrowTranslateX.value = withSpring(8, {
      damping: 15,
      stiffness: 180,
    });
  }, [onClear, onChangeText, arrowOpacity, arrowTranslateX]);
  useFocusEffect(
    useCallback(() => {
      if (isInput && autoFocus) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
      }
    }, [isInput, autoFocus])
  );
  const handlePress = (callback?: () => void) => {
    callback?.();
  };
  const handleDefaultCameraPress = async () => {
    if (onCameraPress) {
      onCameraPress();
      return;
    }
    const photos = await pickImageHelper('camera', { isProfile: false });
    if (photos && photos.length > 0) {
      router.push({
        pathname: "/magic-scan",
        params: { photoUri: photos[0] },
      });
    }
  };
  const Content = (
    <View
      className="flex-row items-center justify-between bg-white/5 border border-white/10 h-16 pl-5 pr-2 rounded-[20px] w-full"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 5,
      }}
    >
      {isInput ? (
        <Pressable
          className="flex-row items-center gap-2 flex-1 h-full"
          onPress={() => inputRef.current?.focus()}
        >
          <MagnifyingGlass size={24} color="#FFFFFF80" weight="regular" />
          <TextInput
            ref={inputRef}
            className="text-white text-base font-nunito-600 flex-1 h-full py-2"
            placeholder={placeholder}
            placeholderTextColor="#FFFFFF66"
            autoFocus={autoFocus}
            value={value}
            onChangeText={handleChangeText}
            onSubmitEditing={onSubmit}
            returnKeyType="search"
            style={{ textAlignVertical: 'center' }}
          />
        </Pressable>
      ) : (
        <TouchableOpacity
          activeOpacity={0.25}
          onPress={() => handlePress(onSearchPress)}
          className="flex-row items-center gap-2 flex-1 h-full"
        >
          <MagnifyingGlass size={24} color="#FFFFFF80" weight="regular" />
          <Text className="text-white/40 text-base font-nunito-600 flex-1">{placeholder}</Text>
        </TouchableOpacity>
      )}
      <View className="relative flex-row items-center -ml-12 pr-4">
        {isInput && (
          <Animated.View style={[arrowStyle, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.25}
            >
              <X size={22} color="#FFFFFF80" weight="bold" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSubmit}
              disabled={isSubmitDisabled}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.25}
              style={{ opacity: isSubmitDisabled ? 0.3 : 1 }}
            >
              <ArrowRight size={24} color="#C5E384" weight="bold" />
            </TouchableOpacity>
          </Animated.View>
        )}
        {!value && (
          <Animated.View style={barcodeStyle}>
            <TouchableOpacity
              onPress={handleBarcodePress}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.25}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#FFFFFF80" />
              ) : (
                <Barcode size={24} color="#FFFFFF80" weight="regular" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
  return (
    <View className={`${className || 'w-full'}`}>
      {Content}
      <CameraModal
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        mode="barcode"
        onBarcodeScanned={handleBarCodeScanned}
        isProcessing={isSearching}
        title="Scan Barcode"
        overlayText="Align barcode within the frame to scan"
      />
    </View>
  );
};
export default SearchInput;