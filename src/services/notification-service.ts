
import { supabase } from "@/integrations/supabase/client";

/**
 * Sends notification about a new message
 */
export async function notifyNewMessage(recipientId: string, senderId: string, message: string) {
  try {
    // Get sender profile to use their name
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", senderId)
      .single();

    const senderName = senderProfile?.name || senderProfile?.email || "Someone";
    
    // Create notification
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: recipientId,
        title: "New message",
        message: `${senderName}: ${message.length > 50 ? message.substring(0, 50) + '...' : message}`,
        link: "/messages",
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Sends notification about a new project applicant
 */
export async function notifyNewApplicant(
  organizerId: string, 
  applicantId: string, 
  projectTitle: string,
  organizationName?: string | null
) {
  try {
    // Get applicant profile
    const { data: applicantProfile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", applicantId)
      .single();

    const applicantName = applicantProfile?.name || applicantProfile?.email || "Someone";
    
    // Create message with or without organization
    const message = organizationName 
      ? `${applicantName} (from ${organizationName}) has applied to your project "${projectTitle}"`
      : `${applicantName} has applied to your project "${projectTitle}"`;
    
    // Create notification
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: organizerId,
        title: "New Project Application",
        message,
        link: `/projects/${projectTitle}?tab=applications`,
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Sends notification about a partnership status change
 */
export async function notifyPartnershipChange(
  userId: string,
  status: string,
  projectTitle: string,
  projectId: string
) {
  try {
    const title = status === "approved" 
      ? "Partnership Approved" 
      : "Partnership Rejected";
      
    const message = status === "approved"
      ? `Your partnership request for project "${projectTitle}" has been approved.`
      : `Your partnership request for project "${projectTitle}" has been rejected.`;
      
    const link = status === "approved" ? `/projects/${projectId}` : null;
    
    // Create notification
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        link,
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Notifies users about organization join request status changes
 */
export async function notifyOrganizationJoinRequest(
  userId: string,
  organizationName: string,
  status: "approved" | "rejected",
  organizationId?: string
) {
  try {
    const title = status === "approved" 
      ? "Organization Join Request Approved" 
      : "Organization Join Request Rejected";
      
    const message = status === "approved"
      ? `Your request to join ${organizationName} has been approved.`
      : `Your request to join ${organizationName} has been rejected.`;
      
    const link = status === "approved" && organizationId ? `/organizations/${organizationId}` : null;
    
    // Create notification
    const { error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        message,
        link,
        read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
}

/**
 * Notifies project partners about project status changes or updates
 */
export async function notifyProjectPartners(
  projectId: string,
  title: string,
  message: string,
  link?: string | null
) {
  try {
    // Get all partners for this project with approved status
    const { data: partners, error: partnersError } = await supabase
      .from("project_applications")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("status", "approved");

    if (partnersError) throw partnersError;
    
    if (!partners || partners.length === 0) {
      console.log("No partners to notify for project:", projectId);
      return true;
    }
    
    // Create notifications for all partners
    const notifications = partners.map(partner => ({
      user_id: partner.user_id,
      title,
      message,
      link: link || null,
      read: false
    }));
    
    console.log(`Creating ${notifications.length} partner notifications`);
    
    // Insert notifications directly to overcome potential function timeout
    const { error } = await supabase
      .from("notifications")
      .insert(notifications);

    if (error) {
      console.error("Error creating partner notifications:", error);
      throw error;
    }
    
    console.log("Successfully created partner notifications");
    return true;
  } catch (error) {
    console.error("Error notifying project partners:", error);
    return false;
  }
}
