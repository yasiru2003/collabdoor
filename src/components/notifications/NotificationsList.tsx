
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, UserCheck, UserPlus, MessageSquare } from "lucide-react";

interface NotificationsListProps {
  notifications: Notification[];
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  onClose?: () => void;
}

export function NotificationsList({ 
  notifications, 
  loading, 
  markAsRead,
  onClose
}: NotificationsListProps) {
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Navigate if there's a link
    if (notification.link) {
      navigate(notification.link);
      if (onClose) onClose();
    }
  };

  const getNotificationIcon = (title: string) => {
    if (title.includes("Join Request")) return <UserPlus className="h-5 w-5 text-blue-500" />;
    if (title.includes("Approved")) return <Check className="h-5 w-5 text-green-500" />;
    if (title.includes("message")) return <MessageSquare className="h-5 w-5 text-indigo-500" />;
    return <Bell className="h-5 w-5 text-primary" />;
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No notifications</p>
      </div>
    );
  }

  return (
    <div className="max-h-64 md:max-h-80 overflow-y-auto">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notification.read ? 'bg-background' : 'bg-muted/30'}`}
          onClick={() => handleNotificationClick(notification)}
        >
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-start gap-2">
              {getNotificationIcon(notification.title)}
              <h4 className="font-medium text-sm">{notification.title}</h4>
            </div>
            {!notification.read && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(notification.id);
                }}
                className="h-6 px-2 text-xs"
              >
                Mark read
              </Button>
            )}
          </div>
          <p className="text-muted-foreground text-sm mb-1 pl-7">{notification.message}</p>
          <span className="text-xs text-muted-foreground pl-7">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
