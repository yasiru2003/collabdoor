
import { ReactNode, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        {!isMobile && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
        <main className="flex-1 p-4 md:p-8 bg-muted/30 pb-20 md:pb-8">
          {children}
        </main>
      </div>
      {isMobile && <BottomNav />}
    </div>
  );
}
