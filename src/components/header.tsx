
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from "react";
import { User, UserRole } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { Bell, Menu } from "lucide-react";

// Mock user, will be replaced with auth context
const mockUser: User = {
  id: "1",
  email: "user@example.com",
  name: "John Doe",
  role: "partner",
  profileImage: "",
};

export function Header({ mobileMenuToggle }: { mobileMenuToggle?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("partner");

  useEffect(() => {
    // Simulate auth loading
    const timer = setTimeout(() => {
      setUser(mockUser);
      setRole(mockUser.role);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleRole = () => {
    setRole(role === "partner" ? "organizer" : "partner");
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <div className="flex items-center gap-2">
          {mobileMenuToggle && (
            <Button variant="ghost" size="icon" onClick={mobileMenuToggle} className="md:hidden">
              <Menu />
            </Button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="font-bold text-xl bg-primary text-primary-foreground px-2 py-1 rounded">
              CD
            </div>
            <span className="font-bold text-xl hidden sm:block">CollabDoor</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/projects" className="text-muted-foreground hover:text-foreground">
            Projects
          </Link>
          <Link to="/partners" className="text-muted-foreground hover:text-foreground">
            Partners
          </Link>
          <Link to="/messages" className="text-muted-foreground hover:text-foreground">
            Messages
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
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
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 flex justify-between items-center">
                    <span className="text-sm">Switch to {role === "partner" ? "Organizer" : "Partner"}</span>
                    <Switch checked={role === "organizer"} onCheckedChange={toggleRole} />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
