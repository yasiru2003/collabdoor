import { supabase } from "@/integrations/supabase/client";

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
    // Generate a unique ID without uuid dependency
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const fileName = `${userId}-${uniqueId}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log(`Uploading file to ${bucket} bucket: ${filePath}`);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading ${bucket} image:`, uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    
    if (data) {
      console.log(`Successfully uploaded file, public URL: ${data.publicUrl}`);
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
    if (!url) {
      console.warn(`No URL provided for removal from ${bucket} bucket`);
      return false;
    }

    // Extract file path from URL
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    const fileName = pathSegments[pathSegments.length - 1];
    
    console.log(`Removing file from ${bucket} bucket: ${fileName}`);

    const { error } = await supabase.storage
      .from(bucket)
      .remove([fileName]);

    if (error) {
      console.error(`Error removing ${bucket} image:`, error);
      throw error;
    }
    
    console.log(`Successfully removed file from ${bucket} bucket`);
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

/**
 * Upload a project proposal file to Supabase storage
 */
export async function uploadProjectProposal(
  file: File,
  userId: string
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const fileName = `${userId}/${uniqueId}.${fileExt}`;

    console.log(`Uploading proposal to project_proposals bucket: ${fileName}`);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('project_proposals')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading project proposal:', uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data } = supabase.storage
      .from('project_proposals')
      .getPublicUrl(fileName);
    
    if (data) {
      console.log(`Successfully uploaded proposal, file path: ${fileName}`);
      return fileName; // Return the file path instead of URL for better management
    }
    return null;
  } catch (error) {
    console.error('Error uploading project proposal:', error);
    return null;
  }
}

/**
 * Get a download URL for a project proposal
 */
export async function getProjectProposalUrl(filePath: string): Promise<string | null> {
  if (!filePath) return null;
  
  try {
    const { data } = supabase.storage
      .from('project_proposals')
      .getPublicUrl(filePath);
    
    return data?.publicUrl || null;
  } catch (error) {
    console.error('Error getting proposal URL:', error);
    return null;
  }
}

/**
 * Remove a project proposal file from storage
 */
export async function removeProjectProposal(filePath: string): Promise<boolean> {
  if (!filePath) return false;

  try {
    const { error } = await supabase.storage
      .from('project_proposals')
      .remove([filePath]);

    if (error) {
      console.error('Error removing project proposal:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error removing project proposal:', error);
    return false;
  }
}
