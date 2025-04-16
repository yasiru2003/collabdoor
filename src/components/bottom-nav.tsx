
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Building,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const routes = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: BookOpen,
    },
    {
      title: "Partners",
      href: "/partners",
      icon: Users,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Organizations",
      href: "/organizations",
      icon: Building,
    },
  ];
  
  // Add admin panel if user is admin
  if (isAdmin) {
    routes.push({
      title: "Admin",
      href: "/admin",
      icon: Shield,
    });
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-14">
      <div className="grid grid-cols-5 h-full">
        {routes.slice(0, 5).map((route) => (
          <Link
            key={route.href}
            to={route.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              location.pathname === route.href
                ? "text-primary font-medium"
                : "text-muted-foreground"
            )}
          >
            <route.icon className="w-4 h-4" />
            <span className="text-[10px]">{route.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
