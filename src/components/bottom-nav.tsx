import {
  Layout,
  FolderKanban,
  MessageSquare,
  Users,
  User,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const { pathname } = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Layout },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Feed", href: "/feed", icon: MessageSquare },
    { name: "Partners", href: "/partners", icon: Users },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t z-50">
      <div className="container py-2">
        <nav className="flex items-center justify-between">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
