import {
  Layout,
  FolderKanban,
  Users,
  MessageSquare,
  MessagesSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open, setOpen }: SidebarProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isMobile = useIsMobile();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Layout },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "Partners", href: "/partners", icon: Users },
    { name: "Feed", href: "/feed", icon: MessageSquare },
    { name: "Messages", href: "/messages", icon: MessagesSquare },
  ];

  const profileActions = [
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild={!isMobile}>
        {!isMobile ? (
          <div>
            <aside
              className={`fixed left-0 top-0 z-50 flex h-full w-72.5 flex-col border-r bg-background duration-300 ease-linear md:block ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="px-6 py-4">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.profile_image || ""} />
                    <AvatarFallback>
                      {user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold">{user?.user_metadata?.name || user?.email}</span>
                </Link>
              </div>

              <Separator />

              <ScrollArea className="flex-1">
                <div className="flex flex-col space-y-1 px-2 py-4">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start px-4"
                      asChild
                    >
                      <Link to={item.href} className="w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col space-y-1 px-2 py-4">
                  {profileActions.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start px-4"
                      asChild
                    >
                      <Link to={item.href} className="w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="flex items-center px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </aside>
          </div>
        ) : (
          <button>
            <aside
              className={`fixed left-0 top-0 z-50 flex h-full w-72.5 flex-col border-r bg-background duration-300 ease-linear md:block ${
                open ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <div className="px-6 py-4">
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.profile_image || ""} />
                    <AvatarFallback>
                      {user?.email?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-bold">{user?.user_metadata?.name || user?.email}</span>
                </Link>
              </div>

              <Separator />

              <ScrollArea className="flex-1">
                <div className="flex flex-col space-y-1 px-2 py-4">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start px-4"
                      asChild
                    >
                      <Link to={item.href} className="w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                </div>

                <Separator />

                <div className="flex flex-col space-y-1 px-2 py-4">
                  {profileActions.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start px-4"
                      asChild
                    >
                      <Link to={item.href} className="w-full">
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              <Separator />

              <div className="flex items-center px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await signOut();
                    navigate("/login");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </aside>
          </button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-72.5">
        <SheetHeader>
          <SheetTitle>Are you sure absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
