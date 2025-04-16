
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Users, 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Building,
  X,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SidebarLink = ({
  to,
  icon: Icon,
  children,
  isActive = false,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive?: boolean;
}) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
      isActive
        ? "bg-primary/10 text-primary font-medium"
        : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{children}</span>
  </Link>
);

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-background p-4 transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between mb-8 mt-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-1 mb-6">
          <SidebarLink to="/dashboard" icon={Home} isActive={true}>
            Dashboard
          </SidebarLink>
          <SidebarLink to="/projects" icon={BookOpen}>
            Projects
          </SidebarLink>
          <SidebarLink to="/partners" icon={Users}>
            Partners
          </SidebarLink>
          <SidebarLink to="/messages" icon={MessageSquare}>
            Messages
          </SidebarLink>
          <SidebarLink to="/organizations" icon={Building}>
            Organizations
          </SidebarLink>
          {isAdmin && (
            <SidebarLink to="/admin" icon={Shield}>
              Admin Panel
            </SidebarLink>
          )}
        </div>

        <div className="mt-auto px-3 pb-4">
          <SidebarLink to="/settings" icon={Settings}>
            Settings
          </SidebarLink>
        </div>
      </aside>
    </>
  );
}
