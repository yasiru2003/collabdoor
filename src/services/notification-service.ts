
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
    console.log(`Creating notification for user ${userId}: ${title}`);
    
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        link,
        read: false
      });

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
    
    console.log('Notification created successfully');
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    toast({
      title: "Notification Error",
      description: "Failed to create notification",
      variant: "destructive"
    });
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
    if (!userIds.length) {
      console.warn('No user IDs provided for notifications');
      return true;
    }
    
    console.log(`Creating notifications for ${userIds.length} users: ${title}`);
    
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      link,
      read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Error creating multiple notifications:', error);
      throw error;
    }
    
    console.log('Multiple notifications created successfully');
    return true;
  } catch (error) {
    console.error('Error creating multiple notifications:', error);
    toast({
      title: "Notification Error",
      description: "Failed to create multiple notifications",
      variant: "destructive"
    });
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
    console.log(`Notifying project partners for project ${projectId}: ${title}`);
    
    // Get all partners for the project
    const { data: partnerships, error: fetchError } = await supabase
      .from('partnerships')
      .select('partner_id')
      .eq('project_id', projectId);

    if (fetchError) {
      console.error('Error fetching project partnerships:', fetchError);
      throw fetchError;
    }
    
    if (!partnerships || partnerships.length === 0) {
      console.log('No partners found for this project');
      return true; // No partners to notify
    }

    console.log(`Found ${partnerships.length} partners to notify`);
    
    // Create notifications for all partners
    const partnerIds = partnerships.map(p => p.partner_id);
    return await createMultipleNotifications(partnerIds, title, message, link);
  } catch (error) {
    console.error('Error notifying project partners:', error);
    toast({
      title: "Notification Error",
      description: "Failed to notify project partners",
      variant: "destructive"
    });
    return false;
  }
}

// New function to notify about a new message
export async function notifyNewMessage(
  recipientId: string,
  senderId: string,
  messageContent: string
): Promise<boolean> {
  try {
    // Get sender name
    const { data: senderProfile, error: senderError } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', senderId)
      .single();

    if (senderError) {
      console.error('Error fetching sender profile:', senderError);
      throw senderError;
    }

    const senderName = senderProfile?.name || 'Someone';
    const truncatedMessage = messageContent.length > 30 
      ? `${messageContent.substring(0, 30)}...` 
      : messageContent;

    return await createNotification(
      recipientId,
      `New message from ${senderName}`,
      truncatedMessage,
      `/messages`
    );
  } catch (error) {
    console.error('Error notifying about new message:', error);
    return false;
  }
}

// New function to notify about partnership status changes
export async function notifyPartnershipStatus(
  userId: string,
  projectId: string,
  projectName: string,
  status: 'accepted' | 'rejected'
): Promise<boolean> {
  try {
    const title = status === 'accepted' 
      ? 'Partnership request accepted' 
      : 'Partnership request rejected';
    
    const message = status === 'accepted'
      ? `Your partnership request for "${projectName}" has been accepted!`
      : `Your partnership request for "${projectName}" has been rejected.`;

    return await createNotification(
      userId,
      title,
      message,
      `/projects/${projectId}`
    );
  } catch (error) {
    console.error('Error notifying about partnership status:', error);
    return false;
  }
}

// New function to notify project owner about partnership request
export async function notifyPartnershipRequest(
  projectOwnerId: string,
  projectId: string,
  projectName: string,
  applicantName: string
): Promise<boolean> {
  try {
    return await createNotification(
      projectOwnerId,
      'New partnership request',
      `${applicantName} wants to partner on your project "${projectName}"`,
      `/projects/${projectId}`
    );
  } catch (error) {
    console.error('Error notifying about partnership request:', error);
    return false;
  }
}
