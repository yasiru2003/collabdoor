
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    async function fetchNotifications() {
      try {
        setLoading(true);
        // Use generic query to avoid type errors with the notifications table
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as { data: Notification[] | null, error: any };

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      if (!user) return;

      // Use generic query to avoid type errors
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id) as { error: any };

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));

      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read.",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!user) return;

      // Use generic query to avoid type errors
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .in('id', notifications.filter(n => !n.read).map(n => n.id)) as { error: any };

      if (error) throw error;

      setNotifications(notifications.map(n => ({ ...n, read: true })));

      toast({
        title: "All notifications marked as read",
        description: "All notifications have been marked as read.",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  };
}
