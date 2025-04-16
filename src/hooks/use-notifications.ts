
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";
import { toast } from "@/components/ui/sonner";

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
        // Use any type to avoid TypeScript errors with the notifications table
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }) as any;

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();

    // Setup real-time subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('New notification:', payload);
        // Show a toast notification
        toast({
          title: payload.new.title,
          description: payload.new.message,
        });
        
        // Add to notifications array
        setNotifications(prev => [payload.new as Notification, ...prev]);
      })
      .subscribe();

    // Also listen for updates (marking as read)
    const updateChannel = supabase
      .channel('public:notifications:updates')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Updated notification:', payload);
        setNotifications(prev => 
          prev.map(n => n.id === payload.new.id ? {...n, ...payload.new} : n)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(updateChannel);
    };
  }, [user]);

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      if (!user) return;

      // Use any type to avoid TypeScript errors
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id) as any;

      if (error) throw error;

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      if (!user) return;

      // Use any type to avoid TypeScript errors
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .in('id', notifications.filter(n => !n.read).map(n => n.id)) as any;

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
