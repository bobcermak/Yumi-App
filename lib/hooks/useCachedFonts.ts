import { 
  useFonts, 
  Nunito_200ExtraLight, Nunito_200ExtraLight_Italic,
  Nunito_300Light, Nunito_300Light_Italic,
  Nunito_400Regular, Nunito_400Regular_Italic,
  Nunito_500Medium, Nunito_500Medium_Italic,
  Nunito_600SemiBold, Nunito_600SemiBold_Italic,
  Nunito_700Bold, Nunito_700Bold_Italic,
  Nunito_800ExtraBold, Nunito_800ExtraBold_Italic,
  Nunito_900Black, Nunito_900Black_Italic 
} from '@expo-google-fonts/nunito';

export const useCachedFonts = () => {
  return useFonts({
    "Nunito-200": Nunito_200ExtraLight,
    "Nunito-200i": Nunito_200ExtraLight_Italic,
    "Nunito-300": Nunito_300Light,
    "Nunito-300i": Nunito_300Light_Italic,
    "Nunito-400": Nunito_400Regular,
    "Nunito-400i": Nunito_400Regular_Italic,
    "Nunito-500": Nunito_500Medium,
    "Nunito-500i": Nunito_500Medium_Italic,
    "Nunito-600": Nunito_600SemiBold,
    "Nunito-600i": Nunito_600SemiBold_Italic,
    "Nunito-700": Nunito_700Bold,
    "Nunito-700i": Nunito_700Bold_Italic,
    "Nunito-800": Nunito_800ExtraBold,
    "Nunito-800i": Nunito_800ExtraBold_Italic,
    "Nunito-900": Nunito_900Black,
    "Nunito-900i": Nunito_900Black_Italic 
  });
};