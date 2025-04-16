
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "./ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header({ mobileMenuToggle }: { mobileMenuToggle?: () => void }) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    unreadCount 
  } = useNotifications();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-xl bg-primary text-primary-foreground px-2 py-1 rounded">
              CD
            </div>
            {!isMobile && <span className="font-bold text-xl">CollabDoor</span>}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="text-xs h-8"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id} 
                          className={`p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${notification.read ? 'bg-background' : 'bg-muted/30'}`}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => markAsRead(notification.id)}
                                className="h-6 px-2 text-xs"
                              >
                                Mark read
                              </Button>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm mb-1">{notification.message}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No notifications
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.user_metadata?.profile_image || ""} alt={user.user_metadata?.name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {(user.user_metadata?.name || user.email || "User")?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.user_metadata?.name || user.email}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer w-full">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer w-full">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer w-full">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer w-full">Admin Panel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {!isMobile && (
                <Button variant="ghost" asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              )}
              <Button asChild>
                <Link to="/signup">{isMobile ? "Sign Up" : "Sign Up"}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
