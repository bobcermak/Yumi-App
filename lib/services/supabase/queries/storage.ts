import supabase from "../client";

export const uploadImage = async (uri: string, path: string, bucket: string): Promise<string | null> => {
  try {
    const cleanPath = path.trim().replace(/^\/+/, '');
    const cleanBucket = bucket.trim();
    if (!cleanPath) throw new Error("Storage path is empty after cleaning");
    if (!cleanBucket) throw new Error("Bucket name is empty");
    const response = await fetch(uri);
    if (!response.ok) throw new Error(`Failed to fetch image: HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from(cleanBucket)
      .upload(cleanPath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message} (${uploadError.name || 'StorageError'})`);
    }
    const { data } = supabase.storage.from(cleanBucket).getPublicUrl(cleanPath);
    return data?.publicUrl || null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    console.error("[Storage] Critical failure in uploadImage:", message);
    throw error;
  }
};