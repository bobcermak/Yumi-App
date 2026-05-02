import { Platform } from "react-native";
import supabase from "../client";

export const uploadImage = async (uri: string, path: string, bucket: string): Promise<string | null> => {
  console.log(`[Storage] Starting upload to bucket: "${bucket}", path: "${path}"`);
  try {
    const cleanPath = path.trim().replace(/^\/+/, '');
    const cleanBucket = bucket.trim();
    if (!cleanPath) throw new Error("Storage path is empty after cleaning");
    if (!cleanBucket) throw new Error("Bucket name is empty");
    const formData = new FormData();
    const fileName = cleanPath.split('/').pop() || "image.webp";
    const finalUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    formData.append('file', {
      uri: finalUri,
      name: fileName,
      type: 'image/webp',
    } as any);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(cleanBucket)
      .upload(cleanPath, formData, {
        contentType: 'image/webp',
        upsert: true
      });
    if (uploadError) {
      console.error("[Storage] Supabase Upload Error Details:", uploadError);
      throw new Error(`Upload failed: ${uploadError.message} (${uploadError.name || 'Unknown error'})`);
    }
    console.log("[Storage] Upload successful:", uploadData);
    const { data } = supabase.storage
      .from(cleanBucket)
      .getPublicUrl(cleanPath);
    return data?.publicUrl || null;
  } catch (error: any) {
    console.error("[Storage] Critical failure in uploadImage:", error);
    throw error;
  }
};