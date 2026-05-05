import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { MagnifyingGlass, Camera, Sparkle } from "phosphor-react-native";
import { type FC, useRef, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { pickImageHelper } from "@/lib/helpers/imageHelpers";

type SearchInputProps = {
  placeholder?: string;
  showCamera?: boolean;
  onSearchPress?: () => void;
  onCameraPress?: () => void;
  className?: string;
  isInput?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
}
const SearchInput: FC<SearchInputProps> = ({ placeholder = "Search For Food", showCamera = true, onSearchPress, onCameraPress, className = "", isInput = false, autoFocus = false, value, onChangeText}) => {
  //Router
  const router = useRouter();
  //Refs
  const inputRef = useRef<TextInput>(null);
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
  //Functions
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
            params: { photoUri: photos[0] }
        });
    }
  };
  const Content = (
    <View 
      className="flex-row items-center justify-between bg-white/5 border border-white/10 h-16 pl-5 pr-6 rounded-[20px]"
      style={{
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 5
      }}
    >
      <View className="flex-row items-center gap-2 flex-1">
        <MagnifyingGlass size={24} color="white" weight="regular"/>
        {isInput ? (
          <TextInput
            ref={inputRef}
            className="text-white text-base font-nunito-600 flex-1 h-full"
            placeholder={placeholder}
            placeholderTextColor="#FFFFFF66"
            autoFocus={autoFocus}
            value={value}
            onChangeText={onChangeText}
          />
        ) : (
          <Text className="text-white/40 text-base font-nunito-600">{placeholder}</Text>
        )}
      </View>
      {showCamera && (
        <TouchableOpacity 
          onPress={handleDefaultCameraPress}
          className="flex-row items-center"
        >
          <View className="relative">
            <Camera size={24} color="#FFFFFF80" weight="regular"/>
            <View className="absolute -top-1 -right-2">
                <Sparkle size={12} color="#FFFFFF80" weight="fill"/>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
  return (
    <View className={`w-full ${className}`}>
      {isInput ? (
        Content
      ) : (
        <TouchableOpacity 
          activeOpacity={0.25}
          onPress={() => handlePress(onSearchPress)}
        >
          {Content}
        </TouchableOpacity>
      )}
    </View>
  );
};
export default SearchInput;