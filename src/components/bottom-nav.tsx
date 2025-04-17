
import { Home, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const location = useLocation();
  
  const routes = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Home,
      active: location.pathname === "/dashboard",
    },
    {
      href: "/organizations",
      label: "Organizations",
      icon: Building2,
      active: location.pathname.startsWith("/organizations"),
    }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 z-50 w-full bg-background border-t flex items-center justify-around p-2">
      {routes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          className={cn(
            "flex flex-col items-center justify-center px-2 py-1 text-xs gap-1",
            route.active ? "text-primary" : "text-muted-foreground"
          )}
        >
          <route.icon className="h-5 w-5" />
          <span>{route.label}</span>
        </Link>
      ))}
    </div>
  );
}
