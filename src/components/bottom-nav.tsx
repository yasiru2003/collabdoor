
import { Home, Building2, Users, MessageSquare, Bell, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";
import { useState } from "react";

export function BottomNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const routes = [
    {
      href: "/",
      label: "Home",
      icon: Home,
      active: location.pathname === "/",
    },
    {
      href: "/projects",
      label: "Projects",
      icon: Menu,
      active: location.pathname.startsWith("/projects"),
    },
    {
      href: "/organizations",
      label: "Organizations",
      icon: Building2,
      active: location.pathname.startsWith("/organizations"),
    },
    {
      href: "/partners",
      label: "Partners",
      icon: Users,
      active: location.pathname.startsWith("/partners"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageSquare,
      active: location.pathname.startsWith("/messages"),
    },
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
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="flex flex-col items-center justify-center px-2 py-1 text-xs gap-1">
            <Bell className="h-5 w-5" />
            <span>Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[300px] p-0" side="right">
          <Sidebar open={open} setOpen={setOpen} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
