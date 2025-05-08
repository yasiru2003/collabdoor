
import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

interface Banner {
  id: string;
  title: string;
  message: string;
  color: string;
  is_active: boolean;
  start_date?: string;
  end_date?: string | null;
  created_at: string;
  created_by?: string;
}

export function AnnouncementBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        // Use any type to bypass TypeScript's type checking for the newly created table
        const { data, error } = await supabase
          .from('announcement_banners' as any)
          .select('*')
          .eq('is_active', true)
          .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`);

        if (error) {
          console.error("Error fetching announcement banners:", error);
          return;
        }
        
        if (data && data.length > 0) {
          // Cast data to Banner[] to satisfy TypeScript
          setBanners(data as unknown as Banner[]);
        }
      } catch (error) {
        console.error("Error fetching announcement banners:", error);
      }
    };

    fetchBanners();

    // Rotate banners every 10 seconds if there are multiple
    const rotateInterval = setInterval(() => {
      if (banners.length > 1) {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }
    }, 10000);

    return () => clearInterval(rotateInterval);
  }, [banners.length]);

  const handleDismiss = (id: string) => {
    setDismissed((prev) => ({ ...prev, [id]: true }));
    
    // Store in local storage to remember this banner was dismissed
    const dismissedBanners = JSON.parse(localStorage.getItem("dismissedBanners") || "{}");
    dismissedBanners[id] = true;
    localStorage.setItem("dismissedBanners", JSON.stringify(dismissedBanners));
  };

  if (banners.length === 0 || dismissed[banners[currentBannerIndex]?.id]) {
    return null;
  }

  const currentBanner = banners[currentBannerIndex];
  
  // Map color names to Tailwind classes and use type assertions for proper typing
  const getVariant = (color: string) => {
    switch (color.toLowerCase()) {
      case 'red': return 'destructive';
      case 'green': return 'default'; // Changed to 'default' to match expected types
      case 'yellow': return 'default'; // Changed to 'default' to match expected types
      case 'blue':
      default: return 'default';
    }
  };

  return (
    <Alert variant={getVariant(currentBanner.color)} className="mb-4 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{currentBanner.title}</AlertTitle>
      <AlertDescription>{currentBanner.message}</AlertDescription>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2"
        onClick={() => handleDismiss(currentBanner.id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </Alert>
  );
}
