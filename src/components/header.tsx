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
import { NotificationsList } from "./notifications/NotificationsList";

export function Header() {
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
      <div className="container flex items-center justify-between h-14 md:h-16 mx-auto px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-lg md:text-xl bg-primary text-primary-foreground px-2 py-1 rounded">
              CD
            </div>
            {!isMobile && <span className="font-bold text-xl">CollabDoor</span>}
          </Link>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {user ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 md:h-10 md:w-10">
                    <Bell className="h-4 w-4 md:h-5 md:w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 md:w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-3 md:p-4 border-b">
                    <h3 className="font-semibold text-sm md:text-base">Notifications</h3>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={markAllAsRead}
                        className="text-xs h-7 md:h-8"
                      >
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <NotificationsList 
                    notifications={notifications}
                    loading={false}
                    markAsRead={markAsRead}
                    onClose={() => document.body.click()} // Close popover
                  />
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer h-8 w-8 md:h-10 md:w-10">
                    <AvatarImage src={user.user_metadata?.profile_image || ""} alt={user.user_metadata?.name || "User"} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                      {(user.user_metadata?.name || user.email || "User")?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-sm md:text-base">{user.user_metadata?.name || user.email}</DropdownMenuLabel>
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
                <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                  <Link to="/login">Log In</Link>
                </Button>
              )}
              <Button size={isMobile ? "sm" : "default"} asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
