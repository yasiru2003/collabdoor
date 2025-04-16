
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Notification } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";

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
            <h4 className="font-medium text-sm">{notification.title}</h4>
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
          <p className="text-muted-foreground text-sm mb-1">{notification.message}</p>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}
