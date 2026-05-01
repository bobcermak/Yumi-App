import supabase from "./client";
import { Platform } from "react-native";

export const uploadImage = async (uri: string, path: string, bucket: string): Promise<string | null> => {
  try {
    const cleanPath = path.trim().replace(/^\//, '');
    const cleanBucket = bucket.trim();
    const formData = new FormData();
    const fileName = cleanPath.split('/').pop() || "image.webp";
    const finalUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    formData.append('file', {
      uri: finalUri,
      name: fileName,
      type: 'image/webp',
    } as any);
    const { error } = await supabase.storage
      .from(cleanBucket)
      .upload(cleanPath, formData, {
        contentType: 'image/webp',
        upsert: true
      });
    if (error) {
      console.error("[Storage] Upload Error:", error);
      return null;
    }
    const { data } = supabase.storage
      .from(cleanBucket)
      .getPublicUrl(cleanPath);
    return data?.publicUrl || null;
  } catch (error) {
    console.error("[Storage] Unexpected Exception:", error);
    return null;
  }
};