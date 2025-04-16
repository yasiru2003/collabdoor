
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image to a specified Supabase storage bucket
 */
export async function uploadImage(
  file: File,
  bucket: 'profiles' | 'projects' | 'organizations',
  userId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    if (data) {
      return data.publicUrl;
    }
    return null;
  } catch (error) {
    console.error(`Error uploading ${bucket} image:`, error);
    return null;
  }
}

/**
 * Removes an image from a specified Supabase storage bucket
 */
export async function removeImage(
  url: string,
  bucket: 'profiles' | 'projects' | 'organizations'
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    
    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error removing ${bucket} image:`, error);
    return false;
  }
}

/**
 * Gets the default image for a given entity type
 */
export function getDefaultImage(type: 'profile' | 'project' | 'organization'): string {
  const defaults = {
    profile: '/placeholder.svg',
    project: '/placeholder.svg',
    organization: '/placeholder.svg'
  };
  
  return defaults[type];
}
