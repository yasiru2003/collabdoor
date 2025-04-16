
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a notification for a user
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<boolean> {
  try {
    // Use a generic query to avoid type errors
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        link,
        read: false
      }) as any;

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
}

/**
 * Creates notifications for multiple users with the same content
 */
export async function createMultipleNotifications(
  userIds: string[],
  title: string,
  message: string,
  link?: string
): Promise<boolean> {
  try {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      link,
      read: false
    }));

    // Use a generic query to avoid type errors
    const { error } = await supabase
      .from('notifications')
      .insert(notifications) as any;

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating multiple notifications:', error);
    return false;
  }
}

/**
 * Creates notifications for all partners in a project
 */
export async function notifyProjectPartners(
  projectId: string,
  title: string,
  message: string,
  link?: string
): Promise<boolean> {
  try {
    // Get all partners for the project
    const { data: partnerships, error: fetchError } = await supabase
      .from('partnerships')
      .select('partner_id')
      .eq('project_id', projectId);

    if (fetchError) throw fetchError;
    
    if (!partnerships || partnerships.length === 0) {
      return true; // No partners to notify
    }

    // Create notifications for all partners
    const partnerIds = partnerships.map(p => p.partner_id);
    return await createMultipleNotifications(partnerIds, title, message, link);
  } catch (error) {
    console.error('Error notifying project partners:', error);
    return false;
  }
}
