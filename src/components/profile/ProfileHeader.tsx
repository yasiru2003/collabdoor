
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileHeaderProps {
  title: string;
  description: string;
  image?: string;
}

export function ProfileHeader({ title, description, image }: ProfileHeaderProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-4">
      {image && (
        <div className={`${isMobile ? 'h-20 w-20' : 'h-16 w-16'} rounded-full overflow-hidden bg-muted shrink-0`}>
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className={`${isMobile ? 'text-center sm:text-left' : ''}`}>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
