import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FlipType } from 'expo-image-manipulator';
import { Alert } from 'react-native';

export const requestImagePermissions = async (type: 'camera' | 'library') => {
  if (type === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }
};
export const optimizeImage = async (uri: string, isProfile: boolean = false, fromCamera: boolean = false) => {
  try {
    const actions: ImageManipulator.Action[] = [
      { resize: { width: 1200 } },
    ];
    if (fromCamera) {
      actions.push({ flip: FlipType.Horizontal });
    }
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { 
        compress: 0.75,
        format: ImageManipulator.SaveFormat.WEBP
      }
    );
    return manipResult.uri;
  } catch (error) {
    console.error("Image Optimization Error:", error);
    return uri;
  }
};
export const pickImageHelper = async (
  type: 'camera' | 'library',
  options: {
    isProfile: boolean;
    limit?: number;
  }
) => {
  const hasPermission = await requestImagePermissions(type);
  if (!hasPermission) {
    Alert.alert('Permission required', `We need access to your ${type === 'camera' ? 'camera' : 'gallery'} to upload photos.`);
    return null;
  }
  const pickerOptions: ImagePicker.ImagePickerOptions = {
    allowsEditing: options.isProfile,
    aspect: options.isProfile ? [1, 1] : [3, 4],
    quality: 1,
  };
  let result;
  if (type === 'camera') {
    result = await ImagePicker.launchCameraAsync(pickerOptions);
  } else {
    result = await ImagePicker.launchImageLibraryAsync({
      ...pickerOptions,
      allowsMultipleSelection: !options.isProfile,
      selectionLimit: options.limit || 1,
    });
  }
  if (!result.canceled && result.assets && result.assets.length > 0) {
    const optimizedUris = await Promise.all(
      result.assets.map(async (asset) => await optimizeImage(asset.uri, options.isProfile, type === 'camera'))
    );
    return optimizedUris;
  }
  return null;
};