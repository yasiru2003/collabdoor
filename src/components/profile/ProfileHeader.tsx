
import React from "react";

interface ProfileHeaderProps {
  title: string;
  description: string;
  image?: string;
}

export function ProfileHeader({ title, description, image }: ProfileHeaderProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      {image && (
        <div className="h-16 w-16 rounded-full overflow-hidden bg-muted">
          <img src={image} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
